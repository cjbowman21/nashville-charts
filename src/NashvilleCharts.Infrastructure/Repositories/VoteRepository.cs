using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Infrastructure.Data;

namespace NashvilleCharts.Infrastructure.Repositories;

public class VoteRepository : IVoteRepository
{
    private readonly ApplicationDbContext _context;

    public VoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ChartVote?> GetVoteAsync(Guid chartId, string userId)
    {
        return await _context.ChartVotes
            .FirstOrDefaultAsync(v => v.ChartId == chartId && v.UserId == userId);
    }

    public async Task<ChartVote> CreateOrUpdateVoteAsync(Guid chartId, string userId, int voteType)
    {
        if (voteType != 1 && voteType != -1)
            throw new ArgumentException("Vote type must be 1 (upvote) or -1 (downvote).");

        var existingVote = await GetVoteAsync(chartId, userId);

        if (existingVote != null)
        {
            // Update existing vote
            existingVote.VoteType = voteType;
            existingVote.CreatedAt = DateTime.UtcNow; // Update timestamp
            _context.ChartVotes.Update(existingVote);
        }
        else
        {
            // Create new vote
            existingVote = new ChartVote
            {
                ChartId = chartId,
                UserId = userId,
                VoteType = voteType,
                CreatedAt = DateTime.UtcNow
            };
            _context.ChartVotes.Add(existingVote);
        }

        await _context.SaveChangesAsync();
        return existingVote;
    }

    public async Task DeleteVoteAsync(Guid chartId, string userId)
    {
        var vote = await GetVoteAsync(chartId, userId);

        if (vote != null)
        {
            _context.ChartVotes.Remove(vote);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetNetVotesAsync(Guid chartId)
    {
        return await _context.ChartVotes
            .Where(v => v.ChartId == chartId)
            .SumAsync(v => v.VoteType);
    }
}
