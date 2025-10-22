import { useState } from 'react'
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap'
import ChartRenderer from '../components/Viewer/ChartRenderer'
import exampleCharts from '../models/exampleCharts'

function ChartDemo() {
  const [selectedChart, setSelectedChart] = useState('simple')

  const charts = {
    simple: exampleCharts.simple,
    pop: exampleCharts.pop,
    jazz: exampleCharts.jazz,
    complex: exampleCharts.complex
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Chart Renderer Demo</h1>
          <p className="text-muted">
            Select a chart to see how the Nashville Number System renderer displays it.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <ButtonGroup>
            <Button
              variant={selectedChart === 'simple' ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedChart('simple')}
            >
              Simple
            </Button>
            <Button
              variant={selectedChart === 'pop' ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedChart('pop')}
            >
              Pop
            </Button>
            <Button
              variant={selectedChart === 'jazz' ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedChart('jazz')}
            >
              Jazz
            </Button>
            <Button
              variant={selectedChart === 'complex' ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedChart('complex')}
            >
              Complex
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '8px' }}>
            <ChartRenderer chart={charts[selectedChart]} />
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <details>
            <summary className="btn btn-sm btn-outline-secondary">
              View JSON
            </summary>
            <pre className="mt-3 p-3 bg-light border rounded">
              {JSON.stringify(charts[selectedChart].toJSON(), null, 2)}
            </pre>
          </details>
        </Col>
      </Row>
    </Container>
  )
}

export default ChartDemo
