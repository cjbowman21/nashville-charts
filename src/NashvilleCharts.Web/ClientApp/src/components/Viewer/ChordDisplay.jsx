import React from 'react'
import PropTypes from 'prop-types'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { formatChordDisplay, getGraphicalModifiers } from '../../utils/chartUtils'
import { getFullChordDescription, getModifierDescription } from '../../utils/tooltipUtils'
import './ChordDisplay.css'

/**
 * Displays a single chord with proper Nashville Number notation
 */
function ChordDisplay({ chord, isSplit = false, chartKey = null, numeralFormat = 'roman' }) {
  const display = formatChordDisplay(chord, numeralFormat)
  const graphicalMods = getGraphicalModifiers(chord)

  // Determine which graphical modifiers to show
  const hasDiamond = graphicalMods.includes('diamond')
  const hasPushBack = graphicalMods.includes('push-back')
  const hasPushForward = graphicalMods.includes('push-forward')
  const hasStaccato = graphicalMods.includes('staccato')

  // Tooltip for the main chord
  const chordTooltip = (
    <Tooltip>
      {getFullChordDescription(chord, chartKey)}
    </Tooltip>
  )

  // Tooltip for diamond
  const diamondTooltip = (
    <Tooltip>{getModifierDescription('diamond')}</Tooltip>
  )

  // Tooltip for push back
  const pushBackTooltip = (
    <Tooltip>{getModifierDescription('push-back')}</Tooltip>
  )

  // Tooltip for push forward
  const pushForwardTooltip = (
    <Tooltip>{getModifierDescription('push-forward')}</Tooltip>
  )

  // Tooltip for staccato
  const staccatoTooltip = (
    <Tooltip>{getModifierDescription('staccato')}</Tooltip>
  )

  // Tooltip for split measure
  const splitTooltip = (
    <Tooltip>Split measure - Multiple chords share this measure evenly</Tooltip>
  )

  const content = (
    <div className={`chord-display ${isSplit ? 'split' : ''}`}>
      {/* Push symbol (before) */}
      {hasPushBack && (
        <OverlayTrigger placement="top" overlay={pushBackTooltip}>
          <span className="modifier-symbol push-back">&lt;</span>
        </OverlayTrigger>
      )}

      {/* Diamond wrapper */}
      {hasDiamond ? (
        <span className="diamond-wrapper">
          <OverlayTrigger placement="top" overlay={diamondTooltip}>
            <span className="diamond-symbol">◇</span>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={chordTooltip}>
            <span className="chord-text">{display}</span>
          </OverlayTrigger>
        </span>
      ) : (
        <OverlayTrigger placement="top" overlay={chordTooltip}>
          <span className="chord-text">{display}</span>
        </OverlayTrigger>
      )}

      {/* Staccato symbol (above) */}
      {hasStaccato && (
        <OverlayTrigger placement="top" overlay={staccatoTooltip}>
          <span className="modifier-symbol staccato">^</span>
        </OverlayTrigger>
      )}

      {/* Push symbol (after) */}
      {hasPushForward && (
        <OverlayTrigger placement="top" overlay={pushForwardTooltip}>
          <span className="modifier-symbol push-forward">&gt;</span>
        </OverlayTrigger>
      )}
    </div>
  )

  // If it's a split measure, wrap the whole thing with a tooltip
  if (isSplit) {
    return (
      <OverlayTrigger placement="top" overlay={splitTooltip}>
        {content}
      </OverlayTrigger>
    )
  }

  return content
}

ChordDisplay.propTypes = {
  chord: PropTypes.object.isRequired,
  isSplit: PropTypes.bool,
  chartKey: PropTypes.string,
  numeralFormat: PropTypes.string
}

export default ChordDisplay
