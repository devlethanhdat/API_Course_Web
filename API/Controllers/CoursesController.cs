using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Dto;
using API.ErrorResponse;
using API.Helpers;
using AutoMapper;
using Entity;
using Entity.Interfaces;
using Entity.Specifications;
using Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class CoursesController : BaseController
    {

        private readonly IMapper _mapper;
        private readonly IGenericRepository<Course> _repository;
        private readonly StoreContext _context;

        public CoursesController(IGenericRepository<Course> repository, IMapper mapper, StoreContext context)
        {
            _context = context;
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]

        public async Task<ActionResult<Pagination<CourseDto>>> GetCourses([FromQuery] CourseParams courseParams)
        {
            var spec = new CoursesWithCategoriesSpecification(courseParams);

            var countSpec = new CoursesFiltersCountSpecification(courseParams);

            var total = await _repository.CountResultAsync(countSpec);

            var courses = await _repository.ListWithSpec(spec);

            if (courses == null) return NotFound(new ApiResponse(404));

            var data = _mapper.Map<IReadOnlyList<Course>, IReadOnlyList<CourseDto>>(courses);

            return Ok(new Pagination<CourseDto>(courseParams.PageIndex, courseParams.PageSize, total, data));
        }

        [HttpGet("{id}")]

        public async Task<ActionResult<CourseDto>> GetCourse(Guid id)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lectures)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null) return NotFound();

            Console.WriteLine($"Sections: {course.Sections.Count}");
            foreach (var section in course.Sections)
            {
                Console.WriteLine($"Section {section.Id} - Lectures: {section.Lectures.Count}");
            }

            return _mapper.Map<Course, CourseDto>(course);
        }

        [Authorize(Roles = "Instructor")]
        [HttpPost]

        public async Task<ActionResult<string>> CreateCourse([FromBody] Course course)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors
            }

            course.Instructor = User.Identity.Name;

            _context.Courses.Add(course);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return "Course Created Successfully";

            return BadRequest(new ApiResponse(400, "Problem creating Course"));
        }

        [Authorize(Roles = "Admin,Instructor")]
        [HttpPut("{id}")]
        public async Task<ActionResult<Course>> UpdateCourse(Guid id, [FromBody] Course courseUpdate)
        {
            var course = await _context.Courses.FindAsync(id);
            
            if (course == null) return NotFound(new ApiResponse(404));
            
            // Update properties
            course.Title = courseUpdate.Title;
            course.SubTitle = courseUpdate.SubTitle;
            course.Description = courseUpdate.Description;
            course.Price = courseUpdate.Price;
            course.Category = courseUpdate.Category;
            course.Level = courseUpdate.Level;
            course.Language = courseUpdate.Language;
            course.Image = courseUpdate.Image; // Thêm dòng này để cập nhật image

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok(course);

            return BadRequest(new ApiResponse(400, "Problem updating course"));
        }

        [Authorize(Roles = "Instructor")]
         [HttpPost("publish/{courseId}")]

         public async Task<ActionResult<string>> PublishCourse(Guid courseId)
         {

             var course = await _context.Courses.FindAsync(courseId);

            if(course == null) return NotFound(new ApiResponse(404));

            course.Published = true;

             var result = await _context.SaveChangesAsync() > 0;

            if(result) return "Course Published Successfully";

            return BadRequest(new ApiResponse(400, "Problem publishing the Course"));

         }
       [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id) // Đổi kiểu dữ liệu thành Guid
        {
            try 
            {
                var course = await _context.Courses.FindAsync(id);
                
                if (course == null)
                {
                    return NotFound(new { message = "Course not found" });
                }

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<InstructorStatsDto>> GetInstructorStats()
        {
            try
            {
                var userId = User.Identity.Name;
                
                // Lấy tất cả khóa học của instructor
                var instructorCourses = await _context.Courses
                    .Where(c => c.Instructor == userId)
                    .ToListAsync();

                var courseIds = instructorCourses.Select(c => c.Id).ToList();

                var totalRevenue = await _context.Orders
                    .Where(o => o.Status == "Completed")
                    .SelectMany(o => o.OrderItems)
                    .Where(oi => courseIds.Contains(oi.CourseId))
                    .SumAsync(oi => oi.Price);

                var stats = new InstructorStatsDto
                {
                    TotalCourses = instructorCourses.Count,
                    
                    // Đếm tổng số học viên (không trùng lặp)
                    TotalStudents = await _context.UserCourses
                        .Where(uc => courseIds.Contains(uc.CourseId))
                        .Select(uc => uc.UserId)
                        .Distinct()
                        .CountAsync(),
                    
                    // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
                    TotalRevenue = totalRevenue
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse(500, ex.Message));
            }
        }

        [HttpGet("enrollment-trends")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<IEnumerable<EnrollmentTrendDto>>> GetEnrollmentTrends()
        {
            var userId = User.Identity.Name;
            var instructor = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userId || u.Email == userId);
            if (instructor == null) return Unauthorized();

            var courseIds = await _context.Courses
                .Where(c => c.Instructor == userId)
                .Select(c => c.Id)
                .ToListAsync();

            var trends = await _context.UserCourses
                .Where(uc => courseIds.Contains(uc.CourseId))
                .GroupBy(uc => new { uc.PurchasedAt.Year, uc.PurchasedAt.Month })
                .Select(g => new EnrollmentTrendDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.LongCount()
                })
                .OrderBy(g => g.Year).ThenBy(g => g.Month)
                .ToListAsync();

            return Ok(trends);
        }

        [Authorize]
        [HttpPost("rate")]
        public async Task<IActionResult> RateCourse([FromBody] RateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var existing = await _context.CourseRatings.FirstOrDefaultAsync(r => r.CourseId == dto.CourseId && r.UserId == userId);
            if (existing != null)
            {
                existing.Value = dto.Rating;
                existing.ReviewText = dto.Review;
            }
            else
            {
                _context.CourseRatings.Add(new CourseRating
                {
                    CourseId = dto.CourseId,
                    UserId = userId,
                    Value = dto.Rating,
                    ReviewText = dto.Review
                });
            }
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("{id}/ratings")]
        public async Task<IActionResult> GetRatings(Guid id)
        {
            var ratings = await _context.CourseRatings.Where(r => r.CourseId == id).ToListAsync();
            var avg = ratings.Any() ? ratings.Average(r => r.Value) : 0;
            var count = ratings.Count;
            var userId = User.Identity.IsAuthenticated ? User.FindFirstValue(ClaimTypes.NameIdentifier) : null;
            var userRating = userId != null ? ratings.FirstOrDefault(r => r.UserId == userId)?.Value : null;
            return Ok(new { avg, count, userRating });
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetReviews(Guid id)
        {
            var reviews = await _context.CourseRatings
                .Where(r => r.CourseId == id && !string.IsNullOrEmpty(r.ReviewText))
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.Id,
                    r.Value,
                    r.ReviewText,
                    r.CreatedAt,
                    userName = r.User.UserName,
                    r.Likes,
                    r.Dislikes
                })
                .ToListAsync();
            return Ok(reviews);
        }

        [Authorize]
        [HttpPost("reviews/{reviewId}/like")]
        public async Task<IActionResult> LikeReview(int reviewId)
        {
            var review = await _context.CourseRatings.FindAsync(reviewId);
            if (review == null) return NotFound();

            review.Likes += 1;
            await _context.SaveChangesAsync();
            return Ok(new { likes = review.Likes });
        }

        [Authorize]
        [HttpPost("reviews/{reviewId}/dislike")]
        public async Task<IActionResult> DislikeReview(int reviewId)
        {
            var review = await _context.CourseRatings.FindAsync(reviewId);
            if (review == null) return NotFound();

            review.Dislikes += 1;
            await _context.SaveChangesAsync();
            return Ok(new { dislikes = review.Dislikes });
        }

        [Authorize(Roles = "Admin,Instructor")]
        [HttpGet("instructor/orders")]
        public async Task<ActionResult<IEnumerable<InstructorOrderDto>>> GetInstructorOrders()
        {
            var instructorName = User.Identity.Name;
            var courses = await _context.Courses
                .Where(c => c.Instructor == instructorName)
                .Select(c => c.Id)
                .ToListAsync();

            var orderItems = await _context.Orders
                .Where(o => o.Status == "Completed")
                .SelectMany(o => o.OrderItems
                    .Where(oi => courses.Contains(oi.CourseId))
                    .Select(oi => new
                    {
                        OrderId = oi.OrderId,
                        CourseTitle = oi.Course.Title,
                        StudentId = oi.Order.UserId, // hoặc BuyerId
                        Price = oi.Price,
                        PurchasedAt = oi.Order.CreatedAt
                    }))
                .ToListAsync();

            var userIds = orderItems.Select(x => x.StudentId).Distinct().ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            var result = orderItems.Select(x => new InstructorOrderDto
            {
                OrderId = x.OrderId.ToString(),
                CourseTitle = x.CourseTitle,
                StudentEmail = users.ContainsKey(x.StudentId) ? users[x.StudentId] : "",
                Price = x.Price,
                PurchasedAt = x.PurchasedAt
            }).ToList();

            return Ok(result);
        }

        [Authorize(Roles = "Admin,Instructor")]
        [HttpGet("instructor/revenue-stats")]
        public async Task<ActionResult> GetInstructorRevenueStats()
        {
             // Lấy tất cả đơn hàng đã hoàn thành
            var orderItems = await _context.Orders
                .Where(o => o.Status == "Completed")
                .SelectMany(o => o.OrderItems
                    .Select(oi => new
                    {
                        OrderId = oi.OrderId,
                        CourseTitle = oi.Course.Title,
                        Instructor = oi.Course.Instructor,
                        StudentId = o.UserId, // hoặc o.BuyerId
                        Price = oi.Price,
                        PurchasedAt = o.CreatedAt // <-- Lấy từ Order
                    }))
                .ToListAsync();

            var userIds = orderItems.Select(x => x.StudentId).Distinct().ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            var orders = orderItems.Select(x => new InstructorOrderDto
            {
                OrderId = x.OrderId.ToString(),
                CourseTitle = x.CourseTitle,
                StudentEmail = users.ContainsKey(x.StudentId) ? users[x.StudentId] : "",
                Price = x.Price,
                PurchasedAt = x.PurchasedAt
            }).ToList();

            // Tính stats
            var totalRevenue = orderItems.Sum(oi => oi.Price);
            var commission = totalRevenue * 0.4m;
            var instructorReceive = totalRevenue * 0.6m;
            var monthlyStats = orderItems
                .GroupBy(oi => new { oi.PurchasedAt.Year, oi.PurchasedAt.Month })
                .Select(g => new {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(x => x.Price)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToList();

            return Ok(new {
                orders,
                stats = new {
                    totalRevenue,
                    commission,
                    instructorReceive,
                    monthlyStats
                }
            });
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("admin/orders")]
        public async Task<ActionResult<IEnumerable<InstructorOrderDto>>> GetAllOrders()
        {
            var orderItems = await _context.Orders
                .Where(o => o.Status == "Completed")
                .SelectMany(o => o.OrderItems
                    .Select(oi => new
                    {
                        OrderId = oi.OrderId,
                        CourseTitle = oi.Course.Title,
                        Instructor = oi.Course.Instructor,
                        StudentId = o.UserId, // hoặc o.BuyerId
                        Price = oi.Price,
                        PurchasedAt = o.CreatedAt
                    }))
                .ToListAsync();

            var userIds = orderItems.Select(x => x.StudentId).Distinct().ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            var result = orderItems.Select(x => new InstructorOrderDto
            {
                OrderId = x.OrderId.ToString(),
                CourseTitle = x.CourseTitle,
                StudentEmail = users.ContainsKey(x.StudentId) ? users[x.StudentId] : "",
                Price = x.Price,
                PurchasedAt = x.PurchasedAt
                // Bạn có thể thêm Instructor nếu muốn
            }).ToList();

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/orders-and-revenue")]
        public async Task<ActionResult> GetAdminOrdersAndRevenue()
        {
            // Lấy tất cả đơn hàng đã hoàn thành
            var orderItems = await _context.Orders
                .Where(o => o.Status == "Completed")
                .SelectMany(o => o.OrderItems
                    .Select(oi => new
                    {
                        OrderId = oi.OrderId,
                        CourseTitle = oi.Course.Title,
                        Instructor = oi.Course.Instructor,
                        StudentId = o.UserId, // hoặc o.BuyerId
                        Price = oi.Price,
                        PurchasedAt = o.CreatedAt // <-- Lấy từ Order
                    }))
                .ToListAsync();

            var userIds = orderItems.Select(x => x.StudentId).Distinct().ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            var orders = orderItems.Select(x => new InstructorOrderDto
            {
                OrderId = x.OrderId.ToString(),
                CourseTitle = x.CourseTitle,
                StudentEmail = users.ContainsKey(x.StudentId) ? users[x.StudentId] : "",
                Price = x.Price,
                PurchasedAt = x.PurchasedAt
            }).ToList();

            // Tính stats
            var totalRevenue = orderItems.Sum(oi => oi.Price);
            var commission = totalRevenue * 0.4m;
            var instructorReceive = totalRevenue * 0.6m;
            var monthlyStats = orderItems
                .GroupBy(oi => new { oi.PurchasedAt.Year, oi.PurchasedAt.Month })
                .Select(g => new {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(x => x.Price)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToList();

            return Ok(new {
                orders,
                stats = new {
                    totalRevenue,
                    commission,
                    instructorReceive,
                    monthlyStats
                }
            });
        }

    }
}