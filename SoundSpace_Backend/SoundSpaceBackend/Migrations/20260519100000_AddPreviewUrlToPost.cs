using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SoundSpaceBackend.Persistence;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(ApplicationContext))]
    [Migration("20260519100000_AddPreviewUrlToPost")]
    public partial class AddPreviewUrlToPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviewUrl",
                table: "Posts",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewUrl",
                table: "Posts");
        }
    }
}
