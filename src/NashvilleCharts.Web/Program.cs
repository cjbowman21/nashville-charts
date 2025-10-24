using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Infrastructure.Data;
using NashvilleCharts.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllersWithViews();

// Configure database - Support both SQL Server (local) and PostgreSQL (Railway)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Use PostgreSQL if connection string starts with postgres:// or postgresql://
    if (!string.IsNullOrEmpty(connectionString) &&
        (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
    {
        // Railway provides postgres:// URLs, but Npgsql needs postgresql://
        var postgresConnection = connectionString.Replace("postgres://", "postgresql://");
        options.UseNpgsql(postgresConnection,
            b => b.MigrationsAssembly("NashvilleCharts.Infrastructure"));
    }
    else
    {
        // Default to SQL Server for local development
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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// API routes
app.MapControllers();

// SPA fallback - serve index.html for all non-API routes
app.MapFallbackToFile("index.html");

app.Run();
