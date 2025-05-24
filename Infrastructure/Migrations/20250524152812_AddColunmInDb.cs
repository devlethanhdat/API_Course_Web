using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddColunmInDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "0073fcbd-32c9-4d4f-bf31-bfa62d633722");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "49c97129-237f-4b24-a695-7357fe821cda");

            migrationBuilder.AlterColumn<long>(
                name: "CurrentLecture",
                table: "UserCourses",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateTime>(
                name: "PurchasedAt",
                table: "UserCourses",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "2c88acb1-1dd2-45b7-b07f-1a2cf73ee658", null, "Instructor", "INSTRUCTOR" },
                    { "891e0173-8196-44c3-aebe-ef4ec9e7f862", null, "Student", "STUDENT" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "2c88acb1-1dd2-45b7-b07f-1a2cf73ee658");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "891e0173-8196-44c3-aebe-ef4ec9e7f862");

            migrationBuilder.DropColumn(
                name: "PurchasedAt",
                table: "UserCourses");

            migrationBuilder.AlterColumn<int>(
                name: "CurrentLecture",
                table: "UserCourses",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "0073fcbd-32c9-4d4f-bf31-bfa62d633722", null, "Student", "STUDENT" },
                    { "49c97129-237f-4b24-a695-7357fe821cda", null, "Instructor", "INSTRUCTOR" }
                });
        }
    }
}
