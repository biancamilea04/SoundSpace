using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.EventChat.Abstractions;
using SoundSpaceBackend.Services.EventChat.DTOs;

namespace SoundSpaceBackend.Services.EventChat;

public class EventChatService(ApplicationContext db) : IEventChatService
{
    public async Task<EventConversationDto> GetOrCreateEventConversationAsync(Guid eventId, Guid userId)
    {
        var ev = await db.Events
            .Include(e => e.GroupConversation)
                .ThenInclude(c => c!.Participants)
            .FirstOrDefaultAsync(e => e.Id == eventId)
            ?? throw new KeyNotFoundException("Event not found.");

        if (ev.GroupConversation is null)
        {
            await using var tx = await db.Database.BeginTransactionAsync();

            var conv = new Models.Entities.Conversation { IsGroup = true, EventId = eventId };
            db.Conversations.Add(conv);
            await db.SaveChangesAsync();
            await tx.CommitAsync();

            ev = await db.Events
                .Include(e => e.GroupConversation)
                    .ThenInclude(c => c!.Participants)
                .FirstAsync(e => e.Id == eventId);
        }

        var conversation = ev.GroupConversation!;

        var isParticipant = conversation.Participants.Any(p => p.UserId == userId);
        if (!isParticipant)
        {
            db.ConversationParticipants.Add(new ConversationParticipant
            {
                ConversationId = conversation.Id,
                UserId = userId
            });
            await db.SaveChangesAsync();
        }

        var count = conversation.Participants.Count + (isParticipant ? 0 : 1);
        return new EventConversationDto(conversation.Id, count);
    }

    public Task<Guid?> GetConversationIdByEventAsync(Guid eventId) =>
        db.Conversations
            .Where(c => c.EventId == eventId)
            .Select(c => (Guid?)c.Id)
            .FirstOrDefaultAsync();
}
