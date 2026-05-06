using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Friendships.Requests;

public record SendFriendRequestRequest(
    [Required] Guid TargetUserId);
