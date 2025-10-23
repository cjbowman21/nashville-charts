import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { chartsApi } from '../services/api'

function MyCharts() {
  const { user } = useAuth()
  const [charts, setCharts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMyCharts()
    }
  }, [user])

  const loadMyCharts = async () => {
    try {
      const response = await chartsApi.getAll({ userId: user.id })
      setCharts(response.data)
    } catch (error) {
      console.error('Failed to load charts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this chart?')) return

    try {
      await chartsApi.delete(id)
      setCharts(charts.filter(c => c.id !== id))
    } catch (error) {
      console.error('Failed to delete chart:', error)
    }
  }

  if (!user) {
    return <p>Please log in to view your charts.</p>
  }

  return (
    <div className="my-charts-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Charts</h1>
        <Button as={Link} to="/charts/new" variant="primary">
          New Chart
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : charts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-4">You haven't created any charts yet.</p>
          <Button as={Link} to="/charts/new" variant="primary">
            Create Your First Chart
          </Button>
        </div>
      ) : (
        <Row>
          {charts.map((chart) => (
            <Col key={chart.id} md={6} lg={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{chart.title}</Card.Title>
                  {chart.artist && (
                    <Card.Subtitle className="mb-2 text-muted">
                      {chart.artist}
                    </Card.Subtitle>
                  )}
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">Key: {chart.key}</Badge>
                    <Badge bg="info" className="me-2">{chart.timeSignature}</Badge>
                    <Badge bg={chart.isPublic ? 'success' : 'warning'}>
                      {chart.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <div className="text-muted small mb-3">
                    <span className="me-3">👁️ {chart.viewCount}</span>
                    <span>👍 {chart.netVotes}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/charts/${chart.id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View
                    </Button>
                    <Button
                      as={Link}
                      to={`/charts/${chart.id}/edit`}
                      variant="outline-secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(chart.id)}
                    >
                      Delete
                    </Button>
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

export default MyCharts
