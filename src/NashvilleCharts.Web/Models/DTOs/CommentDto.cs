namespace NashvilleCharts.Web.Models.DTOs;

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid ChartId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<CommentDto> Replies { get; set; } = new();
}

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
}

public class UpdateCommentDto
{
    public string Content { get; set; } = string.Empty;
}
