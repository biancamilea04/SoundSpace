using System.Text;
using Microsoft.OpenApi;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoundSpaceBackend.Hubs;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Auth;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.Conversation;
using SoundSpaceBackend.Services.Conversation.Abstractions;
using SoundSpaceBackend.Services.JWT;
using SoundSpaceBackend.Services.JWT.Abstractions;
using SoundSpaceBackend.Services.Message;
using SoundSpaceBackend.Services.Message.Abstractions;
using SoundSpaceBackend.Services.Comment;
using SoundSpaceBackend.Services.Comment.Abstractions;
using SoundSpaceBackend.Services.Like;
using SoundSpaceBackend.Services.Like.Abstractions;
using SoundSpaceBackend.Services.Post;
using SoundSpaceBackend.Services.Post.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.SpotifyToken;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;
using SoundSpaceBackend.Services.Friendship;
using SoundSpaceBackend.Services.Friendship.Abstractions;
using SoundSpaceBackend.Services.User;
using SoundSpaceBackend.Services.User.Abstractions;
using SoundSpaceBackend.Services.PreviewUrl;
using SoundSpaceBackend.Services.PreviewUrl.Abstractions;
using SoundSpaceBackend.Services.Event;
using SoundSpaceBackend.Services.Event.Abstractions;
using SoundSpaceBackend.Services.EventChat;
using SoundSpaceBackend.Services.EventChat.Abstractions;
using SoundSpaceBackend.Services.Discovery;
using SoundSpaceBackend.Services.Discovery.Abstractions;
using SoundSpaceBackend.Services.Photo;
using SoundSpaceBackend.Services.Photo.Abstractions;
using SoundSpaceBackend.Seed;

Env.Load();
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot",
});
Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "wwwroot"));

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var allowedOrigins = builder.Configuration["FRONTEND_URL"]?.Split(",") ?? [];

var connectionString = Environment.GetEnvironmentVariable("SOUNDSPACE_DB");
builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddOpenApi();
builder.Services.AddAutoMapper(cfg => { }, typeof(SoundSpaceBackend.Mapping.Profiles.UserProfile));

builder.Services.AddSignalR();

builder.Services.AddScoped<ISpotifyTokenService, SpotifyTokenService>();
builder.Services.AddScoped<ISpotifyPlayerService, SpotifyPlayerService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<ILikeService, LikeService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IFriendshipService, FriendshipService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IPreviewUrlService, PreviewUrlService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventChatService, EventChatService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IDiscoveryService, DiscoveryService>();
builder.Services.AddSingleton<PresenceTracker>();
builder.Services.AddSingleton<ChatPresenceTracker>();

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
     
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/hubs/spotify") ||
                     path.StartsWithSegments("/hubs/chat") ||
                     path.StartsWithSegments("/hubs/presence")))
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

        if (app.Environment.IsDevelopment())
        {
            await DataSeeder.SeedAsync(context);
        }
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
app.UseStaticFiles();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<PresenceHub>("/hubs/presence");
app.MapHub<SpotifyHub>("/hubs/spotify");

app.Run();

