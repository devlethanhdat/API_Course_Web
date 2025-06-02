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

        public async Task<PaymentIntent> PaymentIntentAsync(Basket basket, decimal discount = 0)
        {
            var total = (decimal)basket.Items.Sum(i => i.Course.Price) - discount;
            if (total < 0) total = 0;

            // Stripe yêu cầu tối thiểu 10,000 VND
            if (total < 10000) total = 10000;

            var secretKey = _config["Stripe:ClientSecret"];
            StripeConfiguration.ApiKey = secretKey;
            var service = new PaymentIntentService();

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(total * 100), // Stripe expects amount in the smallest currency unit
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" }
            };

            return await service.CreateAsync(options);
        }

        public async Task<Entity.Order> SaveOrderAsync(string paymentIntentId, string userId)
        {
            // Thêm đoạn này vào đầu hàm
            var userNameOrEmail = userId;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userNameOrEmail || u.UserName == userNameOrEmail);
            if (user == null) throw new Exception("User not found");
            var realUserId = user.Id;

            // Xác thực trạng thái payment với Stripe
            var service = new PaymentIntentService();
            var paymentIntent = await service.GetAsync(paymentIntentId);

            if (paymentIntent.Status != "succeeded")
                throw new Exception("Payment not successful!");

            var basket = await _context.Basket
                .Include(b => b.Items)
                .ThenInclude(i => i.Course)
                .FirstOrDefaultAsync(b => b.ClientId == userId);

            if (basket == null) return null;

            // Lấy discount từ basket nếu đã lưu, hoặc truyền vào hàm
            var discount = basket.Discount; // Nếu bạn đã lưu vào basket
            var total = (decimal)basket.Items.Sum(i => i.Course.Price) - discount;
            if (total < 0) total = 0;
            if (total < 10000) total = 10000;

            // Create payment
            var payment = new StripePayment
            {
                PaymentIntentId = paymentIntentId,
                UserId = userId,
                Amount = (long)total,
                Status = "Completed",
                CreatedAt = DateTime.UtcNow,
                ClientSecret = paymentIntent.ClientSecret
            };

            // Create order
            var order = new Entity.Order
            {
                UserId = userId,
                PaymentIntentId = paymentIntentId,
                Status = "Completed",
                Total = (long)total,
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

                // Sau khi tạo order thành công
                foreach (var item in basket.Items)
                {
                    // Kiểm tra nếu user chưa có khóa học này thì mới thêm
                    var exists = await _context.UserCourses.AnyAsync(uc => uc.UserId == realUserId && uc.CourseId == item.Course.Id);
                    if (!exists)
                    {
                        _context.UserCourses.Add(new UserCourse
                        {
                            UserId = realUserId,
                            CourseId = item.Course.Id,
                            // PurchasedAt = DateTime.UtcNow
                        });
                    }
                }

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