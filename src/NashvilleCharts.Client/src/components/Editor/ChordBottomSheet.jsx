import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, ButtonGroup, Badge } from 'react-bootstrap'
import { ChordModifiers } from '../../models/Chart'
import './ChordBottomSheet.css'

/**
 * Bottom sheet for selecting chord numerals and modifiers
 * Mobile-first design with large touch targets
 */
function ChordBottomSheet({ show, onHide, onChordSelected }) {
  const [selectedNumeral, setSelectedNumeral] = useState(null)
  const [selectedAccidental, setSelectedAccidental] = useState(null)
  const [selectedModifiers, setSelectedModifiers] = useState([])
  const [bassNote, setBassNote] = useState(null)

  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  const accidentals = [
    { value: null, label: 'Natural' },
    { value: 'b', label: '♭ Flat' },
    { value: '#', label: '♯ Sharp' }
  ]

  const qualityModifiers = [
    { value: ChordModifiers.MINOR, label: 'Minor (m)', symbol: 'm' },
    { value: ChordModifiers.SEVENTH, label: 'Dominant 7th', symbol: '⁷' },
    { value: ChordModifiers.MAJOR_SEVENTH, label: 'Major 7th', symbol: 'Δ⁷' },
    { value: ChordModifiers.DIMINISHED, label: 'Diminished', symbol: '°' },
    { value: ChordModifiers.AUGMENTED, label: 'Augmented', symbol: '+' },
    { value: ChordModifiers.SUSPENDED_4, label: 'Sus4', symbol: 'sus⁴' },
    { value: ChordModifiers.SUSPENDED_2, label: 'Sus2', symbol: 'sus²' }
  ]

  const graphicalModifiers = [
    { value: ChordModifiers.DIAMOND, label: 'Diamond', symbol: '◇', desc: 'Let ring' },
    { value: ChordModifiers.PUSH_BACK, label: 'Push Back', symbol: '<', desc: 'Syncopate earlier' },
    { value: ChordModifiers.PUSH_FORWARD, label: 'Push Forward', symbol: '>', desc: 'Syncopate later' },
    { value: ChordModifiers.STACCATO, label: 'Staccato', symbol: '^', desc: 'Choke' }
  ]

  const toggleModifier = (modifier) => {
    if (selectedModifiers.includes(modifier)) {
      setSelectedModifiers(selectedModifiers.filter(m => m !== modifier))
    } else {
      setSelectedModifiers([...selectedModifiers, modifier])
    }
  }

  const handleAdd = () => {
    if (!selectedNumeral) return

    const chord = {
      numeral: selectedNumeral,
      accidental: selectedAccidental,
      modifiers: selectedModifiers,
      bassNote: bassNote
    }

    onChordSelected(chord)
    handleReset()
  }

  const handleReset = () => {
    setSelectedNumeral(null)
    setSelectedAccidental(null)
    setSelectedModifiers([])
    setBassNote(null)
  }

  const handleClose = () => {
    handleReset()
    onHide()
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      fullscreen="md-down"
      centered
      className="chord-bottom-sheet"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Chord</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Step 1: Select Numeral */}
        <div className="selection-section">
          <h5 className="section-title">1. Select Numeral</h5>
          <ButtonGroup className="numeral-buttons w-100">
            {numerals.map(numeral => (
              <Button
                key={numeral}
                variant={selectedNumeral === numeral ? 'primary' : 'outline-primary'}
                onClick={() => setSelectedNumeral(numeral)}
                size="lg"
              >
                {numeral}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Step 2: Accidental (optional) */}
        {selectedNumeral && (
          <div className="selection-section">
            <h5 className="section-title">2. Accidental (Optional)</h5>
            <ButtonGroup className="w-100">
              {accidentals.map(acc => (
                <Button
                  key={acc.label}
                  variant={selectedAccidental === acc.value ? 'secondary' : 'outline-secondary'}
                  onClick={() => setSelectedAccidental(acc.value)}
                >
                  {acc.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}

        {/* Step 3: Chord Quality (optional) */}
        {selectedNumeral && (
          <div className="selection-section">
            <h5 className="section-title">3. Chord Quality (Optional)</h5>
            <div className="modifier-grid">
              {qualityModifiers.map(mod => (
                <Button
                  key={mod.value}
                  variant={selectedModifiers.includes(mod.value) ? 'info' : 'outline-info'}
                  onClick={() => toggleModifier(mod.value)}
                  className="modifier-btn"
                >
                  <span className="modifier-symbol">{mod.symbol}</span>
                  <small className="modifier-label">{mod.label}</small>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Graphical Modifiers (optional) */}
        {selectedNumeral && (
          <div className="selection-section">
            <h5 className="section-title">4. Graphical Modifiers (Optional)</h5>
            <div className="modifier-grid">
              {graphicalModifiers.map(mod => (
                <Button
                  key={mod.value}
                  variant={selectedModifiers.includes(mod.value) ? 'warning' : 'outline-warning'}
                  onClick={() => toggleModifier(mod.value)}
                  className="modifier-btn"
                >
                  <span className="modifier-symbol large">{mod.symbol}</span>
                  <small className="modifier-label">{mod.label}</small>
                  <small className="modifier-desc">{mod.desc}</small>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Slash Chord (optional) */}
        {selectedNumeral && (
          <div className="selection-section">
            <h5 className="section-title">5. Slash Chord / Bass Note (Optional)</h5>
            <ButtonGroup className="w-100">
              <Button
                variant={bassNote === null ? 'outline-secondary' : 'outline-secondary'}
                onClick={() => setBassNote(null)}
              >
                None
              </Button>
              {numerals.map(numeral => (
                <Button
                  key={numeral}
                  variant={bassNote === numeral ? 'secondary' : 'outline-secondary'}
                  onClick={() => setBassNote(numeral)}
                  size="sm"
                >
                  /{numeral}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}

        {/* Preview */}
        {selectedNumeral && (
          <div className="chord-preview">
            <h5>Preview:</h5>
            <div className="preview-chord">
              {selectedAccidental && <span>{selectedAccidental === 'b' ? '♭' : '♯'}</span>}
              <span className="preview-numeral">{selectedNumeral}</span>
              {selectedModifiers.filter(m => !['diamond', 'push-back', 'push-forward', 'staccato'].includes(m)).map((mod, i) => (
                <span key={i} className="preview-modifier">{qualityModifiers.find(qm => qm.value === mod)?.symbol}</span>
              ))}
              {bassNote && <span className="preview-bass">/{bassNote}</span>}
              {selectedModifiers.includes(ChordModifiers.DIAMOND) && <Badge bg="warning" className="ms-2">◇</Badge>}
              {selectedModifiers.includes(ChordModifiers.PUSH_BACK) && <Badge bg="warning" className="ms-2">&lt;</Badge>}
              {selectedModifiers.includes(ChordModifiers.PUSH_FORWARD) && <Badge bg="warning" className="ms-2">&gt;</Badge>}
              {selectedModifiers.includes(ChordModifiers.STACCATO) && <Badge bg="warning" className="ms-2">^</Badge>}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="primary" onClick={handleAdd} disabled={!selectedNumeral}>
          Add Chord
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

ChordBottomSheet.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onChordSelected: PropTypes.func.isRequired
}

export default ChordBottomSheet
