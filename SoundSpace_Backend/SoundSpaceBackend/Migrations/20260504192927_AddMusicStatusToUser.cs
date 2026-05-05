using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddMusicStatusToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingArtist",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingCoverUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentlyPlayingTitle",
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
                name: "LastPlayedCoverUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastPlayedTitle",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MusicStatusUpdatedAt",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingArtist",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingCoverUrl",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentlyPlayingTitle",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsListening",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedArtist",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedCoverUrl",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPlayedTitle",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MusicStatusUpdatedAt",
                table: "AspNetUsers");
        }
    }
}
