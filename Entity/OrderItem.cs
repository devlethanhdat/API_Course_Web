using System;

namespace Entity
{
    public class OrderItem
    {
        public Guid OrderId { get; set; }
        public Order Order { get; set; }
        public Guid CourseId { get; set; }
        public Course Course { get; set; }
        public decimal Price { get; set; }
    }
}
