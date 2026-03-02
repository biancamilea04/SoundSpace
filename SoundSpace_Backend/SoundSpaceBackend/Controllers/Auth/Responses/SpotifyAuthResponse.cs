using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Controllers.Auth.Responses;

public class SpotifyAuthResponseDto
{
    [JsonPropertyName("message")]
    public string Message { get; set; }

    [JsonPropertyName("tokens")]
    public SpotifyTokensDto Tokens { get; set; }

    [JsonPropertyName("userProfile")]
    public SpotifyProfileDto UserProfile { get; set; }
}

public class SpotifyTokensDto
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; }

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; }

    [JsonPropertyName("scope")]
    public string Scope { get; set; }
}

public class SpotifyProfileDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("display_name")]
    public string DisplayName { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("country")]
    public string Country { get; set; }

    [JsonPropertyName("product")]
    public string Product { get; set; }

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; }
    
    [JsonPropertyName("followers")]
    public SpotifyFollowersDto Followers { get; set; }
}

public class SpotifyImageDto
{
    [JsonPropertyName("url")]
    public string Url { get; set; }

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