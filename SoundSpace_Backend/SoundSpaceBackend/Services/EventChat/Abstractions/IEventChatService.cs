using SoundSpaceBackend.Services.EventChat.DTOs;

namespace SoundSpaceBackend.Services.EventChat.Abstractions;

public interface IEventChatService
{
    Task<EventConversationDto> GetOrCreateEventConversationAsync(Guid eventId, Guid userId);
    Task<Guid?> GetConversationIdByEventAsync(Guid eventId);
}
