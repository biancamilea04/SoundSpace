namespace SoundSpaceBackend.Controllers.Discovery.Requests;

public record DiscoveryBatchRequest(int? Limit, List<Guid>? SeenUserIds);
