using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PaymentStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "3e3e5941-c821-4fdd-b907-6ef906e59cb0");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "efa7d9be-2de7-47ff-adce-fb89444f2325");

            migrationBuilder.AlterColumn<long>(
                name: "Total",
                table: "Orders",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "20c36169-a905-49b7-a5ff-57ae149b9626", null, "Instructor", "INSTRUCTOR" },
                    { "ddc9a609-6cc7-49ec-95ab-165145aa9839", null, "Student", "STUDENT" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "20c36169-a905-49b7-a5ff-57ae149b9626");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "ddc9a609-6cc7-49ec-95ab-165145aa9839");

            migrationBuilder.AlterColumn<decimal>(
                name: "Total",
                table: "Orders",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "3e3e5941-c821-4fdd-b907-6ef906e59cb0", null, "Student", "STUDENT" },
                    { "efa7d9be-2de7-47ff-adce-fb89444f2325", null, "Instructor", "INSTRUCTOR" }
                });
        }
    }
}
