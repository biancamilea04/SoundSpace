namespace SoundSpaceBackend.Services.User.DTOs;

public record GetUserDto(string DisplayName, string? ProfileImageUrl, string Email, string Country, int Followers);