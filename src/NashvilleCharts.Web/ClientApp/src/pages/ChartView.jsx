import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Card, Button, Alert, Spinner, ButtonGroup } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { chartsApi } from '../services/api'
import Chart from '../models/Chart'
import ChartRenderer from '../components/Viewer/ChartRenderer'
import ExportButton from '../components/Common/ExportButton'

function ChartView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const chartRef = useRef(null)

  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadChart()
    }
  }, [id])

  const loadChart = async () => {
    try {
      setLoading(true)
      const response = await chartsApi.getById(id)
      const loadedChart = Chart.fromJSON(JSON.parse(response.data.content))
      setChart(loadedChart)
    } catch (err) {
      setError('Failed to load chart: ' + err.message)
    } finally {
      setLoading(false)
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

  const isOwner = user && chart.userId === user.id

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Chart View</h4>
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
