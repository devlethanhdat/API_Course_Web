using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using API.Dto;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Chart : ControllerBase
    {
        private readonly StoreContext _context;

        public Chart(StoreContext context)
        {
            _context = context;
        }

        // Controller
        [HttpGet("student-count-by-course")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<IEnumerable<CourseStudentCountDto>>> GetStudentCountByCourse()
        {
            var userId = User.Identity.Name;
            var courses = await _context.Courses
                .Where(c => c.Instructor == userId)
                .Select(c => new CourseStudentCountDto
                {
                    CourseTitle = c.Title,
                    StudentCount = c.UserCourses.Count()
                })
                .ToListAsync();

            return Ok(courses);
        }

        [HttpGet("revenue-by-course")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<IEnumerable<CourseRevenueDto>>> GetRevenueByCourse()
        {
            var userId = User.Identity.Name;
            var courses = await _context.Courses
                .Where(c => c.Instructor == userId)
                .Select(c => new CourseRevenueDto
                {
                    CourseTitle = c.Title,
                    Revenue = c.UserCourses.Count() * (long)c.Price // hoặc join với OrderItems nếu muốn chính xác hơn
                })
                .ToListAsync();

            return Ok(courses);
        }
        [HttpGet("order-trends")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<IEnumerable<OrderTrendDto>>> GetOrderTrends()
        {
            var userId = User.Identity.Name;
            var courseIds = await _context.Courses
                .Where(c => c.Instructor == userId)
                .Select(c => c.Id)
                .ToListAsync();

            var trends = await _context.Orders
                .Where(o => o.OrderItems.Any(oi => courseIds.Contains(oi.CourseId)))
                .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                .Select(g => new OrderTrendDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    OrderCount = g.LongCount()
                })
                .OrderBy(g => g.Year).ThenBy(g => g.Month)
                .ToListAsync();

            return Ok(trends);
        }
    }
}