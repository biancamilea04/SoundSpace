namespace SoundSpaceBackend.Controllers.Users.Responses;

public record UserSearchResultDto(
    Guid Id,
    string DisplayName,
    string? ProfileImageUrl);
