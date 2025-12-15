import React from 'react'
import PropTypes from 'prop-types'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import SectionDisplay from './SectionDisplay'
import { getChartStats } from '../../utils/chartUtils'
import './ChartRenderer.css'

/**
 * Main chart renderer component
 * Displays a complete Nashville Number System chart
 */
function ChartRenderer({ chart, showMetadata = true }) {
  const stats = getChartStats(chart)

  const keyTooltip = (
    <Tooltip>The musical key of the song - all numerals are relative to this key</Tooltip>
  )

  const timeSignatureTooltip = (
    <Tooltip>Time signature - number of beats per measure / which note gets the beat</Tooltip>
  )

  const tempoTooltip = (
    <Tooltip>Tempo in beats per minute (BPM) - how fast the song is played</Tooltip>
  )

  return (
    <div className="chart-renderer">
      {/* Chart Header */}
      {showMetadata && (
        <div className="chart-header">
          <h1 className="chart-title">{chart.title}</h1>
          {chart.artist && (
            <h2 className="chart-artist">{chart.artist}</h2>
          )}

          <div className="chart-metadata">
            <OverlayTrigger placement="top" overlay={keyTooltip}>
              <span className="metadata-item">
                <strong>Key:</strong> {chart.key}
              </span>
            </OverlayTrigger>
            <OverlayTrigger placement="top" overlay={timeSignatureTooltip}>
              <span className="metadata-item">
                <strong>Time:</strong> {chart.timeSignature}
              </span>
            </OverlayTrigger>
            {chart.tempo && (
              <OverlayTrigger placement="top" overlay={tempoTooltip}>
                <span className="metadata-item">
                  <strong>Tempo:</strong> {chart.tempo} BPM
                </span>
              </OverlayTrigger>
            )}
            {stats.durationFormatted && (
              <span className="metadata-item">
                <strong>Duration:</strong> ~{stats.durationFormatted}
              </span>
            )}
          </div>

          {chart.notes && (
            <div className="chart-notes">
              {chart.notes}
            </div>
          )}
        </div>
      )}

      {/* Chart Sections */}
      <div className="chart-sections">
        {chart.sections.map((section, index) => (
          <SectionDisplay
            key={index}
            section={section}
            measuresPerLine={chart.measuresPerLine}
            chartKey={chart.key}
            numeralFormat={chart.numeralFormat || 'roman'}
          />
        ))}
      </div>

      {/* Chart Footer with Stats */}
      {showMetadata && (
        <div className="chart-footer">
          <small className="text-muted">
            {stats.sections} sections • {stats.measures} measures • {stats.chords} chords
          </small>
        </div>
      )}
    </div>
  )
}

ChartRenderer.propTypes = {
  chart: PropTypes.object.isRequired,
  showMetadata: PropTypes.bool
}

export default ChartRenderer
