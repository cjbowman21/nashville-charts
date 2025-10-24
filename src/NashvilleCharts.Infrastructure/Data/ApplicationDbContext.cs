using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;

namespace NashvilleCharts.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Chart> Charts { get; set; }
    public DbSet<ChartVote> ChartVotes { get; set; }
    public DbSet<ChartComment> ChartComments { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ChartTag> ChartTags { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Chart configuration
        builder.Entity<Chart>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.IsPublic, e.ViewCount });
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.Artist);
            entity.HasIndex(e => e.DeletedAt); // For soft delete queries

            entity.HasOne(e => e.User)
                .WithMany(u => u.Charts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Don't specify column type - let EF Core choose the right type for each database
            // SQL Server will use nvarchar(max), PostgreSQL will use text
        });

        // ChartVote configuration
        builder.Entity<ChartVote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ChartId, e.UserId }).IsUnique();
            entity.HasIndex(e => e.ChartId);
            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.Chart)
                .WithMany(c => c.Votes)
                .HasForeignKey(e => e.ChartId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Votes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction); // Prevent cascade delete conflicts
        });

        // ChartComment configuration
        builder.Entity<ChartComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ChartId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ParentCommentId);
            entity.HasIndex(e => e.DeletedAt);

            entity.HasOne(e => e.Chart)
                .WithMany(c => c.Comments)
                .HasForeignKey(e => e.ChartId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(e => e.ParentCommentId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Tag configuration
        builder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // ChartTag (many-to-many) configuration
        builder.Entity<ChartTag>(entity =>
        {
            entity.HasKey(e => new { e.ChartId, e.TagId });

            entity.HasOne(e => e.Chart)
                .WithMany(c => c.ChartTags)
                .HasForeignKey(e => e.ChartId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tag)
                .WithMany(t => t.ChartTags)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Feedback configuration
        builder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(e => e.User)
                .WithMany(u => u.FeedbackSubmissions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
