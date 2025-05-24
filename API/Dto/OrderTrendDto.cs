using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dto
{
    public class OrderTrendDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public long OrderCount { get; set; }
    }
}