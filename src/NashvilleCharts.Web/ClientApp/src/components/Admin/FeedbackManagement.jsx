import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Badge, Alert, Spinner, Card, Row, Col } from 'react-bootstrap'
import { adminApi } from '../../services/api'

function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filter states
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: '', priority: '' })

  useEffect(() => {
    loadFeedback()
    loadStats()
  }, [filterStatus, filterType])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      const params = {
        pageSize: 100,
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { type: filterType })
      }
      const response = await adminApi.getAllFeedback(params)
      setFeedbacks(response.data.feedbacks)
      setError('')
    } catch (err) {
      setError('Failed to load feedback: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await adminApi.getFeedbackStats()
      setStats(response.data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback)
    setUpdateForm({ status: feedback.status, priority: feedback.priority })
    setShowDetailModal(true)
  }

  const handleUpdateFeedback = async () => {
    try {
      await adminApi.updateFeedback(selectedFeedback.id, updateForm)
      setSuccess('Feedback updated successfully')
      setShowDetailModal(false)
      loadFeedback()
      loadStats()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update feedback: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return

    try {
      await adminApi.deleteFeedback(id)
      setSuccess('Feedback deleted successfully')
      loadFeedback()
      loadStats()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete feedback: ' + (err.response?.data?.error || err.message))
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'New': 'primary',
      'InProgress': 'warning',
      'Resolved': 'success',
      'Closed': 'secondary'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      'Low': 'info',
      'Medium': 'warning',
      'High': 'danger'
    }
    return <Badge bg={variants[priority] || 'secondary'}>{priority}</Badge>
  }

  const getTypeBadge = (type) => {
    const variants = {
      'Bug': 'danger',
      'Enhancement': 'success'
    }
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>
  }

  if (loading && !stats) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading feedback...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Feedback Review</h3>
        <Button variant="primary" size="sm" onClick={() => { loadFeedback(); loadStats(); }}>
          Refresh
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title>Total Feedback</Card.Title>
                <h2>{stats.totalCount}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title>By Status</Card.Title>
                {stats.byStatus.map(s => (
                  <div key={s.status}>{getStatusBadge(s.status)} {s.count}</div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title>By Type</Card.Title>
                {stats.byType.map(t => (
                  <div key={t.type}>{getTypeBadge(t.type)} {t.count}</div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title>By Priority</Card.Title>
                {stats.byPriority.map(p => (
                  <div key={p.priority}>{getPriorityBadge(p.priority)} {p.count}</div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Type</Form.Label>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="Bug">Bug</option>
                  <option value="Enhancement">Enhancement</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setFilterStatus('')
                  setFilterType('')
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Feedback Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>User</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map(feedback => (
            <tr key={feedback.id}>
              <td>{getTypeBadge(feedback.type)}</td>
              <td>
                <div style={{ maxWidth: '300px' }}>
                  <strong>{feedback.title}</strong>
                  <div className="text-muted small text-truncate">
                    {feedback.description}
                  </div>
                </div>
              </td>
              <td>{feedback.userDisplayName}</td>
              <td>{getPriorityBadge(feedback.priority)}</td>
              <td>{getStatusBadge(feedback.status)}</td>
              <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline-primary" onClick={() => handleViewDetails(feedback)}>
                    View/Edit
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(feedback.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {feedbacks.length === 0 && !loading && (
        <Alert variant="info">No feedback found matching the current filters.</Alert>
      )}

      {/* Detail/Edit Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <div className="mb-3">
                <strong>Type:</strong> {getTypeBadge(selectedFeedback.type)}
                <span className="ms-3"><strong>User:</strong> {selectedFeedback.userDisplayName}</span>
              </div>
              <div className="mb-3">
                <strong>Created:</strong> {new Date(selectedFeedback.createdAt).toLocaleString()}
                <span className="ms-3"><strong>Updated:</strong> {new Date(selectedFeedback.updatedAt).toLocaleString()}</span>
              </div>
              <hr />
              <h5>{selectedFeedback.title}</h5>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.description}</p>
              <hr />
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={updateForm.priority}
                    onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateFeedback}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default FeedbackManagement
