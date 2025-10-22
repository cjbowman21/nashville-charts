using System.ComponentModel.DataAnnotations;

namespace NashvilleCharts.Core.Entities;

public class ChartVote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ChartId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int VoteType { get; set; } // 1 = upvote, -1 = downvote

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Chart Chart { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
