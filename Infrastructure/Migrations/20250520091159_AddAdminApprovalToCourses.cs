using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminApprovalToCourses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "2f76a852-fb3f-4924-b017-2b1b68024bbe");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "9576ef03-17da-4f82-a980-548295b9b539");

            migrationBuilder.AddColumn<bool>(
                name: "AdminApproved",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "08ac26ab-59be-4166-b69a-da6434f5c243", null, "Student", "STUDENT" },
                    { "5458ccf4-c1aa-405c-8c98-2dd7cd020495", null, "Instructor", "INSTRUCTOR" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "08ac26ab-59be-4166-b69a-da6434f5c243");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "5458ccf4-c1aa-405c-8c98-2dd7cd020495");

            migrationBuilder.DropColumn(
                name: "AdminApproved",
                table: "Courses");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "2f76a852-fb3f-4924-b017-2b1b68024bbe", null, "Student", "STUDENT" },
                    { "9576ef03-17da-4f82-a980-548295b9b539", null, "Instructor", "INSTRUCTOR" }
                });
        }
    }
}
