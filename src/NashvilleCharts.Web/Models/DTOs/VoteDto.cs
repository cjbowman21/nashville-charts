namespace NashvilleCharts.Web.Models.DTOs;

public class VoteDto
{
    public int VoteType { get; set; } // 1 = upvote, -1 = downvote
}

public class VoteResultDto
{
    public int NetVotes { get; set; }
    public int? UserVote { get; set; }
}
