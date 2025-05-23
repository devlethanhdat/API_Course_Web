using System;
using System.Threading.Tasks;
using Entity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace Infrastructure.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;
        private readonly StoreContext _context;

        public PaymentService(IConfiguration config, StoreContext context)
        {
            _config = config;
            _context = context;
        }

        public async Task<PaymentIntent> PaymentIntentAsync(Basket basket)
        {
            var secretKey = _config["Stripe:ClientSecret"];
            StripeConfiguration.ApiKey = secretKey;
            var service = new PaymentIntentService();

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(basket.Items.Sum(item => item.Course.Price) * 100),
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" }
            };

            return await service.CreateAsync(options);
        }

        public async Task<Entity.Order> SaveOrderAsync(string paymentIntentId, string userId)
        {
            var basket = await _context.Basket
                .Include(b => b.Items)
                .ThenInclude(i => i.Course)
                .FirstOrDefaultAsync(b => b.ClientId == userId);

            if (basket == null) return null;

            // Create payment
            var payment = new StripePayment
            {
                PaymentIntentId = paymentIntentId,
                UserId = userId,
                Amount = (long)basket.Items.Sum(i => i.Course.Price),
                Status = "Completed",
                CreatedAt = DateTime.UtcNow
            };

            // Create order
            var order = new Entity.Order
            {
                UserId = userId,
                PaymentIntentId = paymentIntentId,
                Status = "Completed",
                Total = (long)basket.Items.Sum(i => i.Course.Price),
                CreatedAt = DateTime.UtcNow,
                StripePayment = payment,
                OrderItems = basket.Items.Select(item => new OrderItem
                {
                    CourseId = item.Course.Id,
                    Price = (long)item.Course.Price
                }).ToList()
            };

            try 
            {
                _context.StripePayments.Add(payment);
                _context.Orders.Add(order);
                _context.Basket.Remove(basket);
                await _context.SaveChangesAsync();
                return order;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error saving order: {ex.Message}");
            }
        }
    }
}