using API.Dto;
using AutoMapper;
using Entity;

namespace API.Helpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Course, CourseDto>()
                .ForMember(c => c.Category,
                o => o.MapFrom(s => s.Category.Name))
                .ForMember(dest => dest.Sections, opt => opt.MapFrom(src => src.Sections));

            CreateMap<Learning, LearningDto>();

            CreateMap<Requirement, RequirementDto>();

            CreateMap<Category, CategoryDto>();

            CreateMap<Category, CategoriesDto>();

            CreateMap<Basket, BasketDto>();
            CreateMap<BasketItem, BasketItemDto>()
            .ForMember(b => b.CourseId, o => o.MapFrom(c => c.Course.Id))
            .ForMember(b => b.Title, o => o.MapFrom(c => c.Course.Title))
            .ForMember(b => b.Price, o => o.MapFrom(c => c.Course.Price))
            .ForMember(b => b.Image, o => o.MapFrom(c => c.Course.Image))
            .ForMember(b => b.Instructor, o => o.MapFrom(c => c.Course.Instructor));
            CreateMap<Section, SectionDto>()
            .ForMember(s => s.SectionName, o => o.MapFrom(c => c.Name));
            CreateMap<Lecture, LectureDto>()
            .ForMember(dest => dest.VideoUrl, opt => opt.MapFrom(src => src.Url));
        }
    }
}
