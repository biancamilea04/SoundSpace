using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Conversation.Abstractions;
using SoundSpaceBackend.Services.Message.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Hubs;

[Authorize]
public class ChatHub(
    IConversationService conversationService,
    IMessageService messageService,
    IUserService userService,
    PresenceTracker presenceTracker,
    ApplicationContext db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var spotifyId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        if (user is null) { Context.Abort(); return; }

        var conversations = await conversationService.GetUserConversationsAsync(user.Id);
        foreach (var conv in conversations)
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(conv.Id));

        await Groups.AddToGroupAsync(Context.ConnectionId, UserGroupName(user.Id));

        var isFirst = presenceTracker.UserConnected(user.Id, Context.ConnectionId);
        if (isFirst)
            await Clients.Others.SendAsync("UserCameOnline", user.Id);

        await Clients.Caller.SendAsync("OnlineUsers", presenceTracker.GetOnlineUsers());

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var spotifyId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        if (user is null) { await base.OnDisconnectedAsync(exception); return; }

        var isLast = presenceTracker.UserDisconnected(user.Id, Context.ConnectionId);
        if (isLast)
        {
            user.LastSeen = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await Clients.Others.SendAsync("UserWentOffline", user.Id);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(Guid conversationId, string text)
    {
        var user = await ResolveUserAsync();

        if (!await conversationService.IsParticipantAsync(conversationId, user.Id))
            throw new HubException("Forbidden");

        var dto = await messageService.SaveMessageAsync(conversationId, user.Id, text);
        await Clients.Group(GroupName(conversationId)).SendAsync("ReceiveMessage", dto);
    }

    public async Task DeleteMessage(Guid messageId)
    {
        var user = await ResolveUserAsync();

        try
        {
            var tombstone = await messageService.SoftDeleteMessageAsync(messageId, user.Id);
            await Clients.Group(GroupName(tombstone.ConversationId)).SendAsync("MessageDeleted", tombstone);
        }
        catch (UnauthorizedAccessException ex)
        {
            throw new HubException(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            throw new HubException(ex.Message);
        }
    }

    private async Task<Models.Entities.User> ResolveUserAsync()
    {
        var spotifyId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return await userService.GetUserEntityBySpotifyIdAsync(spotifyId)
            ?? throw new HubException("User not found.");
    }

    public async Task MarkMessagesAsRead(Guid conversationId)
    {
        var user = await ResolveUserAsync();

        if (!await conversationService.IsParticipantAsync(conversationId, user.Id))
            throw new HubException("Forbidden");

        var (messageIds, senderId) = await messageService.MarkMessagesAsReadAsync(conversationId, user.Id);

        if (messageIds.Count == 0) return;

        await Clients.Group(UserGroupName(senderId))
            .SendAsync("MessagesSeen", conversationId, messageIds);
    }

    private static string GroupName(Guid conversationId) => $"conv-{conversationId}";
    private static string UserGroupName(Guid userId) => $"user-{userId}";
}
