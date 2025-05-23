

//using Entity;
//using Infrastructure;

//public static class DbInitializer
//{
//    public static async Task Initialize(StoreContext context)
//    {
//        // ...existing code...

//        if (!context.Orders.Any())
//        {
//            var orders = new List<Order>
//            {
//                new Order
//                {
//                    Id = Guid.NewGuid(),
//                    UserId = "test@test.com", // Thay bằng user ID thật
//                    Status = "Completed",
//                    Total = 99.99m,
//                    CreatedAt = DateTime.UtcNow,
//                    OrderItems = new List<OrderItem>
//                    {
//                        new OrderItem
//                        {
//                            CourseId = context.Courses.First().Id, // ID của course đầu tiên
//                            Price = 99.99m
//                        }
//                    }
//                }
//            };

//            context.Orders.AddRange(orders);
//        }

//        if (!context.UserCourses.Any())
//        {
//            var userCourses = new List<UserCourse>
//            {
//                new UserCourse
//                {
//                    UserId = "test@test.com", // Thay bằng user ID thật
//                    CourseId = context.Courses.First().Id, // ID của course đầu tiên
//                    EnrolledDate = DateTime.UtcNow
//                }
//            };

//            context.UserCourses.AddRange(userCourses);
//        }

//        await context.SaveChangesAsync();
//    }
//}
