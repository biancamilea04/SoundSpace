using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.EventPhotos.Requests;

public record UploadPhotoFromUrlRequest(
    [Required(ErrorMessage = "URL is required.")]
    [Url(ErrorMessage = "Must be a valid absolute URL.")]
    [MaxLength(2000)]
    string Url
);
