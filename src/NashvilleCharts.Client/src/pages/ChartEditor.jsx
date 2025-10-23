import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Card, ButtonGroup, Alert } from 'react-bootstrap'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../contexts/AuthContext'
import { chartsApi } from '../services/api'
import Chart, { Section, Measure, Chord, SectionTypes } from '../models/Chart'
import ChartRenderer from '../components/Viewer/ChartRenderer'
import ChordBottomSheet from '../components/Editor/ChordBottomSheet'
import { KEYS } from '../utils/chartUtils'
import './ChartEditor.css'

// Sortable Measure component for drag and drop
function SortableMeasure({ id, measure, sectionIndex, measureIndex, onEdit, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`measure-group d-flex align-items-center gap-1 ${isDragging ? 'dragging' : ''}`}
    >
      {/* Drag handle - the entire measure group */}
      <div {...attributes} {...listeners} className="drag-handle d-flex gap-1 align-items-center">
        <span className="text-muted">⋮⋮</span>
        <div className="d-flex gap-1">
          {measure.chords.map((chord, cIndex) => (
            <Button
              key={cIndex}
              variant="outline-primary"
              size="sm"
              onClick={() => onEdit(sectionIndex, measureIndex, cIndex)}
              title="Click to edit"
            >
              {chord.toString()}
            </Button>
          ))}
        </div>
      </div>

      {/* Delete measure button */}
      <Button
        variant="link"
        size="sm"
        className="text-danger p-0"
        onClick={() => onRemove(sectionIndex, measureIndex)}
        title="Delete measure"
      >
        ×
      </Button>
    </div>
  )
}

function ChartEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold to start drag on touch
        tolerance: 5,
      },
    })
  )

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
  const [editingChordIndex, setEditingChordIndex] = useState(null)

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

  const updateChartMetadata = (field, value) => {
    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      updated[field] = value
      return updated
    })
  }

  const addSection = (type) => {
    const newSection = new Section(type, `${type.charAt(0).toUpperCase() + type.slice(1)} ${chart.sections.length + 1}`, [])
    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      updated.sections.push(newSection)
      return updated
    })
  }

  const updateSectionLabel = (sectionIndex, label) => {
    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      updated.sections[sectionIndex].label = label
      return updated
    })
  }

  const removeSection = (index) => {
    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      updated.sections = updated.sections.filter((_, i) => i !== index)
      return updated
    })
  }

  const addMeasure = (sectionIndex) => {
    setEditingSection(sectionIndex)
    setEditingMeasure(null)
    setEditingChordIndex(null)
    setShowChordSheet(true)
  }

  const editChord = (sectionIndex, measureIndex, chordIndex) => {
    setEditingSection(sectionIndex)
    setEditingMeasure(measureIndex)
    setEditingChordIndex(chordIndex)
    setShowChordSheet(true)
  }

  const handleChordSelected = (chordData) => {
    const chord = new Chord(chordData.numeral, chordData.modifiers, chordData.bassNote)
    chord.accidental = chordData.accidental

    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      const section = updated.sections[editingSection]

      if (editingMeasure === null) {
        // Add new measure
        section.measures.push(Measure.single(chord))
      } else if (editingChordIndex !== null) {
        // Edit existing chord
        section.measures[editingMeasure].chords[editingChordIndex] = chord
      } else {
        // Add chord to existing measure (make it split)
        section.measures[editingMeasure].chords.push(chord)
      }

      return updated
    })

    setShowChordSheet(false)
    setEditingChordIndex(null)
  }

  const removeMeasure = (sectionIndex, measureIndex) => {
    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      updated.sections[sectionIndex].measures = updated.sections[sectionIndex].measures.filter((_, i) => i !== measureIndex)
      return updated
    })
  }

  const handleDragEnd = (event, sectionIndex) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setChart(prevChart => {
      const updated = Chart.fromJSON(prevChart.toJSON())
      const section = updated.sections[sectionIndex]
      const measures = section.measures

      // Get old and new indices from the IDs
      const oldIndex = measures.findIndex((_, i) => `${sectionIndex}-${i}` === active.id)
      const newIndex = measures.findIndex((_, i) => `${sectionIndex}-${i}` === over.id)

      // Reorder the array
      const [removed] = measures.splice(oldIndex, 1)
      measures.splice(newIndex, 0, removed)

      return updated
    })
  }

  const getInitialChordData = () => {
    if (editingMeasure !== null && editingChordIndex !== null) {
      const chord = chart.sections[editingSection].measures[editingMeasure].chords[editingChordIndex]
      return {
        numeral: chord.numeral,
        accidental: chord.accidental,
        modifiers: chord.modifiers,
        bassNote: chord.bassNote
      }
    }
    return null
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
                    onChange={(e) => updateChartMetadata('title', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Artist</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Artist name"
                    value={chart.artist}
                    onChange={(e) => updateChartMetadata('artist', e.target.value)}
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Key *</Form.Label>
                      <Form.Select
                        value={chart.key}
                        onChange={(e) => updateChartMetadata('key', e.target.value)}
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
                        onChange={(e) => updateChartMetadata('timeSignature', e.target.value)}
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
                        onChange={(e) => updateChartMetadata('tempo', parseInt(e.target.value) || null)}
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
                    onChange={(e) => updateChartMetadata('notes', e.target.value)}
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
                        onChange={(e) => updateSectionLabel(sIndex, e.target.value)}
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

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, sIndex)}
                      >
                        <SortableContext
                          items={section.measures.map((_, mIndex) => `${sIndex}-${mIndex}`)}
                          strategy={horizontalListSortingStrategy}
                        >
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {section.measures.map((measure, mIndex) => (
                              <SortableMeasure
                                key={`${sIndex}-${mIndex}`}
                                id={`${sIndex}-${mIndex}`}
                                measure={measure}
                                sectionIndex={sIndex}
                                measureIndex={mIndex}
                                onEdit={editChord}
                                onRemove={removeMeasure}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

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
        onHide={() => {
          setShowChordSheet(false)
          setEditingChordIndex(null)
        }}
        onChordSelected={handleChordSelected}
        initialData={getInitialChordData()}
      />
    </Container>
  )
}

export default ChartEditor
