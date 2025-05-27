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
using Google.Apis.Auth;
using System.Security.Claims;
using System.Net.Http;
using System.Text.Json;

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

        [HttpPost("google-login")]
        public async Task<ActionResult<UserDto>> GoogleLogin([FromBody] SocialLoginDto dto)
        {
            try
            {
                Console.WriteLine("Google token: " + dto.Token);
                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.Token, new GoogleJsonWebSignature.ValidationSettings());
                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = payload.Email,
                        UserName = payload.Email,
                    };
                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                        return BadRequest(new ApiResponse(400, "Cannot create user from Google account"));
                    await _userManager.AddToRoleAsync(user, "Student");
                }
                var appToken = await _tokenService.GenerateToken(user);
                return new UserDto
                {
                    Email = user.Email,
                    Token = appToken
                };
            }
            catch
            {
                return Unauthorized(new ApiResponse(401, "Invalid Google token"));
            }
        }

        [HttpPost("facebook-login")]
        public async Task<ActionResult<UserDto>> FacebookLogin([FromBody] SocialLoginDto dto)
        {
            try
            {
                using var httpClient = new HttpClient();
                var fbRes = await httpClient.GetStringAsync(
                    $"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={dto.Token}");
                var fbUser = JsonDocument.Parse(fbRes).RootElement;

                var email = fbUser.GetProperty("email").GetString();
                var name = fbUser.GetProperty("name").GetString();

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        UserName = email,
                    };
                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                        return BadRequest(new ApiResponse(400, "Cannot create user from Facebook account"));
                    await _userManager.AddToRoleAsync(user, "Student");
                }
                var appToken = await _tokenService.GenerateToken(user);
                return new UserDto
                {
                    Email = user.Email,
                    Token = appToken
                };
            }
            catch
            {
                return Unauthorized(new ApiResponse(401, "Invalid Facebook token"));
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                // Trả về lỗi chi tiết cho FE
                return BadRequest(new { errors = result.Errors.Select(e => e.Description).ToList() });
            }

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/users")]
        public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<AdminUserDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new AdminUserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    Roles = roles
                });
            }
            return Ok(userDtos);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("admin/users")]
        public async Task<ActionResult> CreateUser([FromBody] RegisterDto dto)
        {
            var user = new User { UserName = dto.Username, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));
            await _userManager.AddToRoleAsync(user, "Student");
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/users/{id}")]
        public async Task<ActionResult> UpdateUser(string id, [FromBody] AdminUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            user.UserName = dto.UserName;
            user.Email = dto.Email;
            await _userManager.UpdateAsync(user);
            // Update roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRolesAsync(user, dto.Roles);
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/users/{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            await _userManager.DeleteAsync(user);
            return Ok();
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