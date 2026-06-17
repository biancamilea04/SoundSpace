using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    public partial class DecoupleUserMusicStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserCurrentlyPlayings",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsListening = table.Column<bool>(type: "boolean", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Artist = table.Column<string>(type: "text", nullable: true),
                    ArtistUrl = table.Column<string>(type: "text", nullable: true),
                    CoverUrl = table.Column<string>(type: "text", nullable: true),
                    Uri = table.Column<string>(type: "text", nullable: true),
                    ProgressMs = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCurrentlyPlayings", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserCurrentlyPlayings_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserLastPlayeds",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Artist = table.Column<string>(type: "text", nullable: true),
                    ArtistUrl = table.Column<string>(type: "text", nullable: true),
                    Uri = table.Column<string>(type: "text", nullable: true),
                    CoverUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLastPlayeds", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserLastPlayeds_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(@"
                INSERT INTO ""UserCurrentlyPlayings"" (""UserId"", ""IsListening"", ""Title"", ""Artist"", ""ArtistUrl"", ""CoverUrl"", ""Uri"", ""ProgressMs"", ""UpdatedAt"")
                SELECT ""Id"", ""IsListening"", ""CurrentlyPlayingTitle"", ""CurrentlyPlayingArtist"", ""CurrentlyPlayingArtistUrl"", ""CurrentlyPlayingCoverUrl"", ""CurrentlyPlayingUri"", ""CurrentlyPlayingProgressMs"", ""MusicStatusUpdatedAt""
                FROM ""AspNetUsers""
                WHERE ""IsListening"" = true OR ""CurrentlyPlayingTitle"" IS NOT NULL;
            ");

            migrationBuilder.Sql(@"
                INSERT INTO ""UserLastPlayeds"" (""UserId"", ""Title"", ""Artist"", ""ArtistUrl"", ""Uri"", ""CoverUrl"")
                SELECT ""Id"", ""LastPlayedTitle"", ""LastPlayedArtist"", ""LastPlayedArtistUrl"", ""LastPlayedUri"", ""LastPlayedCoverUrl""
                FROM ""AspNetUsers""
                WHERE ""LastPlayedTitle"" IS NOT NULL;
            ");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingArtist",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingArtistUrl",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingCoverUrl",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingProgressMs",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingTitle",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingUri",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsListening",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedArtist",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedArtistUrl",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedCoverUrl",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedTitle",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedUri",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MusicStatusUpdatedAt",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCurrentlyPlayings");

            migrationBuilder.DropTable(
                name: "UserLastPlayeds");

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingArtist",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingArtistUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingCoverUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentlyPlayingProgressMs",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingTitle",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingUri",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsListening",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LastPlayedArtist",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastPlayedArtistUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastPlayedCoverUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastPlayedTitle",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastPlayedUri",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MusicStatusUpdatedAt",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
