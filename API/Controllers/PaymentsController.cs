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
        public async Task<ActionResult<BasketDto>> PaymentIntentAsync()
        {
            try 
            {
                var basket = await ExtractBasket(User.Identity.Name);
                if (basket == null) return NotFound();

                var intent = await _paymentService.PaymentIntentAsync(basket);
                
                // Always update with new payment intent
                basket.PaymentIntentId = intent.Id;
                basket.ClientSecret = intent.ClientSecret;

                _context.Update(basket);
                await _context.SaveChangesAsync();

                return _mapper.Map<Basket, BasketDto>(basket);
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(400, ex.Message));
            }
        }

        [Authorize]
        [HttpPost("confirm")]
        public async Task<ActionResult<Entity.Order>> ConfirmPayment([FromBody] string paymentIntentId)
        {
            try
            {
                var userId = User.Identity.Name;
                var order = await _paymentService.SaveOrderAsync(paymentIntentId, userId);

                if (order == null)
                    return BadRequest(new ApiResponse(400, "Problem saving order"));

                return order;
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