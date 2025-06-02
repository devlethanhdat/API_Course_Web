using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountToBasket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "9cf087fd-a42e-4eec-b6c8-f9b33057dc06");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "a6c0c5d4-780f-42a1-8797-21068342d0d0");

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Basket",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "87c4762e-66e2-4413-8c9f-327fd48d6a95", null, "Student", "STUDENT" },
                    { "8d2b3782-6af3-423e-833f-02e149e1a9dd", null, "Instructor", "INSTRUCTOR" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "87c4762e-66e2-4413-8c9f-327fd48d6a95");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "8d2b3782-6af3-423e-833f-02e149e1a9dd");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Basket");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "9cf087fd-a42e-4eec-b6c8-f9b33057dc06", null, "Student", "STUDENT" },
                    { "a6c0c5d4-780f-42a1-8797-21068342d0d0", null, "Instructor", "INSTRUCTOR" }
                });
        }
    }
}
