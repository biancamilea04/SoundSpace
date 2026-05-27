using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewStartSecondAndDuration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PreviewDuration",
                table: "Posts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreviewStartSecond",
                table: "Posts",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewDuration",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "PreviewStartSecond",
                table: "Posts");
        }
    }
}
