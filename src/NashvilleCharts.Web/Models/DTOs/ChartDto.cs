namespace NashvilleCharts.Web.Models.DTOs;

public class ChartDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Artist { get; set; }
    public string Key { get; set; } = string.Empty;
    public string TimeSignature { get; set; } = string.Empty;
    public int? Tempo { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public bool AllowComments { get; set; }
    public int ViewCount { get; set; }
    public int NetVotes { get; set; }
    public int? UserVote { get; set; } // null, 1, or -1
    public int CommentCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateChartDto
{
    public string Title { get; set; } = string.Empty;
    public string? Artist { get; set; }
    public string Key { get; set; } = "C";
    public string TimeSignature { get; set; } = "4/4";
    public int? Tempo { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = false;
    public bool AllowComments { get; set; } = true;
}

public class UpdateChartDto
{
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public string? Key { get; set; }
    public string? TimeSignature { get; set; }
    public int? Tempo { get; set; }
    public string? Content { get; set; }
    public bool? IsPublic { get; set; }
    public bool? AllowComments { get; set; }
}
