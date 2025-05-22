using System;
using System.Collections.Generic;

namespace Entity
{
    public class Order
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string Status { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }

    }
}
