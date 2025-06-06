using System.Linq;
using System.Threading.Tasks;
using API.Dto;
using Entity;
using API.ErrorResponse;
using AutoMapper;
using Infrastructure;
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;

namespace API.Controllers
{
    public class UsersController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        public UsersController(UserManager<User> userManager, TokenService tokenService, StoreContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
            _tokenService = tokenService;
            _userManager = userManager;
        }

        [HttpPost("login")]

        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // Add logging to trace the login process
            Console.WriteLine("Attempting to log in user with email: " + loginDto.Email);

            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null) {
                Console.WriteLine("User not found.");
                return Unauthorized(new ApiResponse(401));
            }

            bool isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            Console.WriteLine("Password valid: " + isPasswordValid);

            if (!isPasswordValid) {
                return Unauthorized(new ApiResponse(401));
            }

            Console.WriteLine("Generating token for user: " + user.Email);
            var token = await _tokenService.GenerateToken(user);
            Console.WriteLine("Token generated successfully.");

            var userBasket = await ExtractBasket(user.UserName);
            var basket = await ExtractBasket(Request.Cookies["clientId"]);
            var courses = _context.UserCourses.AsQueryable();

            if (basket != null)
            {
                if (userBasket != null) _context.Basket.Remove(userBasket);
                basket.ClientId = user.UserName;
                Response.Cookies.Delete("clientId");
                await _context.SaveChangesAsync();
            }

            return new UserDto
            {
                Email = user.Email,
                Token = token,
                Basket = basket != null ? _mapper.Map<Basket, BasketDto>(basket) : _mapper.Map<Basket, BasketDto>(userBasket),
                Courses = courses.Where(x => x.UserId == user.Id).Select(u => u.Course).ToList()
            };
        }

        [HttpPost("register")]

        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            var user = new User { UserName = registerDto.Username, Email = registerDto.Email };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem();
            }

            await _userManager.AddToRoleAsync(user, "Student");

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user)
            };
        }

         [Authorize]
         [HttpPost("purchaseCourses")]
         public async Task<ActionResult> AddCourses()
         {
             var basket = await ExtractBasket(User.Identity.Name);

             var user = await _userManager.FindByNameAsync(User.Identity.Name);

            foreach(BasketItem course in basket.Items)
            {
                  var userCourse = new UserCourse
                  {
                    CourseId = course.CourseId,
                    UserId = user.Id
                  };
                    _context.UserCourses.Add(userCourse);
            }

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok();

              return BadRequest(new ApiResponse(400, "Problem adding Course"));

         }

        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var basket = await ExtractBasket(User.Identity.Name);

            var courses = _context.UserCourses.AsQueryable();

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket =  _mapper.Map<Basket, BasketDto>(basket),
                Courses = courses.Where(x => x.UserId == user.Id).Select(u => u.Course).ToList()
            };
        }

        [Authorize]
        [HttpPost("addRole")]

        public async Task<ActionResult> AddRole()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            await _userManager.AddToRoleAsync(user, "Instructor");

            return Ok();
        }

        [Authorize]
        [HttpGet("unpublishedCourses")]

        public List<Course> unpublishedCourses()
        {
            var courses = _context.Courses.Where(x => x.Instructor == User.Identity.Name).Where(x => x.Published == false).ToList();

            return courses;
        }
        private async Task<Basket> ExtractBasket(string clientId)
        {
            if (string.IsNullOrEmpty(clientId))
            {
                Response.Cookies.Delete("clientId");
                return null;
            }
            return await _context.Basket
                        .Include(b => b.Items)
                        .ThenInclude(i => i.Course)
                        .OrderBy(i => i.Id)
                        .FirstOrDefaultAsync(x => x.ClientId == clientId);

        }

    }
}