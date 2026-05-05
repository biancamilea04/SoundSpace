using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundSpaceBackend.Migrations
{
    /// <inheritdoc />
    public partial class messages_update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ciphertext",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "PrivateKeyCiphertext",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PrivateKeyIv",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PrivateKeyKeyVersion",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PublicKey",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "Nonce",
                table: "Messages",
                newName: "Text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Text",
                table: "Messages",
                newName: "Nonce");

            migrationBuilder.AddColumn<string>(
                name: "Ciphertext",
                table: "Messages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrivateKeyCiphertext",
                table: "AspNetUsers",
                type: "character varying(4096)",
                maxLength: 4096,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrivateKeyIv",
                table: "AspNetUsers",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PrivateKeyKeyVersion",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicKey",
                table: "AspNetUsers",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);
        }
    }
}
