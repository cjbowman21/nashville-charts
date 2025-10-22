using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Infrastructure.Data;

namespace NashvilleCharts.Infrastructure.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly ApplicationDbContext _context;

    public CommentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ChartComment?> GetByIdAsync(Guid id, bool includeDeleted = false)
    {
        var query = _context.ChartComments
            .Include(c => c.User)
            .Include(c => c.Replies.Where(r => r.DeletedAt == null))
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<ChartComment>> GetByChartIdAsync(Guid chartId, bool includeDeleted = false)
    {
        var query = _context.ChartComments
            .Include(c => c.User)
            .Include(c => c.Replies.Where(r => r.DeletedAt == null))
                .ThenInclude(r => r.User)
            .Where(c => c.ChartId == chartId && c.ParentCommentId == null);

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.OrderBy(c => c.CreatedAt).ToListAsync();
    }

    public async Task<ChartComment> CreateAsync(ChartComment comment)
    {
        comment.CreatedAt = DateTime.UtcNow;
        comment.UpdatedAt = DateTime.UtcNow;

        _context.ChartComments.Add(comment);
        await _context.SaveChangesAsync();

        return comment;
    }

    public async Task<ChartComment> UpdateAsync(ChartComment comment)
    {
        comment.UpdatedAt = DateTime.UtcNow;

        _context.ChartComments.Update(comment);
        await _context.SaveChangesAsync();

        return comment;
    }

    public async Task DeleteAsync(Guid id, bool hardDelete = false)
    {
        var comment = await _context.ChartComments.FindAsync(id);

        if (comment == null)
            throw new KeyNotFoundException($"Comment with ID {id} not found.");

        if (hardDelete)
        {
            _context.ChartComments.Remove(comment);
        }
        else
        {
            comment.DeletedAt = DateTime.UtcNow;
            _context.ChartComments.Update(comment);
        }

        await _context.SaveChangesAsync();
    }
}
