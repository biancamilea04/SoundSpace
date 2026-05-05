using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Conversations.Requests;

public record CreateConversationRequest([Required] Guid TargetUserId);
