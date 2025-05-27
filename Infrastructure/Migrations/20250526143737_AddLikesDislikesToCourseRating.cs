using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLikesDislikesToCourseRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "1098745c-78e7-41e4-a58d-fe6b0759c261");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "fcb28e7a-68d0-4fc2-ba4f-76387b9390e7");

            migrationBuilder.AddColumn<int>(
                name: "Dislikes",
                table: "CourseRatings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Likes",
                table: "CourseRatings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "549ad0c5-7c41-4fad-9883-74bdb7067b9d", null, "Instructor", "INSTRUCTOR" },
                    { "7e379381-126c-4414-abb4-d422d2ad0f75", null, "Student", "STUDENT" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "549ad0c5-7c41-4fad-9883-74bdb7067b9d");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "7e379381-126c-4414-abb4-d422d2ad0f75");

            migrationBuilder.DropColumn(
                name: "Dislikes",
                table: "CourseRatings");

            migrationBuilder.DropColumn(
                name: "Likes",
                table: "CourseRatings");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1098745c-78e7-41e4-a58d-fe6b0759c261", null, "Student", "STUDENT" },
                    { "fcb28e7a-68d0-4fc2-ba4f-76387b9390e7", null, "Instructor", "INSTRUCTOR" }
                });
        }
    }
}
