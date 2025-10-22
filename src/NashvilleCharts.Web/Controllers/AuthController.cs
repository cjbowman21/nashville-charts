using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NashvilleCharts.Core.Entities;
using System.Security.Claims;

namespace NashvilleCharts.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager)
    {
        _signInManager = signInManager;
        _userManager = userManager;
    }

    [HttpGet("login/{provider}")]
    public IActionResult ExternalLogin(string provider, string? returnUrl = null)
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return Challenge(properties, provider);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null, string? remoteError = null)
    {
        if (remoteError != null)
        {
            return BadRequest($"Error from external provider: {remoteError}");
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            return BadRequest("Error loading external login information");
        }

        // Sign in the user with this external login provider if the user already has a login
        var result = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: true,
            bypassTwoFactor: true);

        if (result.Succeeded)
        {
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user != null)
            {
                user.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
            }

            // Redirect to React app
            return Redirect($"http://localhost:5173{returnUrl ?? "/"}");
        }

        if (result.IsLockedOut)
        {
            return BadRequest("User account locked out");
        }
        else
        {
            // If the user does not have an account, create one
            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var name = info.Principal.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email not provided by external login provider");
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                DisplayName = name ?? email.Split('@')[0],
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);

            if (createResult.Succeeded)
            {
                createResult = await _userManager.AddLoginAsync(user, info);

                if (createResult.Succeeded)
                {
                    await _signInManager.SignInAsync(user, isPersistent: true);
                    return Redirect($"http://localhost:5173{returnUrl ?? "/"}");
                }
            }

            return BadRequest($"Error creating user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetCurrentUser()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Ok(new { isAuthenticated = false });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Ok(new { isAuthenticated = false });
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Ok(new { isAuthenticated = false });
        }

        return Ok(new
        {
            isAuthenticated = true,
            user = new
            {
                id = user.Id,
                email = user.Email,
                displayName = user.DisplayName,
                userName = user.UserName
            }
        });
    }
}
