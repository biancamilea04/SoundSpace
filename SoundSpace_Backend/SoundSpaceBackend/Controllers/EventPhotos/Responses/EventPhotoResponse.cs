namespace SoundSpaceBackend.Controllers.EventPhotos.Responses;

public record EventPhotoResponse(
    Guid Id,
    Guid EventId,
    Guid UploaderId,
    string UploaderDisplayName,
    string FilePath,
    DateTime UploadedAt
);
