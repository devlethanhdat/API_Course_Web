using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dto
{
    public class RateDto
    {
        public Guid CourseId { get; set; }
        public int Rating { get; set; }
        public string Review { get; set; }
    }
}