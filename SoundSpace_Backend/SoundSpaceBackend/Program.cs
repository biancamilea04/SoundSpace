using Microsoft.OpenApi;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Features.Authentication;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Abstractions;
using SoundSpaceBackend.Services.Auth;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("SOUNDSPACE_DB");
builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddOpenApi();

builder.Services.AddScoped<IAuthService, AuthService>();

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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();