using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Services.JWT.DTOs;


namespace SoundSpaceBackend.Services.JWT.Abstractions;

public interface IJwtService
{
    public string GenerateToken(UserJwtDto userDto);
}