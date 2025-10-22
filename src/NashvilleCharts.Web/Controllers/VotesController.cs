using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Web.Models.DTOs;
using System.Security.Claims;

namespace NashvilleCharts.Web.Controllers;

[ApiController]
[Route("api/charts/{chartId}/[controller]")]
[Authorize]
public class VotesController : ControllerBase
{
    private readonly IVoteRepository _voteRepository;
    private readonly IChartRepository _chartRepository;

    public VotesController(IVoteRepository voteRepository, IChartRepository chartRepository)
    {
        _voteRepository = voteRepository;
        _chartRepository = chartRepository;
    }

    [HttpPost]
    public async Task<ActionResult<VoteResultDto>> Vote(Guid chartId, [FromBody] VoteDto dto)
    {
        // Verify chart exists
        var chart = await _chartRepository.GetByIdAsync(chartId);
        if (chart == null)
            return NotFound("Chart not found");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Validate vote type
        if (dto.VoteType != 1 && dto.VoteType != -1)
            return BadRequest("Vote type must be 1 (upvote) or -1 (downvote)");

        // Create or update vote
        await _voteRepository.CreateOrUpdateVoteAsync(chartId, userId, dto.VoteType);

        // Get updated vote counts
        var netVotes = await _voteRepository.GetNetVotesAsync(chartId);
        var userVote = await _voteRepository.GetVoteAsync(chartId, userId);

        return Ok(new VoteResultDto
        {
            NetVotes = netVotes,
            UserVote = userVote?.VoteType
        });
    }

    [HttpDelete]
    public async Task<ActionResult<VoteResultDto>> RemoveVote(Guid chartId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        await _voteRepository.DeleteVoteAsync(chartId, userId);

        var netVotes = await _voteRepository.GetNetVotesAsync(chartId);

        return Ok(new VoteResultDto
        {
            NetVotes = netVotes,
            UserVote = null
        });
    }
}
