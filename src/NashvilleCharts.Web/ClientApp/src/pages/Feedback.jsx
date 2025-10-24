import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

const Feedback = () => {
  const { user } = useAuth();
  const [type, setType] = useState('Bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.submitFeedback({
        type,
        title,
        description,
        priority
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setPriority('Medium');

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">We Want Your Feedback!</h2>
              <p className="text-center text-muted mb-4">
                Help us improve Nashville Charts by reporting bugs or suggesting new features.
              </p>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
                  Thank you! Your feedback has been submitted successfully. We'll review it soon.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Feedback Type *</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Bug Report"
                      name="type"
                      id="type-bug"
                      value="Bug"
                      checked={type === 'Bug'}
                      onChange={(e) => setType(e.target.value)}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Feature Request"
                      name="type"
                      id="type-enhancement"
                      value="Enhancement"
                      checked={type === 'Enhancement'}
                      onChange={(e) => setType(e.target.value)}
                    />
                  </div>
                  {type === 'Bug' && (
                    <Form.Text className="text-muted">
                      Report something that's not working correctly
                    </Form.Text>
                  )}
                  {type === 'Enhancement' && (
                    <Form.Text className="text-muted">
                      Suggest a new feature or improvement
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low - Minor issue or nice-to-have</option>
                    <option value="Medium">Medium - Affects usability</option>
                    <option value="High">High - Critical or blocking issue</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={type === 'Bug' ? 'Brief summary of the bug' : 'Brief description of the feature'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                  />
                  <Form.Text className="text-muted">
                    {title.length}/200 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    placeholder={
                      type === 'Bug'
                        ? 'Please describe:\n- What happened?\n- What did you expect to happen?\n- Steps to reproduce (if applicable)\n- Browser and device info (if relevant)'
                        : 'Please describe:\n- What problem would this solve?\n- How would this feature work?\n- Any examples or similar features in other apps?'
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={5000}
                    required
                  />
                  <Form.Text className="text-muted">
                    {description.length}/5000 characters
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Feedback;
