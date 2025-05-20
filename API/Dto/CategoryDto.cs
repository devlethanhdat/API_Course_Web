using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace API.Dto
{
    public class CategoryDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<CourseDto> Courses { get; set; }
    }
}
