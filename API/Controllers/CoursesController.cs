using System;
using System.Collections.Generic;
using System.Linq;
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
            var spec = new CoursesWithCategoriesSpecification(id);

            var course = await _repository.GetEntityWithSpec(spec);

            if (course == null) return NotFound(new ApiResponse(404));

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
                var instructor = User.Identity.Name;
                
                // Lấy tất cả khóa học của instructor
                var instructorCourses = await _context.Courses
                    .Where(c => c.Instructor == instructor)
                    .ToListAsync();

                var courseIds = instructorCourses.Select(c => c.Id).ToList();

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
                    TotalRevenue = await _context.Orders
                        .Where(o => o.Status == "Completed")
                        .SelectMany(o => o.OrderItems)
                        .Where(oi => courseIds.Contains(oi.CourseId))
                        .SumAsync(oi => oi.Price)
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse(500, ex.Message));
            }
        }
    }
}