import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

function Login() {
  const { user, login } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <Container className="login-page py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Login to Nashville Charts</h2>
              <p className="text-center text-muted mb-4">
                Sign in to create and share your charts
              </p>
              <div className="d-grid gap-3">
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={() => login('Google')}
                >
                  <i className="bi bi-google me-2"></i>
                  Continue with Google
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => login('Facebook')}
                >
                  <i className="bi bi-facebook me-2"></i>
                  Continue with Facebook
                </Button>
              </div>
              <p className="text-center text-muted small mt-4 mb-0">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
