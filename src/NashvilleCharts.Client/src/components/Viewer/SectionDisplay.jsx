import React from 'react'
import PropTypes from 'prop-types'
import MeasureDisplay from './MeasureDisplay'
import { layoutMeasures } from '../../utils/chartUtils'
import './SectionDisplay.css'

/**
 * Displays a section of the chart (Verse, Chorus, etc.)
 */
function SectionDisplay({ section, measuresPerLine = 4 }) {
  const lines = layoutMeasures(section.measures, measuresPerLine)

  return (
    <div className="section-display">
      {/* Section header */}
      <div className="section-header">
        <span className="section-label">{section.label}</span>
        {section.repeat && section.repeat > 1 && (
          <span className="section-repeat">(x{section.repeat})</span>
        )}
        {section.notes && (
          <span className="section-notes">{section.notes}</span>
        )}
      </div>

      {/* Measures organized in lines */}
      <div className="section-measures">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="measure-line">
            {line.map((measure, measureIndex) => (
              <MeasureDisplay
                key={`${lineIndex}-${measureIndex}`}
                measure={measure}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

SectionDisplay.propTypes = {
  section: PropTypes.object.isRequired,
  measuresPerLine: PropTypes.number
}

export default SectionDisplay
