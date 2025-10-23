import { useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Tabs, Tab, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

function Login() {
  const { user, register, loginWithPassword, loginWithProvider } = useAuth()
  const [activeTab, setActiveTab] = useState('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Register state
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerDisplayName, setRegisterDisplayName] = useState('')

  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await loginWithPassword(loginEmail, loginPassword, rememberMe)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(registerEmail, registerPassword, registerDisplayName)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <Container className="login-page py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Nashville Charts</h2>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k)
                  setError('')
                }}
                className="mb-4"
              >
                <Tab eventKey="login" title="Login">
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="register" title="Register">
                  <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Display Name (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="How should we call you?"
                        value={registerDisplayName}
                        onChange={(e) => setRegisterDisplayName(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        If not provided, we'll use your email.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <Form.Text className="text-muted">
                        Must be at least 8 characters with uppercase, lowercase, and number.
                      </Form.Text>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Register'}
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              <div className="text-center my-3">
                <small className="text-muted">or continue with</small>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => loginWithProvider('Google')}
                  disabled={loading}
                >
                  <i className="bi bi-google me-2"></i>
                  Google
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => loginWithProvider('Facebook')}
                  disabled={loading}
                >
                  <i className="bi bi-facebook me-2"></i>
                  Facebook
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
