using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Entity;
using Infrastructure;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponController : ControllerBase
    {
        private readonly StoreContext _context;
        public CouponController(StoreContext context)
        {
            _context = context;
        }

        // GET: api/coupon
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Coupon>>> GetCoupons()
        {
            return await _context.Coupons.ToListAsync();
        }

        // GET: api/coupon/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Coupon>> GetCoupon(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();
            return coupon;
        }

        // POST: api/coupon
        [HttpPost]
        public async Task<ActionResult<Coupon>> CreateCoupon(Coupon coupon)
        {
            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCoupon), new { id = coupon.Id }, coupon);
        }

        // PUT: api/coupon/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCoupon(int id, Coupon coupon)
        {
            if (id != coupon.Id) return BadRequest();
            _context.Entry(coupon).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/coupon/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();
            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}