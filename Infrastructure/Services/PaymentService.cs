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
            StripeConfiguration.ApiKey = _config["Stripe:ClientSecret"];

            var service = new PaymentIntentService();

            var intent = new PaymentIntent();

            var total = basket.Items.Sum(item => item.Course.Price);

            long updatedTotal = (long) (total * 100);

            if(string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = updatedTotal,
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> {"card"}
                };

                intent = await service.CreateAsync(options);
                Console.WriteLine("Created PaymentIntent ID: " + intent.Id);
                // Store the intent.Id in the basket or database
            }
            else
            {
                Console.WriteLine("Updating PaymentIntent ID: " + basket.PaymentIntentId);
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = updatedTotal
                };

                await service.UpdateAsync(basket.PaymentIntentId, options);
            }

                return intent;
        }
    }
}