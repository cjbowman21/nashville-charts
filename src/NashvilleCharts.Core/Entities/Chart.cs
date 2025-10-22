using System.ComponentModel.DataAnnotations;

namespace NashvilleCharts.Core.Entities;

public class Chart
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Artist { get; set; }

    [Required]
    [MaxLength(10)]
    public string Key { get; set; } = "C";

    [MaxLength(10)]
    public string TimeSignature { get; set; } = "4/4";

    public int? Tempo { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty; // JSON chart data

    public bool IsPublic { get; set; } = false;
    public bool AllowComments { get; set; } = true;
    public int ViewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; } // Soft delete

    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ICollection<ChartVote> Votes { get; set; } = new List<ChartVote>();
    public virtual ICollection<ChartComment> Comments { get; set; } = new List<ChartComment>();
    public virtual ICollection<ChartTag> ChartTags { get; set; } = new List<ChartTag>();

    // Computed properties
    public int NetVotes => Votes.Sum(v => v.VoteType);
}
