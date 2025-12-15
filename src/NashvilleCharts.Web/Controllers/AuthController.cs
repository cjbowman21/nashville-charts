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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName ?? request.Email.Split('@')[0],
            EmailConfirmed = true, // Set to false if you want email verification
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (result.Succeeded)
        {
            await _signInManager.SignInAsync(user, isPersistent: true);
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                message = "Registration successful",
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    displayName = user.DisplayName,
                    userName = user.UserName,
                    roles = roles
                }
            });
        }

        return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _signInManager.PasswordSignInAsync(
            request.Email,
            request.Password,
            isPersistent: request.RememberMe,
            lockoutOnFailure: true);

        if (result.Succeeded)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user != null)
            {
                user.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                var roles = await _userManager.GetRolesAsync(user);

                return Ok(new
                {
                    message = "Login successful",
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        displayName = user.DisplayName,
                        userName = user.UserName,
                        roles = roles
                    }
                });
            }
        }

        if (result.IsLockedOut)
            return BadRequest(new { error = "Account locked out. Please try again later." });

        return Unauthorized(new { error = "Invalid email or password" });
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
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        if (remoteError != null)
        {
            // Redirect back to SPA with a friendly error code
            return Redirect($"{baseUrl}/login?error=external_remote_error");
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            // Could not load info from external provider
            return Redirect($"{baseUrl}/login?error=external_info_null");
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

            // Redirect to the app's base URL (preserves scheme and host)
            return Redirect($"{baseUrl}{returnUrl ?? "/"}");
        }

        if (result.IsLockedOut)
        {
            // Redirect to login page with locked-out error
            return Redirect($"{baseUrl}/login?error=external_locked_out");
        }

        // If the user does not have an external login yet, try to link or create
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        var name = info.Principal.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrEmpty(email))
        {
            // Email is required to associate or create an account
            return Redirect($"{baseUrl}/login?error=external_no_email");
        }

        // First, try to find an existing user with this email and link the external login
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            var linkResult = await _userManager.AddLoginAsync(existingUser, info);
            if (linkResult.Succeeded)
            {
                existingUser.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(existingUser);
                await _signInManager.SignInAsync(existingUser, isPersistent: true);
                return Redirect($"{baseUrl}{returnUrl ?? "/"}");
            }

            // Failed to link external login to existing account
            return Redirect($"{baseUrl}/login?error=external_link_failed");
        }

        // No user exists with this email; create a new one and link the external login
        var newUser = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = name ?? email.Split('@')[0],
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        var createUserResult = await _userManager.CreateAsync(newUser);
        if (createUserResult.Succeeded)
        {
            var addLoginResult = await _userManager.AddLoginAsync(newUser, info);
            if (addLoginResult.Succeeded)
            {
                await _signInManager.SignInAsync(newUser, isPersistent: true);
                return Redirect($"{baseUrl}{returnUrl ?? "/"}");
            }
        }

        // Something went wrong creating or linking the user
        return Redirect($"{baseUrl}/login?error=external_signup_failed");
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

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            isAuthenticated = true,
            user = new
            {
                id = user.Id,
                email = user.Email,
                displayName = user.DisplayName,
                userName = user.UserName,
                roles = roles
            }
        });
    }
}

// Request models
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}
