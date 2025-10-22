using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Web.Models.DTOs;
using System.Security.Claims;

namespace NashvilleCharts.Web.Controllers;

[ApiController]
[Route("api/charts/{chartId}/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentRepository _commentRepository;
    private readonly IChartRepository _chartRepository;

    public CommentsController(ICommentRepository commentRepository, IChartRepository chartRepository)
    {
        _commentRepository = commentRepository;
        _chartRepository = chartRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(Guid chartId)
    {
        var chart = await _chartRepository.GetByIdAsync(chartId);
        if (chart == null)
            return NotFound("Chart not found");

        var comments = await _commentRepository.GetByChartIdAsync(chartId);
        var commentDtos = comments.Select(MapToDto);

        return Ok(commentDtos);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentDto>> CreateComment(Guid chartId, [FromBody] CreateCommentDto dto)
    {
        var chart = await _chartRepository.GetByIdAsync(chartId);
        if (chart == null)
            return NotFound("Chart not found");

        if (!chart.AllowComments)
            return BadRequest("Comments are not allowed on this chart");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var comment = new ChartComment
        {
            ChartId = chartId,
            UserId = userId,
            ParentCommentId = dto.ParentCommentId,
            Content = dto.Content
        };

        var created = await _commentRepository.CreateAsync(comment);

        // Reload with navigation properties
        var fullComment = await _commentRepository.GetByIdAsync(created.Id);

        return CreatedAtAction(
            nameof(GetComment),
            new { chartId, id = created.Id },
            MapToDto(fullComment!));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommentDto>> GetComment(Guid chartId, Guid id)
    {
        var comment = await _commentRepository.GetByIdAsync(id);

        if (comment == null || comment.ChartId != chartId)
            return NotFound();

        return Ok(MapToDto(comment));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<CommentDto>> UpdateComment(Guid chartId, Guid id, [FromBody] UpdateCommentDto dto)
    {
        var comment = await _commentRepository.GetByIdAsync(id);

        if (comment == null || comment.ChartId != chartId)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (comment.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        comment.Content = dto.Content;
        var updated = await _commentRepository.UpdateAsync(comment);

        return Ok(MapToDto(updated));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(Guid chartId, Guid id)
    {
        var comment = await _commentRepository.GetByIdAsync(id);

        if (comment == null || comment.ChartId != chartId)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (comment.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        await _commentRepository.DeleteAsync(id); // Soft delete

        return NoContent();
    }

    private CommentDto MapToDto(ChartComment comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            ChartId = comment.ChartId,
            UserId = comment.UserId,
            UserDisplayName = comment.User?.DisplayName ?? comment.User?.UserName ?? "Unknown",
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            Replies = comment.Replies.Select(MapToDto).ToList()
        };
    }
}
