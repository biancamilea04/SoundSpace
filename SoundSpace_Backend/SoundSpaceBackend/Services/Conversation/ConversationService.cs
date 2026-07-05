using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Conversation.Abstractions;
using SoundSpaceBackend.Services.Conversation.DTOs;

namespace SoundSpaceBackend.Services.Conversation;

public class ConversationService(ApplicationContext db) : IConversationService
{
    public async Task<ConversationSummaryDto> GetOrCreateDirectConversationAsync(Guid currentUserId, Guid targetUserId)
    {
        var currentUserConvIds = db.ConversationParticipants
            .Where(cp => cp.UserId == currentUserId)
            .Select(cp => cp.ConversationId);

        var existing = await db.Conversations
            .Where(c => !c.IsGroup && currentUserConvIds.Contains(c.Id) &&
                        c.Participants.Any(cp => cp.UserId == targetUserId))
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .FirstOrDefaultAsync();

        if (existing != null)
            return await BuildSummaryAsync(existing, currentUserId);

        await using var tx = await db.Database.BeginTransactionAsync();

        var conversation = new Models.Entities.Conversation();
        db.Conversations.Add(conversation);

        db.ConversationParticipants.Add(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = currentUserId
        });
        db.ConversationParticipants.Add(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = targetUserId
        });

        await db.SaveChangesAsync();
        await tx.CommitAsync();

        var created = await db.Conversations
            .Where(c => c.Id == conversation.Id)
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .FirstAsync();

        return await BuildSummaryAsync(created, currentUserId);
    }

    public async Task<List<ConversationSummaryDto>> GetUserConversationsAsync(Guid userId)
    {
        var convIds = await db.ConversationParticipants
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.ConversationId)
            .ToListAsync();

        var conversations = await db.Conversations
            .Where(c => convIds.Contains(c.Id) && !c.IsGroup)
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationSummaryDto>();
        foreach (var conv in conversations)
            result.Add(await BuildSummaryAsync(conv, userId));

        return result;
    }

    public Task<bool> IsParticipantAsync(Guid conversationId, Guid userId) =>
        db.ConversationParticipants.AnyAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);

    public async Task<(Guid ConversationId, bool IsNew)>
        GetOrCreateDirectConversationSlimAsync(Guid currentUserId, Guid targetUserId)
    {
        var currentUserConvIds = db.ConversationParticipants
            .Where(cp => cp.UserId == currentUserId)
            .Select(cp => cp.ConversationId);

        var existingId = await db.Conversations
            .Where(c => !c.IsGroup
                     && currentUserConvIds.Contains(c.Id)
                     && c.Participants.Any(cp => cp.UserId == targetUserId))
            .Select(c => c.Id)
            .FirstOrDefaultAsync();

        if (existingId != Guid.Empty)
            return (existingId, false);

        await using var tx = await db.Database.BeginTransactionAsync();

        var conversation = new Models.Entities.Conversation();
        db.Conversations.Add(conversation);

        db.ConversationParticipants.Add(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = currentUserId
        });
        db.ConversationParticipants.Add(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = targetUserId
        });

        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return (conversation.Id, true);
    }

    public async Task<List<RecentContactDto>> GetRecentContactsAsync(Guid userId, int count = 15)
    {
        var rows = await db.ConversationParticipants
            .Where(cp => cp.UserId == userId && !cp.Conversation.IsGroup)
            .Select(cp => new
            {
                OtherUser = cp.Conversation.Participants
                    .Where(p => p.UserId != userId)
                    .Select(p => new RecentContactDto(
                        p.UserId,
                        p.User.DisplayName,
                        p.User.ProfileImageUrl))
                    .First(),
                LastActivity = cp.Conversation.Messages
                    .Max(m => (DateTime?)m.CreatedAt) ?? cp.JoinedAt
            })
            .OrderByDescending(x => x.LastActivity)
            .Take(count * 2)
            .ToListAsync();

        return rows
            .DistinctBy(x => x.OtherUser.Id)
            .Take(count)
            .Select(x => x.OtherUser)
            .ToList();
    }

    public Task<List<Guid>> GetAllConversationIdsAsync(Guid userId) =>
        db.ConversationParticipants
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.ConversationId)
            .ToListAsync();

    public Task<int> GetUnreadConversationCountAsync(Guid userId) =>
        db.ConversationParticipants
            .Where(cp => cp.UserId == userId &&
                         !cp.Conversation.IsGroup &&
                         cp.Conversation.Messages.Any(m => !m.IsRead && !m.IsDeleted && m.SenderId != userId))
            .CountAsync();

    private async Task<ConversationSummaryDto> BuildSummaryAsync(
        Models.Entities.Conversation conv, Guid currentUserId)
    {
        var lastMessage = await db.Messages
            .Where(m => m.ConversationId == conv.Id)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MessageDto(
                m.Id,
                m.ConversationId,
                m.SenderId,
                m.IsDeleted ? null : m.Text,
                m.CreatedAt,
                m.IsDeleted,
                m.IsRead,
                m.ReadAt,
                m.EditedAt
            ))
            .FirstOrDefaultAsync();

        var unreadCount = await db.Messages
            .CountAsync(m => m.ConversationId == conv.Id
                          && !m.IsRead
                          && !m.IsDeleted
                          && m.SenderId != currentUserId);

        var participants = conv.Participants.Select(cp => new ParticipantDto(
            cp.UserId,
            cp.User.DisplayName,
            cp.User.ProfileImageUrl,
            cp.User.LastSeen
        )).ToList();

        return new ConversationSummaryDto(conv.Id, conv.IsGroup, conv.CreatedAt,
            participants, lastMessage, unreadCount);
    }
}
