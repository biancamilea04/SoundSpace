using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SoundSpaceBackend.Persistence;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    [DbContext(typeof(ApplicationContext))]
    [Migration("20260609000000_AddSpotifySubtitleUrlToPost")]
    public partial class AddSpotifySubtitleUrlToPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SpotifySubtitleUrl",
                table: "Posts",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SpotifySubtitleUrl",
                table: "Posts");
        }
    }
}
