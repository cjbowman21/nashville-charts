using Microsoft.AspNetCore.Identity;

namespace NashvilleCharts.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<Chart> Charts { get; set; } = new List<Chart>();
    public virtual ICollection<ChartVote> Votes { get; set; } = new List<ChartVote>();
    public virtual ICollection<ChartComment> Comments { get; set; } = new List<ChartComment>();
}
