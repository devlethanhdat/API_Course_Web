using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dto
{
    public class CreatePaymentIntentDto
    {
        public string CouponCode { get; set; }
    }
}