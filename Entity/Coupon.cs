using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Entity
{
    public class Coupon
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public decimal DiscountAmount { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; }
    }
}