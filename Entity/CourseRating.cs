using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Entity
{
    public class CourseRating
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public Guid CourseId { get; set; }
        public int Value { get; set; } // 1-5
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; }
        public Course Course { get; set; }
        public string ReviewText { get; set; }
        public int Likes { get; set; } = 0;
        public int Dislikes { get; set; } = 0;
    }
}