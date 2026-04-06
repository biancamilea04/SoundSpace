using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Controllers.Auth.Responses;

public class SpotifyAuthResponseDto
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("tokens")]
    public SpotifyTokensDto Tokens { get; set; } = new();

    [JsonPropertyName("userProfile")]
    public SpotifyProfileDto UserProfile { get; set; } = new();
}

public class SpotifyTokensDto
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = string.Empty;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;

    [JsonPropertyName("scope")]
    public string Scope { get; set; } = string.Empty;
}

public class SpotifyProfileDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("country")]
    public string Country { get; set; } = string.Empty;

    [JsonPropertyName("product")]
    public string Product { get; set; } = string.Empty;

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; } = [];

    [JsonPropertyName("followers")]
    public SpotifyFollowersDto Followers { get; set; } = new();
}

public class SpotifyImageDto
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("height")]
    public int? Height { get; set; }

    [JsonPropertyName("width")]
    public int? Width { get; set; }
}

public class SpotifyFollowersDto
{
    [JsonPropertyName("total")]
    public int Total { get; set; }
}