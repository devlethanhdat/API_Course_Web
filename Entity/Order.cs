using System;
using System.Collections.Generic;

namespace Entity
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; }
        public string Status { get; set; }
        public long Total { get; set; }  // Changed to long to match with Stripe
        public DateTime CreatedAt { get; set; }
        public string PaymentIntentId { get; set; }
        public StripePayment StripePayment { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
