import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Card, Button, Alert, Spinner, ButtonGroup, Form } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { chartsApi, votesApi, commentsApi } from '../services/api'
import Chart from '../models/Chart'
import ChartRenderer from '../components/Viewer/ChartRenderer'
import ExportButton from '../components/Common/ExportButton'

function ChartView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const chartRef = useRef(null)

  const [chart, setChart] = useState(null)
  const [chartMeta, setChartMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    if (id) {
      loadChart()
      loadComments()
    }
  }, [id])

  const loadChart = async () => {
    try {
      setLoading(true)
      const response = await chartsApi.getById(id)
      const dto = response.data
      const loadedChart = Chart.fromJSON(JSON.parse(dto.content))
      setChart(loadedChart)
      setChartMeta(dto)
    } catch (err) {
      setError('Failed to load chart: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      setCommentsLoading(true)
      const response = await commentsApi.getAll(id)
      setComments(response.data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to vote on charts.')
      return
    }

    if (!chartMeta) return

    try {
      let response
      if (chartMeta.userVote === 1) {
        response = await votesApi.removeVote(chartMeta.id)
      } else {
        response = await votesApi.vote(chartMeta.id, 1)
      }

      const { netVotes, userVote } = response.data
      setChartMeta((prev) =>
        prev ? { ...prev, netVotes, userVote } : prev
      )
    } catch (err) {
      console.error('Failed to submit vote:', err)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!user) {
      alert('Please log in to leave a comment.')
      return
    }

    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.')
      return
    }

    try {
      setCommentError('')
      await commentsApi.create(id, { content: newComment.trim() })
      setNewComment('')
      await loadComments()
      setChartMeta((prev) =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev
      )
    } catch (err) {
      console.error('Failed to submit comment:', err)
      setCommentError('Failed to submit comment.')
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading chart...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/my-charts')}>
          Back to My Charts
        </Button>
      </Container>
    )
  }

  if (!chart) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Chart not found</Alert>
        <Button variant="primary" onClick={() => navigate('/my-charts')}>
          Back to My Charts
        </Button>
      </Container>
    )
  }

  const isOwner = user && chartMeta && chartMeta.userId === user.id

  const renderComments = (commentList) => {
    if (!commentList || commentList.length === 0) return null

    return (
      <div className="mt-3">
        {commentList.map((comment) => (
          <div key={comment.id} className="mb-3">
            <div className="fw-bold">{comment.userDisplayName}</div>
            <div className="small text-muted">
              {new Date(comment.createdAt).toLocaleString()}
            </div>
            <div>{comment.content}</div>
            {comment.replies && comment.replies.length > 0 && (
              <div className="ms-3 border-start ps-3">
                {renderComments(comment.replies)}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">
              {chartMeta ? chartMeta.title : 'Chart View'}
            </h4>
            {chartMeta && (
              <div className="text-muted small">
                <span className="me-3">{chartMeta.artist}</span>
                <span className="me-3">👁️ {chartMeta.viewCount}</span>
                <span className="me-3">
                  <Button
                    variant={chartMeta.userVote === 1 ? 'success' : 'outline-success'}
                    size="sm"
                    onClick={handleUpvote}
                  >
                    👍 {chartMeta.netVotes}
                  </Button>
                </span>
                <span>
                  💬 {chartMeta.commentCount}
                </span>
              </div>
            )}
          </div>
          <ButtonGroup>
            {isOwner && (
              <Button
                as={Link}
                to={`/charts/${id}/edit`}
                variant="outline-secondary"
                size="sm"
              >
                Edit
              </Button>
            )}
            <ExportButton
              chart={chart}
              elementRef={chartRef}
              size="sm"
              variant="primary"
            />
          </ButtonGroup>
        </Card.Header>
        <Card.Body>
          <div ref={chartRef}>
            <ChartRenderer chart={chart} showMetadata={true} />
          </div>

          {chartMeta && chartMeta.allowComments && (
            <div className="mt-4">
              <h5>Comments</h5>
              <Form onSubmit={handleSubmitComment} className="mb-3">
                <Form.Group controlId="newComment">
                  <Form.Label>Leave a comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this chart..."
                  />
                </Form.Group>
                {commentError && (
                  <Alert variant="danger" className="mt-2">
                    {commentError}
                  </Alert>
                )}
                <Button type="submit" className="mt-2">
                  Submit Comment
                </Button>
              </Form>

              {commentsLoading ? (
                <div className="text-muted">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-muted">No comments yet. Be the first to comment!</div>
              ) : (
                renderComments(comments)
              )}
            </div>
          )}
        </Card.Body>
        <Card.Footer>
          <Button variant="outline-secondary" onClick={() => navigate('/my-charts')}>
            Back to My Charts
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  )
}

export default ChartView
