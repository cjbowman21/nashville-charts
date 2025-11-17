import { useState, useEffect } from 'react'
import { Container, Nav, Tab, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserManagement from '../components/Admin/UserManagement'
import FeedbackManagement from '../components/Admin/FeedbackManagement'

function Admin() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    if (!loading && (!user || !user.roles?.includes('Admin'))) {
      navigate('/')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    )
  }

  if (!user || !user.roles?.includes('Admin')) {
    return null
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Admin Panel</h1>

      <Alert variant="info">
        Welcome to the admin panel. Here you can manage users and review feedback submissions.
      </Alert>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="users">User Management</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="feedback">Feedback Review</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="users">
            <UserManagement />
          </Tab.Pane>
          <Tab.Pane eventKey="feedback">
            <FeedbackManagement />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  )
}

export default Admin
