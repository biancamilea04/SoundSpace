using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Conversation.DTOs;
using SoundSpaceBackend.Services.Message.Abstractions;

namespace SoundSpaceBackend.Services.Message;

public class MessageService(ApplicationContext db) : IMessageService
{
    public async Task<MessageDto> SaveMessageAsync(Guid conversationId, Guid senderId, string text)
    {
        var message = new Models.Entities.Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Text = text
        };

        db.Messages.Add(message);
        await db.SaveChangesAsync();

        return new MessageDto(message.Id, message.ConversationId, message.SenderId,
            message.Text, message.CreatedAt, message.IsDeleted,
            message.IsRead, message.ReadAt, message.EditedAt);
    }

    public async Task<MessageDto> SoftDeleteMessageAsync(Guid messageId, Guid requestingUserId)
    {
        var message = await db.Messages.FindAsync(messageId)
            ?? throw new KeyNotFoundException($"Message {messageId} not found.");

        if (message.SenderId != requestingUserId)
            throw new UnauthorizedAccessException("Only the sender can delete this message.");

        message.IsDeleted = true;
        message.DeletedAt = DateTime.UtcNow;
        message.Text = null;

        await db.SaveChangesAsync();

        return new MessageDto(message.Id, message.ConversationId, message.SenderId,
            null, message.CreatedAt, true, message.IsRead, message.ReadAt, null);
    }

    public async Task<List<MessageDto>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize)
    {
        return await db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
            .ToListAsync();
    }

    public async Task<MessageDto> EditMessageAsync(Guid messageId, Guid requestingUserId, string newText)
    {
        var message = await db.Messages.FindAsync(messageId)
            ?? throw new KeyNotFoundException($"Message {messageId} not found.");

        if (message.SenderId != requestingUserId)
            throw new UnauthorizedAccessException("Only the sender can edit this message.");

        if (message.IsDeleted)
            throw new InvalidOperationException("Cannot edit a deleted message.");

        message.Text = newText;
        message.EditedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return new MessageDto(message.Id, message.ConversationId, message.SenderId,
            message.Text, message.CreatedAt, message.IsDeleted,
            message.IsRead, message.ReadAt, message.EditedAt);
    }

    public async Task<(List<Guid> MessageIds, Guid SenderId)> MarkMessagesAsReadAsync(
        Guid conversationId, Guid readerId)
    {
        var messages = await db.Messages
            .Where(m => m.ConversationId == conversationId
                     && m.SenderId != readerId
                     && !m.IsRead
                     && !m.IsDeleted)
            .ToListAsync();

        if (messages.Count == 0) return ([], Guid.Empty);

        var readAt = DateTime.UtcNow;
        foreach (var m in messages)
        {
            m.IsRead = true;
            m.ReadAt = readAt;
        }

        await db.SaveChangesAsync();

        return (messages.Select(m => m.Id).ToList(), messages[0].SenderId);
    }
}
