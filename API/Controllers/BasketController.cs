using System;
using System.Linq;
using System.Threading.Tasks;
using API.Dto;
using API.ErrorResponse;
using AutoMapper;
using Entity;
using Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BasketController : BaseController
    {
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        public BasketController(StoreContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        [HttpGet]

        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await ExtractBasket(GetClientId());

            if (basket == null) return NotFound(new ApiResponse(404));

            var basketResponse = _mapper.Map<Basket, BasketDto>(basket);

            return basketResponse;
        }

        [HttpPost]

        public async Task<ActionResult<BasketDto>> AddItemToBasket(Guid courseId)
        {
            var basket = await ExtractBasket(GetClientId());

            if (basket == null) basket = CreateBasket();

            var course = await _context.Courses.FindAsync(courseId);

            if (course == null) return NotFound(new ApiResponse(404));

            basket.AddCourseItem(course);

            var basketResponse = _mapper.Map<Basket, BasketDto>(basket);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return basketResponse;

            return BadRequest(new ApiResponse(400, "Problem saving item to the Basket"));
        }

        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(Guid courseId)
        {
            var basket = await ExtractBasket(GetClientId());

            if (basket == null) return NotFound();

            basket.RemoveCourseItem(courseId);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest(new ApiResponse(400, "Problem removing item from the basket"));
        }

        [Authorize]
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearBasket()
        {
            var userId = User.Identity.Name;
            var basket = await _context.Basket.FirstOrDefaultAsync(b => b.ClientId == userId);
            if (basket == null) return NotFound();
            _context.Basket.Remove(basket);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("apply-coupon")]
        public async Task<ActionResult<decimal>> ApplyCoupon([FromBody] ApplyCouponDto dto)
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == dto.Code && c.IsActive && (c.ExpiryDate == null || c.ExpiryDate > DateTime.UtcNow));
            if (coupon == null)
                return BadRequest(new { error = "Mã giảm giá không hợp lệ hoặc đã hết hạn." });

            // Có thể lưu coupon vào basket nếu muốn, hoặc chỉ trả về discount
            return Ok(new { discount = coupon.DiscountAmount });
        }

        private Basket CreateBasket()
        {
            var clientId = User.Identity?.Name;
            if(string.IsNullOrEmpty(clientId))
            {
            clientId = Guid.NewGuid().ToString();
            var options = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(10) };
            Response.Cookies.Append("clientId", clientId, options);
            }
            var basket = new Basket { ClientId = clientId };
            _context.Basket.Add(basket);
            return basket;
        }

        private async Task<Basket> ExtractBasket(string clientId)
        {
            if(string.IsNullOrEmpty(clientId))
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

        private string GetClientId()
        {
            return User.Identity?.Name ?? Request.Cookies["clientId"];
        }

    }
}