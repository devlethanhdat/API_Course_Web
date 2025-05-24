using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dto
{
    public class EnrollmentTrendDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public long Count { get; set; }
    }
}