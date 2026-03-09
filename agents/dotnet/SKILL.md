---
name: dotnet
description: C# and .NET for enterprise backends, Azure, and Microsoft ecosystem.
owner: Frank
last_updated: 2026-03
---

# .NET / C#

Microsoft's enterprise powerhouse. Cloud-native. Cross-platform.

---

## Context Questions

Before implementing with .NET:

1. **What's the platform?** — Web API, desktop, mobile (MAUI), games (Unity)?
2. **Cloud provider?** — Azure (native), AWS, or hybrid?
3. **API style?** — REST, gRPC, GraphQL?
4. **Database?** — SQL Server, PostgreSQL, Cosmos DB?
5. **Team background?** — .NET native or transitioning?

---

## TL;DR

| Need | Solution |
|------|----------|
| Web API | ASP.NET Core Minimal API |
| Full MVC | ASP.NET Core MVC |
| Database | Entity Framework Core |
| Auth | ASP.NET Identity + JWT |
| Real-time | SignalR |
| Background jobs | Hosted Services or Hangfire |
| Cross-platform app | .NET MAUI |
| Game development | Unity |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **API style** | Minimal API ←→ Full MVC with views |
| **Architecture** | Simple API ←→ Clean Architecture |
| **Cloud** | Self-hosted ←→ Full Azure integration |
| **Scale** | Small service ←→ Enterprise microservices |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Simple REST API | Minimal API + EF Core |
| Enterprise backend | Clean Architecture + MediatR |
| Azure-heavy | Azure Functions + Cosmos DB |
| Real-time needs | SignalR + Azure SignalR Service |
| Microservices | Aspire for orchestration |
| Cross-platform app | .NET MAUI |

---

## When to Use .NET

### ✅ Great Fit

- **Enterprise backends** — Mature, stable, scalable
- **Azure shops** — First-class integration
- **Microsoft ecosystem** — SQL Server, AD, Office integrations
- **Large teams** — Strong typing, conventions
- **Performance-critical APIs** — Excellent throughput

### ❌ Consider Alternatives

- **Startup MVP** — Node.js or Python faster to iterate
- **AWS-only** — Node.js or Go more common
- **Frontend-focused team** — Keep full JS stack

---

## Quick Start: Minimal API

```bash
# Create new project
dotnet new webapi -n MyApi
cd MyApi

# Add packages
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design

# Run
dotnet run
```

---

## Project Structure

```
src/
├── MyApi/
│   ├── Program.cs              # Entry point
│   ├── Endpoints/              # API endpoints
│   ├── Models/                 # Domain models
│   ├── Data/                   # DbContext, repos
│   └── Services/               # Business logic
└── MyApi.Tests/                # Unit tests
```

---

## Core Patterns

### Minimal API (ASP.NET Core 8+)

```csharp
// Program.cs
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Endpoints
app.MapGet("/health", () => new { status = "ok" });

app.MapGet("/users", async (IUserService service) =>
    Results.Ok(await service.GetAllAsync()));

app.MapGet("/users/{id}", async (int id, IUserService service) =>
    await service.GetByIdAsync(id) is User user
        ? Results.Ok(user)
        : Results.NotFound());

app.MapPost("/users", async (CreateUserDto dto, IUserService service) =>
{
    var user = await service.CreateAsync(dto);
    return Results.Created($"/users/{user.Id}", user);
});

app.Run();
```

### Entity Framework Core

```csharp
// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasMany(u => u.Posts)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId);
    }
}

// Models/User.cs
public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Post> Posts { get; set; } = new();
}
```

### Service Layer

```csharp
// Services/UserService.cs
public interface IUserService
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User> CreateAsync(CreateUserDto dto);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    
    public UserService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }
    
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
    
    public async Task<User> CreateAsync(CreateUserDto dto)
    {
        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return user;
    }
}
```

### DTOs with Validation

```csharp
// Models/CreateUserDto.cs
using System.ComponentModel.DataAnnotations;

public record CreateUserDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; init; }
    
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
}
```

---

## JWT Authentication

```csharp
// Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// Protected endpoint
app.MapGet("/users/me", (ClaimsPrincipal user) =>
    Results.Ok(new { userId = user.FindFirst("sub")?.Value }))
    .RequireAuthorization();
```

---

## Azure Integration

```csharp
// Azure Blob Storage
builder.Services.AddAzureClients(azure =>
{
    azure.AddBlobServiceClient(builder.Configuration["Storage:ConnectionString"]);
});

// Azure Key Vault
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/"),
    new DefaultAzureCredential());

// Application Insights
builder.Services.AddApplicationInsightsTelemetry();
```

---

## Common Packages

| Package | Purpose |
|---------|---------|
| `Microsoft.EntityFrameworkCore` | ORM |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT auth |
| `Swashbuckle.AspNetCore` | Swagger/OpenAPI |
| `MediatR` | CQRS/mediator pattern |
| `FluentValidation` | Advanced validation |
| `Serilog` | Structured logging |
| `Polly` | Resilience/retry |
| `Azure.Identity` | Azure auth |

---

## Related Skills

- `agents/auth/SKILL.md` — Authentication patterns
- `agents/database/SKILL.md` — Database design
- `ai-builder/kubernetes/SKILL.md` — Container orchestration
- `agents/cloud-azure/SKILL.md` — Azure deployment
