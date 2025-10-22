using NashvilleCharts.Core.Entities;

namespace NashvilleCharts.Core.Interfaces;

public interface IChartRepository
{
    Task<Chart?> GetByIdAsync(Guid id, bool includeDeleted = false);
    Task<IEnumerable<Chart>> GetAllAsync(bool includePrivate = false, bool includeDeleted = false);
    Task<IEnumerable<Chart>> GetByUserIdAsync(string userId, bool includeDeleted = false);
    Task<IEnumerable<Chart>> SearchAsync(string query, bool includePrivate = false);
    Task<IEnumerable<Chart>> GetTopRatedAsync(int count = 10);
    Task<Chart> CreateAsync(Chart chart);
    Task<Chart> UpdateAsync(Chart chart);
    Task DeleteAsync(Guid id, bool hardDelete = false);
    Task<int> GetVoteCountAsync(Guid chartId);
    Task IncrementViewCountAsync(Guid chartId);
}
