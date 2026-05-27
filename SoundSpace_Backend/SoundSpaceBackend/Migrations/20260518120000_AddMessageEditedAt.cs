using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SoundSpaceBackend.Persistence;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(ApplicationContext))]
    [Migration("20260518120000_AddMessageEditedAt")]
    public partial class AddMessageEditedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EditedAt",
                table: "Messages",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EditedAt",
                table: "Messages");
        }
    }
}
