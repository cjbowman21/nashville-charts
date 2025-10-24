using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Infrastructure.Data;
using NashvilleCharts.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to bind to Railway's PORT environment variable
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Configure forwarded headers for Railway proxy (handles SSL termination)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Add services to the container
builder.Services.AddControllersWithViews();

// Configure database - Support both SQL Server (local) and PostgreSQL (Railway)
// Check DATABASE_URL first (Railway), then fall back to appsettings.json (local dev)
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = databaseUrl ?? builder.Configuration.GetConnectionString("DefaultConnection");

// Log connection info (without exposing password)
if (!string.IsNullOrEmpty(databaseUrl))
{
    builder.Logging.AddConsole();
    var logMessage = databaseUrl.StartsWith("postgres") ? "Using PostgreSQL from DATABASE_URL" : "Using connection from DATABASE_URL";
    Console.WriteLine($"INFO: {logMessage}");
}
else
{
    Console.WriteLine("INFO: Using connection string from appsettings.json");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Use PostgreSQL if connection string starts with postgres:// or postgresql://
    if (!string.IsNullOrEmpty(connectionString) &&
        (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
    {
        // Parse Railway's DATABASE_URL format: postgres://user:password@host:port/database
        // Convert to Npgsql connection string format
        var uri = new Uri(connectionString);
        var npgsqlConnectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={uri.UserInfo.Split(':')[0]};Password={uri.UserInfo.Split(':')[1]};SSL Mode=Require;Trust Server Certificate=true";

        Console.WriteLine($"INFO: Connecting to PostgreSQL at {uri.Host}:{uri.Port}");
        options.UseNpgsql(npgsqlConnectionString,
            b => b.MigrationsAssembly("NashvilleCharts.Infrastructure"));
    }
    else
    {
        // Default to SQL Server for local development
        Console.WriteLine("INFO: Using SQL Server");
        options.UseSqlServer(connectionString ?? "",
            b => b.MigrationsAssembly("NashvilleCharts.Infrastructure"));
    }
});

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure OAuth Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.LoginPath = "/auth/login";
    options.LogoutPath = "/auth/logout";
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? "";
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? "";
})
.AddFacebook(options =>
{
    options.AppId = builder.Configuration["Authentication:Facebook:AppId"] ?? "";
    options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"] ?? "";
});

// Register repositories
builder.Services.AddScoped<IChartRepository, ChartRepository>();
builder.Services.AddScoped<IVoteRepository, VoteRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();

// Add Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Initialize database on startup (for containerized deployments like Railway)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // For initial deployment: create database schema if it doesn't exist
        // TODO: Replace with proper migrations (run 'dotnet ef migrations add InitialCreate' locally)
        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
            app.Logger.LogInformation("Database migrations applied successfully.");
        }
        else if (!context.Database.CanConnect() || !context.Database.GetAppliedMigrations().Any())
        {
            // No migrations exist yet - create schema directly
            context.Database.EnsureCreated();
            app.Logger.LogInformation("Database schema created successfully.");
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while initializing the database.");
        throw;
    }
}

// Configure the HTTP request pipeline
// UseForwardedHeaders must be called before any middleware that needs to know the request scheme
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // Don't use HSTS or HTTPS redirection in production (Railway handles SSL at load balancer)
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// API routes
app.MapControllers();

// SPA fallback - serve index.html for all non-API routes
app.MapFallbackToFile("index.html");

app.Run();
