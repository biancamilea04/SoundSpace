using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Services.Photo.Abstractions;

namespace SoundSpaceBackend.Controllers.Photos;

[ApiController]
[Route("api/photos")]
[Authorize]
public class PhotosController(IPhotoService photoService) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        try
        {
            var filePath = await photoService.SaveFileAsync(file);
            return Ok(new { filePath });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
