using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    public partial class events_2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EventId",
                table: "Posts",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EventId",
                table: "Conversations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventPhotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    UploaderId = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventPhotos_AspNetUsers_UploaderId",
                        column: x => x.UploaderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventPhotos_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Posts_EventId_CreatedAt",
                table: "Posts",
                columns: new[] { "EventId", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_EventId",
                table: "Conversations",
                column: "EventId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventPhotos_EventId",
                table: "EventPhotos",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventPhotos_UploaderId",
                table: "EventPhotos",
                column: "UploaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Events_EventId",
                table: "Conversations",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Events_EventId",
                table: "Posts",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Events_EventId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Events_EventId",
                table: "Posts");

            migrationBuilder.DropTable(
                name: "EventPhotos");

            migrationBuilder.DropIndex(
                name: "IX_Posts_EventId_CreatedAt",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_EventId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Conversations");
        }
    }
}
