using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
         table: "Roles",
         keyColumn: "Id",
         keyValue: "3dfa8e95-a012-4aac-826f-d148e8a1c61d");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "9735f7ad-81df-4ec3-b43a-3b71a9de66b1");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
            { "2f76a852-fb3f-4924-b017-2b1b68024bbe", null, "Student", "STUDENT" },
            { "9576ef03-17da-4f82-a980-548295b9b539", null, "Instructor", "INSTRUCTOR" },
            { "a1b2c3d4-e5f6-7890-abcd-1234567890ab", null, "Admin", "ADMIN" } // Thêm dòng này
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
        table: "Roles",
        keyColumn: "Id",
        keyValue: "2f76a852-fb3f-4924-b017-2b1b68024bbe");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "9576ef03-17da-4f82-a980-548295b9b539");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7890-abcd-1234567890ab"); // Thêm dòng này

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
            { "3dfa8e95-a012-4aac-826f-d148e8a1c61d", null, "Instructor", "INSTRUCTOR" },
            { "9735f7ad-81df-4ec3-b43a-3b71a9de66b1", null, "Student", "STUDENT" }
                });
        }
    }
}
