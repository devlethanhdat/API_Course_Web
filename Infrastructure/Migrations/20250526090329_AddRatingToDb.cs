using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingToDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "2c88acb1-1dd2-45b7-b07f-1a2cf73ee658");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "891e0173-8196-44c3-aebe-ef4ec9e7f862");

            migrationBuilder.AlterColumn<int>(
                name: "CurrentLecture",
                table: "UserCourses",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateTable(
                name: "CourseRatings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewText = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseRatings_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseRatings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1098745c-78e7-41e4-a58d-fe6b0759c261", null, "Student", "STUDENT" },
                    { "fcb28e7a-68d0-4fc2-ba4f-76387b9390e7", null, "Instructor", "INSTRUCTOR" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseRatings_CourseId",
                table: "CourseRatings",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseRatings_UserId",
                table: "CourseRatings",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseRatings");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "1098745c-78e7-41e4-a58d-fe6b0759c261");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "fcb28e7a-68d0-4fc2-ba4f-76387b9390e7");

            migrationBuilder.AlterColumn<long>(
                name: "CurrentLecture",
                table: "UserCourses",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "2c88acb1-1dd2-45b7-b07f-1a2cf73ee658", null, "Instructor", "INSTRUCTOR" },
                    { "891e0173-8196-44c3-aebe-ef4ec9e7f862", null, "Student", "STUDENT" }
                });
        }
    }
}
