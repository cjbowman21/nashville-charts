using System.ComponentModel.DataAnnotations;

namespace NashvilleCharts.Core.Entities;

public class ChartComment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ChartId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public Guid? ParentCommentId { get; set; } // For nested replies

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; } // Soft delete

    // Navigation properties
    public virtual Chart Chart { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ChartComment? ParentComment { get; set; }
    public virtual ICollection<ChartComment> Replies { get; set; } = new List<ChartComment>();
}
