using System;
using System.Collections.Generic;

namespace Entity
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; }
        public string Status { get; set; } // "Pending", "Completed", "Failed"
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string PaymentIntentId { get; set; }
        
        // Navigation properties
        public virtual StripePayment StripePayment { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}