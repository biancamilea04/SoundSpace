namespace SoundSpaceBackend.Controllers.EventPhotos.Responses;

/// <param name="FilePath">
/// Server-relative path, e.g. "/uploads/events/abc123.jpg".
/// The frontend must prepend NEXT_PUBLIC_BACKEND_API_URL to build the full image URL.
/// </param>
public record EventPhotoResponse(
    Guid Id,
    Guid EventId,
    Guid UploaderId,
    string UploaderDisplayName,
    string FilePath,
    DateTime UploadedAt
);
