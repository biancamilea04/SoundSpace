using Microsoft.OpenApi;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Auth;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.User;
using SoundSpaceBackend.Services.User.Abstractions;

Env.Load();
var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["FRONTEND_URL"]?.Split(",") ?? [];

var connectionString = Environment.GetEnvironmentVariable("SOUNDSPACE_DB");
builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddOpenApi();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

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
            .AllowAnyMethod();
    });
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

app.MapControllers();

app.Run();