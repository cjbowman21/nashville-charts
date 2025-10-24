import { Link } from 'react-router-dom'
import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'

function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Nashville Charts</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/browse">Browse Charts</Nav.Link>
              <Nav.Link as={Link} to="/demo">Demo</Nav.Link>
              {user && (
                <>
                  <Nav.Link as={Link} to="/my-charts">My Charts</Nav.Link>
                  <Nav.Link as={Link} to="/charts/new">New Chart</Nav.Link>
                </>
              )}
            </Nav>
            {user && (
              <Nav className="me-3">
                <Button
                  as={Link}
                  to="/feedback"
                  variant="warning"
                  size="sm"
                  className="fw-bold"
                >
                  Send Feedback
                </Button>
              </Nav>
            )}
            <Nav>
              {user ? (
                <>
                  <Navbar.Text className="me-3">
                    Signed in as: {user.displayName || user.email}
                  </Navbar.Text>
                  <Button variant="outline-light" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button as={Link} to="/login" variant="outline-light" size="sm">
                  Login
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        {children}
      </Container>
    </>
  )
}

export default Layout
