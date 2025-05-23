using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Entity;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;

        public PaymentService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<PaymentIntent> PaymentIntentAsync(Basket basket)
        {
            try
            {
                var secretKey = _config["Stripe:ClientSecret"];
                StripeConfiguration.ApiKey = secretKey;
                var service = new PaymentIntentService();

                // Always create a new payment intent
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(basket.Items.Sum(item => item.Course.Price) * 100),
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" },
                    Metadata = new Dictionary<string, string>
                    {
                        { "basket_id", basket.Id.ToString() }
                    },
                    CaptureMethod = "automatic"
                };

                var intent = await service.CreateAsync(options);
                return intent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating payment intent: {ex.Message}");
            }
        }
    }
}