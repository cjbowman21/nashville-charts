import React from 'react'
import PropTypes from 'prop-types'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import MeasureDisplay from './MeasureDisplay'
import { layoutMeasures } from '../../utils/chartUtils'
import './SectionDisplay.css'

/**
 * Displays a section of the chart (Verse, Chorus, etc.)
 */
function SectionDisplay({ section, measuresPerLine = 4, chartKey = null }) {
  const lines = layoutMeasures(section.measures, measuresPerLine)

  // Tooltip for section type
  const sectionTypeTooltips = {
    'intro': 'Introduction - Opening section of the song',
    'verse': 'Verse - Main storytelling section',
    'pre-chorus': 'Pre-Chorus - Builds anticipation before the chorus',
    'chorus': 'Chorus - Main repeated section with the hook',
    'bridge': 'Bridge - Contrasting section, usually appears once',
    'solo': 'Solo - Instrumental section',
    'interlude': 'Interlude - Musical break between sections',
    'outro': 'Outro - Ending section',
    'turnaround': 'Turnaround - Short progression leading back to another section',
    'tag': 'Tag - Repeated ending phrase',
    'custom': 'Custom section'
  }

  const sectionTooltip = (
    <Tooltip>{sectionTypeTooltips[section.type] || section.type}</Tooltip>
  )

  const repeatTooltip = (
    <Tooltip>Play this section {section.repeat} times</Tooltip>
  )

  return (
    <div className="section-display">
      {/* Section header */}
      <div className="section-header">
        <OverlayTrigger placement="top" overlay={sectionTooltip}>
          <span className="section-label">{section.label}</span>
        </OverlayTrigger>
        {section.repeat && section.repeat > 1 && (
          <OverlayTrigger placement="top" overlay={repeatTooltip}>
            <span className="section-repeat">(x{section.repeat})</span>
          </OverlayTrigger>
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
                chartKey={chartKey}
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
  measuresPerLine: PropTypes.number,
  chartKey: PropTypes.string
}

export default SectionDisplay
