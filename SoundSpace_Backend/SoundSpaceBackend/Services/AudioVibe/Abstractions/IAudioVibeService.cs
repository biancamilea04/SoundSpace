using SoundSpaceBackend.Controllers.Users.Responses;

namespace SoundSpaceBackend.Services.AudioVibe.Abstractions;

public interface IAudioVibeService
{
    Task<List<DiscoveryUserResponse>> GetVibeMatchesAsync(
        Guid userId, IReadOnlyCollection<Guid> excludeIds, int limit);

    Task<bool> UserHasVectorAsync(Guid userId);

    Task SeedUserVibeAsync(Guid userId);
}
