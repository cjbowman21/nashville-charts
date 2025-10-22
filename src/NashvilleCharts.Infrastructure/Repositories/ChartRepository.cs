using Microsoft.EntityFrameworkCore;
using NashvilleCharts.Core.Entities;
using NashvilleCharts.Core.Interfaces;
using NashvilleCharts.Infrastructure.Data;

namespace NashvilleCharts.Infrastructure.Repositories;

public class ChartRepository : IChartRepository
{
    private readonly ApplicationDbContext _context;

    public ChartRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Chart?> GetByIdAsync(Guid id, bool includeDeleted = false)
    {
        var query = _context.Charts
            .Include(c => c.User)
            .Include(c => c.Votes)
            .Include(c => c.Comments.Where(c => c.DeletedAt == null))
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Chart>> GetAllAsync(bool includePrivate = false, bool includeDeleted = false)
    {
        var query = _context.Charts
            .Include(c => c.User)
            .Include(c => c.Votes)
            .AsQueryable();

        if (!includePrivate)
        {
            query = query.Where(c => c.IsPublic);
        }

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Chart>> GetByUserIdAsync(string userId, bool includeDeleted = false)
    {
        var query = _context.Charts
            .Include(c => c.Votes)
            .Where(c => c.UserId == userId);

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.OrderByDescending(c => c.UpdatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Chart>> SearchAsync(string query, bool includePrivate = false)
    {
        var searchQuery = _context.Charts
            .Include(c => c.User)
            .Include(c => c.Votes)
            .Where(c => c.DeletedAt == null &&
                       (c.Title.Contains(query) ||
                        (c.Artist != null && c.Artist.Contains(query))))
            .AsQueryable();

        if (!includePrivate)
        {
            searchQuery = searchQuery.Where(c => c.IsPublic);
        }

        return await searchQuery
            .OrderByDescending(c => c.Votes.Sum(v => v.VoteType))
            .ThenByDescending(c => c.ViewCount)
            .ToListAsync();
    }

    public async Task<IEnumerable<Chart>> GetTopRatedAsync(int count = 10)
    {
        return await _context.Charts
            .Include(c => c.User)
            .Include(c => c.Votes)
            .Where(c => c.IsPublic && c.DeletedAt == null)
            .OrderByDescending(c => c.Votes.Sum(v => v.VoteType))
            .ThenByDescending(c => c.ViewCount)
            .Take(count)
            .ToListAsync();
    }

    public async Task<Chart> CreateAsync(Chart chart)
    {
        chart.CreatedAt = DateTime.UtcNow;
        chart.UpdatedAt = DateTime.UtcNow;

        _context.Charts.Add(chart);
        await _context.SaveChangesAsync();

        return chart;
    }

    public async Task<Chart> UpdateAsync(Chart chart)
    {
        chart.UpdatedAt = DateTime.UtcNow;

        _context.Charts.Update(chart);
        await _context.SaveChangesAsync();

        return chart;
    }

    public async Task DeleteAsync(Guid id, bool hardDelete = false)
    {
        var chart = await _context.Charts.FindAsync(id);

        if (chart == null)
            throw new KeyNotFoundException($"Chart with ID {id} not found.");

        if (hardDelete)
        {
            _context.Charts.Remove(chart);
        }
        else
        {
            chart.DeletedAt = DateTime.UtcNow;
            _context.Charts.Update(chart);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetVoteCountAsync(Guid chartId)
    {
        return await _context.ChartVotes
            .Where(v => v.ChartId == chartId)
            .SumAsync(v => v.VoteType);
    }

    public async Task IncrementViewCountAsync(Guid chartId)
    {
        var chart = await _context.Charts.FindAsync(chartId);

        if (chart != null)
        {
            chart.ViewCount++;
            await _context.SaveChangesAsync();
        }
    }
}
