using NashvilleCharts.Core.Entities;

namespace NashvilleCharts.Core.Interfaces;

public interface IVoteRepository
{
    Task<ChartVote?> GetVoteAsync(Guid chartId, string userId);
    Task<ChartVote> CreateOrUpdateVoteAsync(Guid chartId, string userId, int voteType);
    Task DeleteVoteAsync(Guid chartId, string userId);
    Task<int> GetNetVotesAsync(Guid chartId);
}
