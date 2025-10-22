import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'

function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <div className="hero text-center py-5 mb-5">
        <h1 className="display-4 mb-3">Nashville Charts</h1>
        <p className="lead mb-4">
          Create, share, and discover Nashville Number System charts
        </p>
        {!user && (
          <Button as={Link} to="/login" variant="primary" size="lg">
            Get Started
          </Button>
        )}
      </div>

      <Row className="mb-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Easy Chart Creation</Card.Title>
              <Card.Text>
                Mobile-first editor with intuitive input methods. Create professional
                Nashville Number charts in minutes.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Share & Discover</Card.Title>
              <Card.Text>
                Browse a community library of charts. Rate and comment on your
                favorite arrangements.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Export to PDF</Card.Title>
              <Card.Text>
                Download your charts as professional PDFs ready for rehearsals
                and performances.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-center py-4">
        <h2 className="mb-4">What is the Nashville Number System?</h2>
        <p className="lead">
          The Nashville Number System is a method of transcribing music by denoting
          chords as numbers (I-VII) based on their scale degree. Charts remain valid
          when transposing to different keys, making them perfect for studio work and
          live performances.
        </p>
        <Button as={Link} to="/browse" variant="outline-primary" className="mt-3">
          Browse Charts
        </Button>
      </div>
    </div>
  )
}

export default Home
