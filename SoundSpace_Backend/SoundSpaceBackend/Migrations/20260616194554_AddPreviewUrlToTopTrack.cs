using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewUrlToTopTrack : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviewUrl",
                table: "TopTracks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewUrl",
                table: "TopTracks");
        }
    }
}
