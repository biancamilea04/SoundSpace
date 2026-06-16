using SoundSpaceBackend.Services.Photo.Abstractions;

namespace SoundSpaceBackend.Services.Photo;

public class PhotoService(IWebHostEnvironment env, IHttpClientFactory httpClientFactory) : IPhotoService
{
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    private static readonly Dictionary<string, string> MimeToExtension =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"]  = ".png",
            ["image/webp"] = ".webp",
        };

    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

    public async Task<string> SaveFileAsync(IFormFile file)
    {
        if (file.Length == 0)
            throw new ArgumentException("The uploaded file is empty.");

        if (file.Length > MaxBytes)
            throw new ArgumentException("File exceeds the 5 MB size limit.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new ArgumentException(
                $"File type '{ext}' is not allowed. Accepted: .jpg, .jpeg, .png, .webp.");

        await using var stream = file.OpenReadStream();
        return await PersistAsync(stream, ext);
    }

    public async Task<string> SaveFromUrlAsync(string imageUrl)
    {
        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new ArgumentException("URL must be a valid http or https address.");
        }

        using var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("User-Agent", "SoundSpace/1.0");

        using var response = await client.GetAsync(imageUrl, HttpCompletionOption.ResponseHeadersRead);
        response.EnsureSuccessStatusCode();

        var mimeType = response.Content.Headers.ContentType?.MediaType ?? string.Empty;
        if (!MimeToExtension.TryGetValue(mimeType, out var ext))
            throw new ArgumentException(
                $"The URL does not point to a supported image (got MIME type '{mimeType}'). " +
                "Supported types: image/jpeg, image/png, image/webp.");

        var declaredLength = response.Content.Headers.ContentLength;
        if (declaredLength.HasValue && declaredLength.Value > MaxBytes)
            throw new ArgumentException("Remote image exceeds the 5 MB size limit.");

        await using var remoteStream = await response.Content.ReadAsStreamAsync();
        using var buffer = new MemoryStream();
        var totalRead = 0L;
        var chunk = new byte[8192];
        int read;
        while ((read = await remoteStream.ReadAsync(chunk)) > 0)
        {
            totalRead += read;
            if (totalRead > MaxBytes)
                throw new ArgumentException("Remote image exceeds the 5 MB size limit.");
            await buffer.WriteAsync(chunk.AsMemory(0, read));
        }

        buffer.Position = 0;
        return await PersistAsync(buffer, ext);
    }

    private async Task<string> PersistAsync(Stream stream, string ext)
    {
        var webRootPath = env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(env.ContentRootPath, "wwwroot");
        }

        var uploadsDir = Path.Combine(webRootPath, "uploads", "events");
        Directory.CreateDirectory(uploadsDir);

        var filename = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadsDir, filename);

        await using var fileStream = new FileStream(
            fullPath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 81920);
        await stream.CopyToAsync(fileStream);

        return $"/uploads/events/{filename}";
    }
}
