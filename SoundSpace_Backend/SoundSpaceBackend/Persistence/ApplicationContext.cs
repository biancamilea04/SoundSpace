using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Data;

namespace SoundSpaceBackend.Persistence;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{ 
    
}