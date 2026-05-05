using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Messages.Requests;

public record ReportMessageRequest(
    [Required][MaxLength(1000)] string Reason
);
