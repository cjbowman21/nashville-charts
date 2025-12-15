import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap'
import { chartsApi, votesApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function Browse() {
  const [charts, setCharts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const { user } = useAuth()

  useEffect(() => {
    loadCharts()
  }, [sort])

  const loadCharts = async () => {
    try {
      setLoading(true)
      const response = await chartsApi.getAll({ sort })
      setCharts(response.data)
    } catch (error) {
      console.error('Failed to load charts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadCharts()
      return
    }

    try {
      setLoading(true)
      const response = await chartsApi.search(searchQuery)
      setCharts(response.data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvoteClick = async (event, chartId, currentUserVote) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      alert('Please log in to vote on charts.')
      return
    }

    try {
      let response
      if (currentUserVote === 1) {
        response = await votesApi.removeVote(chartId)
      } else {
        response = await votesApi.vote(chartId, 1)
      }

      const { netVotes, userVote } = response.data
      setCharts((prev) =>
        prev.map((c) =>
          c.id === chartId ? { ...c, netVotes, userVote } : c
        )
      )
    } catch (error) {
      console.error('Failed to submit vote:', error)
    }
  }

  return (
    <div className="browse-page">
      <h1 className="mb-4">Browse Charts</h1>

      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={8}>
            <Form.Control
              type="search"
              placeholder="Search by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="top">Top Rated</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button type="submit" className="w-100">Search</Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <p>Loading...</p>
      ) : charts.length === 0 ? (
        <p>No charts found.</p>
      ) : (
        <Row>
          {charts.map((chart) => (
            <Col key={chart.id} md={6} lg={4} className="mb-3">
              <Card as={Link} to={`/charts/${chart.id}`} className="h-100 text-decoration-none">
                <Card.Body>
                  <Card.Title>{chart.title}</Card.Title>
                  {chart.artist && (
                    <Card.Subtitle className="mb-2 text-muted">
                      {chart.artist}
                    </Card.Subtitle>
                  )}
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">Key: {chart.key}</Badge>
                    <Badge bg="info">{chart.timeSignature}</Badge>
                  </div>
                  <div className="text-muted small">
                    <span className="me-3">👤 {chart.userDisplayName}</span>
                    <span className="me-3">👁️ {chart.viewCount}</span>
                    <span className="me-3">
                      <Button
                        variant={chart.userVote === 1 ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={(e) => handleUpvoteClick(e, chart.id, chart.userVote)}
                      >
                        👍 {chart.netVotes}
                      </Button>
                    </span>
                    <span>
                      💬 {chart.commentCount}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default Browse
