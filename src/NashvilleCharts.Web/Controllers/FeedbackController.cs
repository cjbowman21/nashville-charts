using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Infrastructure.Data;
using NashvilleCharts.Web.Models.DTOs;
using System.Security.Claims;

namespace NashvilleCharts.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FeedbackController> _logger;

    public FeedbackController(ApplicationDbContext context, ILogger<FeedbackController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<FeedbackDto>> CreateFeedback([FromBody] CreateFeedbackDto dto)
    {
        _logger.LogInformation("Feedback submission received. User authenticated: {IsAuthenticated}", User.Identity?.IsAuthenticated);

        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Title) || dto.Title.Length > 200)
            return BadRequest("Title is required and must be 200 characters or less");

        if (string.IsNullOrWhiteSpace(dto.Description) || dto.Description.Length > 5000)
            return BadRequest("Description is required and must be 5000 characters or less");

        if (dto.Type != "Bug" && dto.Type != "Enhancement")
            return BadRequest("Type must be either 'Bug' or 'Enhancement'");

        if (dto.Priority != "Low" && dto.Priority != "Medium" && dto.Priority != "High")
            return BadRequest("Priority must be 'Low', 'Medium', or 'High'");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        _logger.LogInformation("User ID from claims: {UserId}", userId ?? "null");

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("No user ID found in claims despite [Authorize] attribute");
            return Unauthorized();
        }

        var feedback = new Feedback
        {
            UserId = userId,
            Type = dto.Type,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = "New"
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        var created = await _context.Feedbacks
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == feedback.Id);

        _logger.LogInformation(
            "New {Type} feedback submitted by user {UserId}: {Title}",
            feedback.Type,
            userId,
            feedback.Title
        );

        return CreatedAtAction(
            nameof(GetFeedback),
            new { id = feedback.Id },
            MapToDto(created!));
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<FeedbackDto>> GetFeedback(Guid id)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (feedback == null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Users can only view their own feedback (unless admin)
        if (feedback.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        return Ok(MapToDto(feedback));
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetMyFeedback()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var feedbacks = await _context.Feedbacks
            .Include(f => f.User)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return Ok(feedbacks.Select(MapToDto));
    }

    private FeedbackDto MapToDto(Feedback feedback)
    {
        return new FeedbackDto
        {
            Id = feedback.Id,
            UserId = feedback.UserId,
            UserDisplayName = feedback.User?.DisplayName ?? feedback.User?.Email ?? "Unknown",
            Type = feedback.Type,
            Title = feedback.Title,
            Description = feedback.Description,
            Priority = feedback.Priority,
            Status = feedback.Status,
            CreatedAt = feedback.CreatedAt,
            UpdatedAt = feedback.UpdatedAt
        };
    }
}
