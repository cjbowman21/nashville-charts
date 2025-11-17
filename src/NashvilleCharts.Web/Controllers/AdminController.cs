using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Infrastructure.Data;
using NashvilleCharts.Web.Models.DTOs;

namespace NashvilleCharts.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ApplicationDbContext context,
        ILogger<AdminController> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _logger = logger;
    }

    // ========== User Management Endpoints ==========

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] int? page = 1, [FromQuery] int? pageSize = 50)
    {
        var skip = ((page ?? 1) - 1) * (pageSize ?? 50);
        var users = await _userManager.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip(skip)
            .Take(pageSize ?? 50)
            .ToListAsync();

        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? "",
                DisplayName = user.DisplayName ?? "",
                UserName = user.UserName ?? "",
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                EmailConfirmed = user.EmailConfirmed,
                LockoutEnd = user.LockoutEnd,
                Roles = roles.ToList()
            });
        }

        var totalCount = await _userManager.Users.CountAsync();

        return Ok(new
        {
            users = userDtos,
            totalCount = totalCount,
            page = page ?? 1,
            pageSize = pageSize ?? 50
        });
    }

    [HttpGet("users/{id}")]
    public async Task<ActionResult<UserDto>> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            DisplayName = user.DisplayName ?? "",
            UserName = user.UserName ?? "",
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            EmailConfirmed = user.EmailConfirmed,
            LockoutEnd = user.LockoutEnd,
            Roles = roles.ToList()
        });
    }

    [HttpPut("users/{id}")]
    public async Task<ActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        // Update user properties
        if (!string.IsNullOrWhiteSpace(dto.DisplayName))
            user.DisplayName = dto.DisplayName;

        if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
        {
            user.Email = dto.Email;
            user.UserName = dto.Email;
            user.EmailConfirmed = false; // Require re-confirmation if email changes
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        _logger.LogInformation("User {UserId} updated by admin", id);

        return Ok(new { message = "User updated successfully" });
    }

    [HttpPost("users/{id}/assign-role")]
    public async Task<ActionResult> AssignRole(string id, [FromBody] AssignRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found");

        // Ensure role exists
        if (!await _roleManager.RoleExistsAsync(dto.RoleName))
        {
            var roleResult = await _roleManager.CreateAsync(new IdentityRole(dto.RoleName));
            if (!roleResult.Succeeded)
                return BadRequest(new { errors = roleResult.Errors.Select(e => e.Description) });
        }

        // Add user to role
        if (!await _userManager.IsInRoleAsync(user, dto.RoleName))
        {
            var result = await _userManager.AddToRoleAsync(user, dto.RoleName);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            _logger.LogInformation("User {UserId} assigned to role {RoleName} by admin", id, dto.RoleName);
        }

        return Ok(new { message = $"User assigned to role '{dto.RoleName}' successfully" });
    }

    [HttpPost("users/{id}/remove-role")]
    public async Task<ActionResult> RemoveRole(string id, [FromBody] AssignRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found");

        if (await _userManager.IsInRoleAsync(user, dto.RoleName))
        {
            var result = await _userManager.RemoveFromRoleAsync(user, dto.RoleName);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            _logger.LogInformation("User {UserId} removed from role {RoleName} by admin", id, dto.RoleName);
        }

        return Ok(new { message = $"User removed from role '{dto.RoleName}' successfully" });
    }

    [HttpPost("users/{id}/reset-password")]
    public async Task<ActionResult> ResetPassword(string id, [FromBody] ResetPasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found");

        // Remove existing password
        await _userManager.RemovePasswordAsync(user);

        // Add new password
        var result = await _userManager.AddPasswordAsync(user, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        _logger.LogInformation("Password reset for user {UserId} by admin", id);

        return Ok(new { message = "Password reset successfully" });
    }

    [HttpPost("users/{id}/lock")]
    public async Task<ActionResult> LockUser(string id, [FromBody] LockUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found");

        var lockoutEnd = dto.LockoutEnd ?? DateTimeOffset.UtcNow.AddYears(100);
        var result = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        _logger.LogInformation("User {UserId} locked until {LockoutEnd} by admin", id, lockoutEnd);

        return Ok(new { message = "User locked successfully" });
    }

    [HttpPost("users/{id}/unlock")]
    public async Task<ActionResult> UnlockUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found");

        var result = await _userManager.SetLockoutEndDateAsync(user, null);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        _logger.LogInformation("User {UserId} unlocked by admin", id);

        return Ok(new { message = "User unlocked successfully" });
    }

    // ========== Feedback Management Endpoints ==========

    [HttpGet("feedback")]
    public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetAllFeedback(
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] int? page = 1,
        [FromQuery] int? pageSize = 50)
    {
        var query = _context.Feedbacks
            .Include(f => f.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(f => f.Status == status);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(f => f.Type == type);

        var totalCount = await query.CountAsync();

        var skip = ((page ?? 1) - 1) * (pageSize ?? 50);
        var feedbacks = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip(skip)
            .Take(pageSize ?? 50)
            .ToListAsync();

        return Ok(new
        {
            feedbacks = feedbacks.Select(MapToDto),
            totalCount = totalCount,
            page = page ?? 1,
            pageSize = pageSize ?? 50
        });
    }

    [HttpPut("feedback/{id}")]
    public async Task<ActionResult> UpdateFeedback(Guid id, [FromBody] UpdateFeedbackDto dto)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null)
            return NotFound("Feedback not found");

        // Update allowed fields
        if (!string.IsNullOrWhiteSpace(dto.Status))
            feedback.Status = dto.Status;

        if (!string.IsNullOrWhiteSpace(dto.Priority))
            feedback.Priority = dto.Priority;

        feedback.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Feedback {FeedbackId} updated by admin", id);

        // Reload with navigation properties
        var updated = await _context.Feedbacks
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == id);

        return Ok(MapToDto(updated!));
    }

    [HttpDelete("feedback/{id}")]
    public async Task<ActionResult> DeleteFeedback(Guid id)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null)
            return NotFound("Feedback not found");

        _context.Feedbacks.Remove(feedback);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Feedback {FeedbackId} deleted by admin", id);

        return Ok(new { message = "Feedback deleted successfully" });
    }

    [HttpGet("feedback/stats")]
    public async Task<ActionResult> GetFeedbackStats()
    {
        var stats = new
        {
            totalCount = await _context.Feedbacks.CountAsync(),
            byStatus = await _context.Feedbacks
                .GroupBy(f => f.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync(),
            byType = await _context.Feedbacks
                .GroupBy(f => f.Type)
                .Select(g => new { type = g.Key, count = g.Count() })
                .ToListAsync(),
            byPriority = await _context.Feedbacks
                .GroupBy(f => f.Priority)
                .Select(g => new { priority = g.Key, count = g.Count() })
                .ToListAsync()
        };

        return Ok(stats);
    }

    // Helper method
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

// DTOs
public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool EmailConfirmed { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class UpdateUserDto
{
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
}

public class AssignRoleDto
{
    public string RoleName { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

public class LockUserDto
{
    public DateTimeOffset? LockoutEnd { get; set; }
}

public class UpdateFeedbackDto
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
}
