using SoundSpaceBackend.Services.Conversation.DTOs;

namespace SoundSpaceBackend.Services.Message.Abstractions;

public interface IMessageService
{
    Task<MessageDto> SaveMessageAsync(Guid conversationId, Guid senderId, string text);
    Task<MessageDto> SoftDeleteMessageAsync(Guid messageId, Guid requestingUserId);
    Task<List<MessageDto>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize);
    Task<(List<Guid> MessageIds, Guid SenderId)> MarkMessagesAsReadAsync(Guid conversationId, Guid readerId);
}
