using System;

namespace Entity
{
    public class StripePayment
    {
        public string PaymentIntentId { get; set; }
        public string ClientSecret { get; set; }
        public string UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
        public string Status { get; set; } // "requires_payment_method", "succeeded", etc.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ICollection<Order> Orders { get; set; }
    }
}