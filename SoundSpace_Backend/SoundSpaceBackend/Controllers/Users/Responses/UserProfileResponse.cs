namespace SoundSpaceBackend.Controllers.Users.Responses;

public record UserProfileResponse(Guid Id, string SpotifyId, string DisplayName, string? ProfileImageUrl, string Email, string Country, int Followers);