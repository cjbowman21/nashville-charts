namespace NashvilleCharts.Core.Entities;

public class ChartTag
{
    public Guid ChartId { get; set; }
    public int TagId { get; set; }

    // Navigation properties
    public virtual Chart Chart { get; set; } = null!;
    public virtual Tag Tag { get; set; } = null!;
}
