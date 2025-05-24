using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dto
{
    public class OrderDto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; }
        public string PaymentIntentId { get; set; }
        public string Status { get; set; }
        public long Total { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}