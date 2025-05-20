using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure;
using Entity;

// [Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class CategoryController : BaseController
{
    private readonly StoreContext _context;
    private readonly ILogger<CategoryController> _logger;

    public CategoryController(StoreContext context, ILogger<CategoryController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();
        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] CategoryDto categoryDto)
    {
        try
        {
            if (id != categoryDto.Id)
            {
                return BadRequest(new ApiResponse(400, "Id mismatch"));
            }

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new ApiResponse(404, "Category not found"));
            }

            // Check for duplicate name
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(x => x.Name.ToLower() == categoryDto.Name.ToLower() 
                    && x.Id != id);

            if (existingCategory != null)
            {
                return BadRequest(new ApiResponse(400, "Category name already exists"));
            }

            category.Name = categoryDto.Name;
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<CategoryDto>(category));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category");
            return BadRequest(new ApiResponse(400, "Error updating category"));
        }
    }
}