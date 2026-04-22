using System.Text;
using Microsoft.OpenApi;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Auth;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.JWT;
using SoundSpaceBackend.Services.JWT.Abstractions;
using SoundSpaceBackend.Services.Post;
using SoundSpaceBackend.Services.Post.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.SpotifyToken;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;
using SoundSpaceBackend.Services.User;
using SoundSpaceBackend.Services.User.Abstractions;

Env.Load();
var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// CORS configuration
var allowedOrigins = builder.Configuration["FRONTEND_URL"]?.Split(",") ?? [];

// Database configuration
var connectionString = Environment.GetEnvironmentVariable("SOUNDSPACE_DB");
builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(connectionString));

// Service registrations
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddOpenApi();
builder.Services.AddAutoMapper(cfg => { }, typeof(SoundSpaceBackend.Mapping.Profiles.UserProfile));

builder.Services.AddSignalR();

builder.Services.AddScoped<ISpotifyTokenService, SpotifyTokenService>();
builder.Services.AddScoped<ISpotifyPlayerService, SpotifyPlayerService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Version = "v1",
            Title = "SoundSpace API",
            Description = "API documentation for SoundSpace backend"
        });
    }
);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
     
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/spotify"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"[JWT] Challenge issued. Error: {context.Error}, Description: {context.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationContext>();
        
        await context.Database.MigrateAsync();
        
        Console.WriteLine("Migration succeed");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration errors: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi", "SoundSpace API"));
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();