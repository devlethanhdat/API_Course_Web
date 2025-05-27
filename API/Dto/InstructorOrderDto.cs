using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dto
{
    public class InstructorOrderDto
    {
        public string OrderId { get; set; }
        public string CourseTitle { get; set; }
        public string StudentEmail { get; set; }
        public decimal Price { get; set; }
        public DateTime PurchasedAt { get; set; }
    }
}