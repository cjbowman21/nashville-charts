import React from 'react'
import PropTypes from 'prop-types'
import { formatChordDisplay, getGraphicalModifiers } from '../../utils/chartUtils'
import './ChordDisplay.css'

/**
 * Displays a single chord with proper Nashville Number notation
 */
function ChordDisplay({ chord, isSplit = false }) {
  const display = formatChordDisplay(chord)
  const graphicalMods = getGraphicalModifiers(chord)

  // Determine which graphical modifiers to show
  const hasDiamond = graphicalMods.includes('diamond')
  const hasPushBack = graphicalMods.includes('push-back')
  const hasPushForward = graphicalMods.includes('push-forward')
  const hasStaccato = graphicalMods.includes('staccato')

  return (
    <div className={`chord-display ${isSplit ? 'split' : ''}`}>
      {/* Push symbol (before) */}
      {hasPushBack && <span className="modifier-symbol push-back">&lt;</span>}

      {/* Diamond wrapper */}
      {hasDiamond ? (
        <span className="diamond-wrapper">
          <span className="diamond-symbol">◇</span>
          <span className="chord-text">{display}</span>
        </span>
      ) : (
        <span className="chord-text">{display}</span>
      )}

      {/* Staccato symbol (above) */}
      {hasStaccato && <span className="modifier-symbol staccato">^</span>}

      {/* Push symbol (after) */}
      {hasPushForward && <span className="modifier-symbol push-forward">&gt;</span>}
    </div>
  )
}

ChordDisplay.propTypes = {
  chord: PropTypes.object.isRequired,
  isSplit: PropTypes.bool
}

export default ChordDisplay
