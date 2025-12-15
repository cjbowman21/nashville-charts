using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Web.Models.DTOs;
using System.Security.Claims;

namespace NashvilleCharts.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChartsController : ControllerBase
{
    private readonly IChartRepository _chartRepository;
    private readonly IVoteRepository _voteRepository;

    public ChartsController(IChartRepository chartRepository, IVoteRepository voteRepository)
    {
        _chartRepository = chartRepository;
        _voteRepository = voteRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChartDto>>> GetCharts(
        [FromQuery] string? userId = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sort = "recent")
    {
        IEnumerable<Chart> charts;

        if (!string.IsNullOrEmpty(search))
        {
            charts = await _chartRepository.SearchAsync(search);
        }
        else if (!string.IsNullOrEmpty(userId))
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }
            charts = await _chartRepository.GetByUserIdAsync(userId);
        }
        else if (sort == "top")
        {
            charts = await _chartRepository.GetTopRatedAsync(50);
        }
        else
        {
            charts = await _chartRepository.GetAllAsync();
        }

        var currentUser = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var chartDtos = charts.Select(c => MapToDto(c, currentUser));

        return Ok(chartDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChartDto>> GetChart(Guid id)
    {
        var chart = await _chartRepository.GetByIdAsync(id);

        if (chart == null)
            return NotFound();

        // Check if user has permission to view private charts
        if (!chart.IsPublic)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (chart.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }
        }
        else
        {
            // Increment view count for public charts
            await _chartRepository.IncrementViewCountAsync(id);
        }

        var currentUser = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(MapToDto(chart, currentUser));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ChartDto>> CreateChart([FromBody] CreateChartDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var chart = new Chart
        {
            UserId = userId,
            Title = dto.Title,
            Artist = dto.Artist,
            Key = dto.Key,
            TimeSignature = dto.TimeSignature,
            Tempo = dto.Tempo,
            Content = dto.Content,
            IsPublic = dto.IsPublic,
            AllowComments = dto.AllowComments
        };

        var created = await _chartRepository.CreateAsync(chart);

        return CreatedAtAction(
            nameof(GetChart),
            new { id = created.Id },
            MapToDto(created, userId));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ChartDto>> UpdateChart(Guid id, [FromBody] UpdateChartDto dto)
    {
        var chart = await _chartRepository.GetByIdAsync(id);

        if (chart == null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (chart.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        // Update only provided fields
        if (dto.Title != null) chart.Title = dto.Title;
        if (dto.Artist != null) chart.Artist = dto.Artist;
        if (dto.Key != null) chart.Key = dto.Key;
        if (dto.TimeSignature != null) chart.TimeSignature = dto.TimeSignature;
        if (dto.Tempo.HasValue) chart.Tempo = dto.Tempo;
        if (dto.Content != null) chart.Content = dto.Content;
        if (dto.IsPublic.HasValue) chart.IsPublic = dto.IsPublic.Value;
        if (dto.AllowComments.HasValue) chart.AllowComments = dto.AllowComments.Value;

        var updated = await _chartRepository.UpdateAsync(chart);

        return Ok(MapToDto(updated, userId));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChart(Guid id)
    {
        var chart = await _chartRepository.GetByIdAsync(id);

        if (chart == null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (chart.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        await _chartRepository.DeleteAsync(id); // Soft delete

        return NoContent();
    }

    private ChartDto MapToDto(Chart chart, string? currentUserId)
    {
        var userVote = chart.Votes.FirstOrDefault(v => v.UserId == currentUserId);

        return new ChartDto
        {
            Id = chart.Id,
            UserId = chart.UserId,
            UserDisplayName = chart.User?.DisplayName ?? chart.User?.UserName ?? "Unknown",
            Title = chart.Title,
            Artist = chart.Artist,
            Key = chart.Key,
            TimeSignature = chart.TimeSignature,
            Tempo = chart.Tempo,
            Content = chart.Content,
            IsPublic = chart.IsPublic,
            AllowComments = chart.AllowComments,
            ViewCount = chart.ViewCount,
            NetVotes = chart.Votes.Sum(v => v.VoteType),
            UserVote = userVote?.VoteType,
            CommentCount = chart.Comments.Count(c => c.DeletedAt == null),
            CreatedAt = chart.CreatedAt,
            UpdatedAt = chart.UpdatedAt
        };
    }
}
