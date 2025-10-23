import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Spinner } from 'react-bootstrap'
import { exportChartToPDF, generatePDFFilename } from '../../services/pdfExportService'

/**
 * ExportButton Component
 * A reusable button component for exporting charts to PDF
 */
function ExportButton({
  chart,
  elementRef,
  variant = 'outline-primary',
  size = 'md',
  className = '',
  children = 'Export to PDF'
}) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!elementRef || !elementRef.current) {
      console.error('No chart element reference provided')
      return
    }

    try {
      setIsExporting(true)

      // Generate filename from chart metadata
      const filename = generatePDFFilename(chart)

      // Export to PDF
      await exportChartToPDF(elementRef.current, filename, {
        format: 'letter',
        orientation: 'portrait',
        quality: 2
      })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Generating PDF...
        </>
      ) : (
        <>
          {children}
        </>
      )}
    </Button>
  )
}

ExportButton.propTypes = {
  chart: PropTypes.object.isRequired,
  elementRef: PropTypes.object.isRequired,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
}

export default ExportButton
