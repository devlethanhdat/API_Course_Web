using System.Reflection;
using Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure
{
    public class StoreContext : IdentityDbContext<User>
    {
        public StoreContext(DbContextOptions options) : base(options) { }

        // Existing DbSet properties
        public DbSet<Course> Courses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Requirement> Requirements { get; set; }
        public DbSet<Learning> Learnings { get; set; }
        public DbSet<Basket> Basket { get; set; }
        public DbSet<UserCourse> UserCourses { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Lecture> Lectures { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        
        // Add new DbSet for StripePayment
        public DbSet<StripePayment> StripePayments { get; set; }

        public DbSet<CourseRating> CourseRatings { get; set; }

        public DbSet<Coupon> Coupons { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Identity configurations
            builder.Entity<User>().ToTable("Users");
            builder.Entity<IdentityRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
            builder
               .ApplyConfigurationsFromAssembly(Assembly
                   .GetExecutingAssembly());
            builder.Entity<IdentityRole>()
            .HasData(
                new IdentityRole { Name = "Student", NormalizedName = "STUDENT" },
                new IdentityRole { Name = "Instructor", NormalizedName = "INSTRUCTOR" });
                new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" };
            // Apply configurations from assembly
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // UserCourse configuration
            builder.Entity<UserCourse>()
                .HasKey(uc => new { uc.UserId, uc.CourseId });

            builder.Entity<UserCourse>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserCourses)
                .HasForeignKey(uc => uc.UserId);

            builder.Entity<UserCourse>()
                .HasOne(uc => uc.Course)
                .WithMany(c => c.UserCourses)
                .HasForeignKey(uc => uc.CourseId);

            // OrderItem configuration
            builder.Entity<OrderItem>()
                .HasKey(oi => new { oi.OrderId, oi.CourseId });

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Course)
                .WithMany()
                .HasForeignKey(oi => oi.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            // StripePayment configurations
            builder.Entity<StripePayment>()
                .HasKey(sp => sp.PaymentIntentId);

            builder.Entity<Order>()
                .HasOne(o => o.StripePayment)
                .WithMany(sp => sp.Orders)
                .HasForeignKey(o => o.PaymentIntentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Optional: Configure cascade delete behavior
            builder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
