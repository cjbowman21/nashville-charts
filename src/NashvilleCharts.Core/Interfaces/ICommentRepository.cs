using NashvilleCharts.Core.Entities;

namespace NashvilleCharts.Core.Interfaces;

public interface ICommentRepository
{
    Task<ChartComment?> GetByIdAsync(Guid id, bool includeDeleted = false);
    Task<IEnumerable<ChartComment>> GetByChartIdAsync(Guid chartId, bool includeDeleted = false);
    Task<ChartComment> CreateAsync(ChartComment comment);
    Task<ChartComment> UpdateAsync(ChartComment comment);
    Task DeleteAsync(Guid id, bool hardDelete = false);
}
