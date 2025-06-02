using System.Linq;
using System.Threading.Tasks;
using API.Dto;
using API.ErrorResponse;
using AutoMapper;
using Entity;
using Infrastructure;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : BaseController
    {
        private readonly PaymentService _paymentService;
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        public PaymentsController(PaymentService paymentService, StoreContext context, IMapper mapper, IConfiguration config)
        {
            _mapper = mapper;
            _context = context;
            _paymentService = paymentService;
            _config = config;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> PaymentIntentAsync([FromBody] CreatePaymentIntentDto dto)
        {
            try 
            {
               Console.WriteLine("CouponCode: " + dto?.CouponCode);
                var basket = await ExtractBasket(User.Identity.Name);
                if (basket == null) return NotFound();

                decimal discount = 0;
                if (!string.IsNullOrEmpty(dto?.CouponCode))
                {
                    var coupon = await _context.Coupons
                        .FirstOrDefaultAsync(c => c.Code == dto.CouponCode && c.IsActive && (c.ExpiryDate == null || c.ExpiryDate > DateTime.UtcNow));
                    if (coupon != null)
                    {
                        discount = coupon.DiscountAmount;
                    }
                }

                var intent = await _paymentService.PaymentIntentAsync(basket, discount);
                
                // Always update with new payment intent
                basket.PaymentIntentId = intent.Id;
                basket.ClientSecret = intent.ClientSecret;
                basket.Discount = discount;

                _context.Update(basket);
                await _context.SaveChangesAsync();

                // Trả về discount để FE hiển thị
                var basketDto = _mapper.Map<Basket, BasketDto>(basket);
                basketDto.Discount = discount;
                return basketDto;
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(400, ex.Message));
            }
        }

        [Authorize]
        [HttpPost("confirm")]
        public async Task<ActionResult<OrderDto>> ConfirmPayment([FromBody] PaymentConfirmDto dto)
        {
            try
            {
                var userId = User.Identity.Name;
                var order = await _paymentService.SaveOrderAsync(dto.PaymentIntentId, userId);

                if (order == null)
                    return BadRequest(new ApiResponse(400, "Problem saving order"));

                // Map sang DTO
                var orderDto = new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    PaymentIntentId = order.PaymentIntentId,
                    Status = order.Status,
                    Total = (long)order.Total,
                    CreatedAt = order.CreatedAt
                };

                return orderDto;
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(400, ex.Message));
            }
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