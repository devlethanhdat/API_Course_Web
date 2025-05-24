using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "20c36169-a905-49b7-a5ff-57ae149b9626");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "ddc9a609-6cc7-49ec-95ab-165145aa9839");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "StripePayments",
                type: "text",
                nullable: true);

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
                    { "0073fcbd-32c9-4d4f-bf31-bfa62d633722", null, "Student", "STUDENT" },
                    { "49c97129-237f-4b24-a695-7357fe821cda", null, "Instructor", "INSTRUCTOR" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "0073fcbd-32c9-4d4f-bf31-bfa62d633722");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "49c97129-237f-4b24-a695-7357fe821cda");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "StripePayments");

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
    }
}
