import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Card, ButtonGroup, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { chartsApi } from '../services/api'
import Chart, { Section, Measure, Chord, SectionTypes } from '../models/Chart'
import ChartRenderer from '../components/Viewer/ChartRenderer'
import ChordBottomSheet from '../components/Editor/ChordBottomSheet'
import { KEYS } from '../utils/chartUtils'

function ChartEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Chart state
  const [chart, setChart] = useState(new Chart())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editor state
  const [showChordSheet, setShowChordSheet] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [editingMeasure, setEditingMeasure] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (id) {
      loadChart()
    }
  }, [id, user])

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

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const chartData = {
        title: chart.title,
        artist: chart.artist,
        key: chart.key,
        timeSignature: chart.timeSignature,
        tempo: chart.tempo,
        content: JSON.stringify(chart.toJSON()),
        isPublic: false,
        allowComments: true
      }

      if (id) {
        await chartsApi.update(id, chartData)
        setSuccess('Chart updated successfully!')
      } else {
        const response = await chartsApi.create(chartData)
        setSuccess('Chart created successfully!')
        navigate(`/charts/${response.data.id}/edit`)
      }
    } catch (err) {
      setError('Failed to save chart: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const addSection = (type) => {
    const newSection = new Section(type, `${type.charAt(0).toUpperCase() + type.slice(1)} ${chart.sections.length + 1}`, [])
    setChart(prevChart => {
      const updated = { ...prevChart }
      updated.sections = [...updated.sections, newSection]
      return updated
    })
  }

  const removeSection = (index) => {
    setChart(prevChart => {
      const updated = { ...prevChart }
      updated.sections = updated.sections.filter((_, i) => i !== index)
      return updated
    })
  }

  const addMeasure = (sectionIndex) => {
    setEditingSection(sectionIndex)
    setEditingMeasure(null)
    setShowChordSheet(true)
  }

  const handleChordSelected = (chordData) => {
    const chord = new Chord(chordData.numeral, chordData.modifiers, chordData.bassNote)
    chord.accidental = chordData.accidental

    setChart(prevChart => {
      const updated = { ...prevChart }
      const section = updated.sections[editingSection]

      if (editingMeasure === null) {
        // Add new measure
        section.measures.push(Measure.single(chord))
      } else {
        // Add chord to existing measure (make it split)
        section.measures[editingMeasure].chords.push(chord)
      }

      return updated
    })

    setShowChordSheet(false)
  }

  const removeMeasure = (sectionIndex, measureIndex) => {
    setChart(prevChart => {
      const updated = { ...prevChart }
      updated.sections[sectionIndex].measures = updated.sections[sectionIndex].measures.filter((_, i) => i !== measureIndex)
      return updated
    })
  }

  if (!user) {
    return null
  }

  return (
    <Container fluid className="chart-editor py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        {/* Left Panel: Editor */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h4>{id ? 'Edit Chart' : 'New Chart'}</h4>
            </Card.Header>
            <Card.Body>
              {/* Metadata Form */}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Song title"
                    value={chart.title}
                    onChange={(e) => setChart({ ...chart, title: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Artist</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Artist name"
                    value={chart.artist}
                    onChange={(e) => setChart({ ...chart, artist: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Key *</Form.Label>
                      <Form.Select
                        value={chart.key}
                        onChange={(e) => setChart({ ...chart, key: e.target.value })}
                      >
                        {KEYS.map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Select
                        value={chart.timeSignature}
                        onChange={(e) => setChart({ ...chart, timeSignature: e.target.value })}
                      >
                        <option value="4/4">4/4</option>
                        <option value="3/4">3/4</option>
                        <option value="6/8">6/8</option>
                        <option value="2/4">2/4</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tempo (BPM)</Form.Label>
                      <Form.Control
                        type="number"
                        min="40"
                        max="240"
                        value={chart.tempo || ''}
                        onChange={(e) => setChart({ ...chart, tempo: parseInt(e.target.value) || null })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Optional notes about the chart"
                    value={chart.notes || ''}
                    onChange={(e) => setChart({ ...chart, notes: e.target.value })}
                  />
                </Form.Group>
              </Form>

              <hr />

              {/* Sections */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Sections</h5>
                  <ButtonGroup size="sm">
                    <Button variant="outline-primary" onClick={() => addSection(SectionTypes.INTRO)}>
                      + Intro
                    </Button>
                    <Button variant="outline-primary" onClick={() => addSection(SectionTypes.VERSE)}>
                      + Verse
                    </Button>
                    <Button variant="outline-primary" onClick={() => addSection(SectionTypes.CHORUS)}>
                      + Chorus
                    </Button>
                    <Button variant="outline-primary" onClick={() => addSection(SectionTypes.BRIDGE)}>
                      + Bridge
                    </Button>
                    <Button variant="outline-primary" onClick={() => addSection(SectionTypes.OUTRO)}>
                      + Outro
                    </Button>
                  </ButtonGroup>
                </div>

                {chart.sections.length === 0 && (
                  <Alert variant="info">
                    No sections yet. Click the buttons above to add sections.
                  </Alert>
                )}

                {chart.sections.map((section, sIndex) => (
                  <Card key={sIndex} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <Form.Control
                        type="text"
                        value={section.label}
                        onChange={(e) => {
                          const updated = { ...chart }
                          updated.sections[sIndex].label = e.target.value
                          setChart(updated)
                        }}
                        className="w-50"
                      />
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeSection(sIndex)}
                      >
                        Remove Section
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {section.measures.length === 0 && (
                        <p className="text-muted">No measures yet.</p>
                      )}

                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {section.measures.map((measure, mIndex) => (
                          <div key={mIndex} className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="measure-preview"
                            >
                              {measure.chords.map(c => c.toString()).join(' ')}
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-0 ms-1"
                              onClick={() => removeMeasure(sIndex, mIndex)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => addMeasure(sIndex)}
                      >
                        + Add Chord
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              <hr />

              {/* Save Button */}
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleSave}
                  disabled={saving || !chart.title || chart.sections.length === 0}
                >
                  {saving ? 'Saving...' : (id ? 'Update Chart' : 'Create Chart')}
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate('/my-charts')}>
                  Cancel
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel: Preview */}
        <Col lg={6}>
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Header>
              <h5>Preview</h5>
            </Card.Header>
            <Card.Body>
              {chart.title ? (
                <ChartRenderer chart={chart} showMetadata={true} />
              ) : (
                <Alert variant="info">
                  Fill in the chart details to see a preview
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chord Bottom Sheet */}
      <ChordBottomSheet
        show={showChordSheet}
        onHide={() => setShowChordSheet(false)}
        onChordSelected={handleChordSelected}
      />
    </Container>
  )
}

export default ChartEditor
