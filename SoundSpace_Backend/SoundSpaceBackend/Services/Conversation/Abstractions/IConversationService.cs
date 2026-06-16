using SoundSpaceBackend.Services.Conversation.DTOs;

namespace SoundSpaceBackend.Services.Conversation.Abstractions;

public interface IConversationService
{
    Task<ConversationSummaryDto> GetOrCreateDirectConversationAsync(Guid currentUserId, Guid targetUserId);
    Task<List<ConversationSummaryDto>> GetUserConversationsAsync(Guid userId);
    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);
    Task<(Guid ConversationId, bool IsNew)>
    GetOrCreateDirectConversationSlimAsync(Guid currentUserId, Guid targetUserId);
    Task<List<RecentContactDto>> GetRecentContactsAsync(Guid userId, int count = 15);
    Task<int> GetUnreadConversationCountAsync(Guid userId);
    Task<List<Guid>> GetAllConversationIdsAsync(Guid userId);
}
