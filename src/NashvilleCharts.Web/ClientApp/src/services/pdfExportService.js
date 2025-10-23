import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * PDF Export Service
 * Provides functionality to export Nashville Number System charts to PDF
 */

/**
 * Export a chart element to PDF
 * @param {HTMLElement} element - The DOM element containing the chart to export
 * @param {string} filename - The filename for the PDF (without .pdf extension)
 * @param {Object} options - Additional options for PDF generation
 * @returns {Promise<void>}
 */
export async function exportChartToPDF(element, filename = 'chart', options = {}) {
  try {
    // Default options
    const {
      format = 'letter',
      orientation = 'portrait',
      quality = 2,
      backgroundColor = '#ffffff'
    } = options

    // Convert the HTML element to canvas
    const canvas = await html2canvas(element, {
      scale: quality,
      backgroundColor: backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true
    })

    // Get canvas dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Create PDF with appropriate orientation
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: format,
      compress: true
    })

    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate scaling to fit the page while maintaining aspect ratio
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Center the content on the page
    const x = (pdfWidth - scaledWidth) / 2
    const y = (pdfHeight - scaledHeight) / 2

    // Add the image to PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)

    // Save the PDF
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

/**
 * Export a chart to PDF by creating a temporary render
 * @param {Object} chart - The chart object to export
 * @param {React.Component} ChartRenderer - The ChartRenderer component
 * @param {string} filename - The filename for the PDF
 * @returns {Promise<void>}
 */
export async function exportChartObjectToPDF(chart, ChartRenderer, filename) {
  // This function would require ReactDOM.render which is deprecated
  // Instead, we'll rely on exporting the already-rendered element
  // from the component itself
  throw new Error('Use exportChartToPDF with a rendered element instead')
}

/**
 * Generate a safe filename from chart metadata
 * @param {Object} chart - The chart object
 * @returns {string} - Safe filename for PDF
 */
export function generatePDFFilename(chart) {
  const title = chart.title || 'Untitled Chart'
  const artist = chart.artist || ''

  // Create filename from title and artist
  let filename = title
  if (artist) {
    filename += ` - ${artist}`
  }

  // Sanitize filename (remove invalid characters)
  filename = filename
    .replace(/[^a-z0-9\s\-_]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()

  return filename || 'chart'
}

export default {
  exportChartToPDF,
  generatePDFFilename
}
