using System.ComponentModel.DataAnnotations;

namespace NashvilleCharts.Core.Entities;

public class Tag
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<ChartTag> ChartTags { get; set; } = new List<ChartTag>();
}
