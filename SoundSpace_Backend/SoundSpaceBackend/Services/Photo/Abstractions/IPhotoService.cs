namespace SoundSpaceBackend.Services.Photo.Abstractions;

public interface IPhotoService
{
    Task<string> SaveFileAsync(IFormFile file);
    Task<string> SaveFromUrlAsync(string imageUrl);
}
