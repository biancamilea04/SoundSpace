using SoundSpaceBackend.Controllers.Users.Responses;

namespace SoundSpaceBackend.Services.Discovery.Abstractions;

public interface IDiscoveryService
{
    Task<List<DiscoveryUserResponse>> GetFeedAsync(Guid userId, int page, int pageSize);
}
