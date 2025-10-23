import React from 'react'
import PropTypes from 'prop-types'
import ChordDisplay from './ChordDisplay'
import './MeasureDisplay.css'

/**
 * Displays a single measure with one or more chords
 */
function MeasureDisplay({ measure, chartKey = null }) {
  const isSplit = measure.chords.length > 1

  return (
    <div className={`measure-display ${isSplit ? 'split' : ''}`}>
      {measure.chords.map((chord, index) => (
        <ChordDisplay
          key={index}
          chord={chord}
          isSplit={isSplit}
          chartKey={chartKey}
        />
      ))}
    </div>
  )
}

MeasureDisplay.propTypes = {
  measure: PropTypes.object.isRequired,
  chartKey: PropTypes.string
}

export default MeasureDisplay
