/**
 * Utility functions for working with Nashville Number System charts
 */

// ============================================================================
// KEY AND TRANSPOSITION UTILITIES
// ============================================================================

// All musical keys in order
export const KEYS = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
]

// Alternative names for keys (enharmonic equivalents)
export const KEY_ALIASES = {
  'C#': 'Db',
  'D#': 'Eb',
  'Gb': 'F#',
  'G#': 'Ab',
  'A#': 'Bb'
}

// Normalize key name
export function normalizeKey(key) {
  return KEY_ALIASES[key] || key
}

// Get the note name for a numeral in a given key
export function getNoteForNumeral(numeral, key, accidental = null) {
  const normalizedKey = normalizeKey(key)
  const keyIndex = KEYS.indexOf(normalizedKey)

  if (keyIndex === -1) {
    throw new Error(`Invalid key: ${key}`)
  }

  // Convert numeral (Roman or Arabic) to scale degree (0-6)
  // First normalize to Roman if it's Arabic
  let romanNumeral = numeral.toUpperCase()
  const arabicNum = parseInt(numeral)
  if (!isNaN(arabicNum)) {
    // It's an Arabic number, convert to Roman
    romanNumeral = arabicToRoman(arabicNum)
    if (!romanNumeral) {
      throw new Error(`Invalid numeral: ${numeral}`)
    }
  }

  const numeralMap = {
    'I': 0,
    'II': 2,
    'III': 4,
    'IV': 5,
    'V': 7,
    'VI': 9,
    'VII': 11
  }

  let semitones = numeralMap[romanNumeral]
  if (semitones === undefined) {
    throw new Error(`Invalid numeral: ${numeral}`)
  }

  // Apply accidental
  if (accidental === 'b') {
    semitones -= 1
  } else if (accidental === '#') {
    semitones += 1
  }

  // Calculate the note
  const noteIndex = (keyIndex + semitones) % 12
  return KEYS[noteIndex]
}

// ============================================================================
// NUMERAL CONVERSION (Roman ↔ Arabic)
// ============================================================================

// Map of Roman numerals to Arabic numbers
const ROMAN_TO_ARABIC = {
  'I': 1,
  'II': 2,
  'III': 3,
  'IV': 4,
  'V': 5,
  'VI': 6,
  'VII': 7
}

// Map of Arabic numbers to Roman numerals
const ARABIC_TO_ROMAN = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII'
}

/**
 * Convert Roman numeral to Arabic number
 * @param {string} roman - Roman numeral (I, II, III, IV, V, VI, VII)
 * @returns {number} Arabic number (1-7)
 */
export function romanToArabic(roman) {
  return ROMAN_TO_ARABIC[roman.toUpperCase()] || null
}

/**
 * Convert Arabic number to Roman numeral
 * @param {number} arabic - Arabic number (1-7)
 * @returns {string} Roman numeral (I, II, III, IV, V, VI, VII)
 */
export function arabicToRoman(arabic) {
  return ARABIC_TO_ROMAN[arabic] || null
}

/**
 * Convert a numeral from one format to another
 * @param {string} numeral - Current numeral (Roman or Arabic string)
 * @param {string} targetFormat - 'roman' or 'arabic'
 * @returns {string} Converted numeral
 */
export function convertNumeral(numeral, targetFormat) {
  if (targetFormat === 'arabic') {
    // Convert Roman to Arabic
    const arabic = romanToArabic(numeral)
    return arabic ? arabic.toString() : numeral
  } else {
    // Convert Arabic to Roman (default: roman)
    const arabic = parseInt(numeral)
    if (!isNaN(arabic)) {
      const roman = arabicToRoman(arabic)
      return roman || numeral
    }
    // If it's already Roman, return as-is
    return numeral
  }
}

// ============================================================================
// CHORD FORMATTING
// ============================================================================

// Get display symbol for modifier
export function getModifierSymbol(modifier) {
  const symbols = {
    'diamond': '◇',
    'push-back': '<',
    'push-forward': '>',
    'staccato': '^',
    'minor': 'm',
    '7': '⁷',
    'maj7': 'Δ⁷',
    'dim': '°',
    'aug': '+',
    'sus4': 'sus⁴',
    'sus2': 'sus²'
  }
  return symbols[modifier] || modifier
}

// Format chord for display with symbols
export function formatChordDisplay(chord, numeralFormat = 'roman') {
  let display = ''

  // Accidental
  if (chord.accidental) {
    display += chord.accidental === 'b' ? '♭' : '♯'
  }

  // Numeral - convert to requested format
  const displayNumeral = convertNumeral(chord.numeral, numeralFormat)
  display += displayNumeral

  // Quality modifiers (not graphical modifiers)
  const qualityMods = chord.modifiers.filter(m =>
    !['diamond', 'push-back', 'push-forward', 'staccato'].includes(m)
  )
  qualityMods.forEach(mod => {
    display += getModifierSymbol(mod)
  })

  // Slash chord - convert bass note too
  if (chord.bassNote) {
    const displayBassNote = convertNumeral(chord.bassNote, numeralFormat)
    display += '/' + displayBassNote
  }

  return display
}

// Get graphical modifiers for rendering
export function getGraphicalModifiers(chord) {
  return chord.modifiers.filter(m =>
    ['diamond', 'push-back', 'push-forward', 'staccato'].includes(m)
  )
}

// ============================================================================
// CHART VALIDATION
// ============================================================================

export function validateChart(chart) {
  const errors = []

  if (!chart.title || chart.title.trim() === '') {
    errors.push('Chart must have a title')
  }

  if (!chart.key || !KEYS.includes(normalizeKey(chart.key))) {
    errors.push('Chart must have a valid key')
  }

  if (!chart.sections || chart.sections.length === 0) {
    errors.push('Chart must have at least one section')
  }

  chart.sections.forEach((section, sIdx) => {
    if (!section.label || section.label.trim() === '') {
      errors.push(`Section ${sIdx + 1} must have a label`)
    }

    if (!section.measures || section.measures.length === 0) {
      errors.push(`Section "${section.label}" must have at least one measure`)
    }

    section.measures.forEach((measure, mIdx) => {
      if (!measure.chords || measure.chords.length === 0) {
        errors.push(`Measure ${mIdx + 1} in "${section.label}" must have at least one chord`)
      }
    })
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================================================
// CHART STATISTICS
// ============================================================================

export function getChartStats(chart) {
  let totalMeasures = 0
  let totalChords = 0
  const sectionCount = chart.sections.length

  chart.sections.forEach(section => {
    totalMeasures += section.measures.length
    section.measures.forEach(measure => {
      totalChords += measure.chords.length
    })
  })

  // Calculate approximate duration
  let durationSeconds = null
  if (chart.tempo && chart.timeSignature) {
    const beatsPerMeasure = parseInt(chart.timeSignature.split('/')[0])
    const beatsPerMinute = chart.tempo
    const totalBeats = totalMeasures * beatsPerMeasure
    durationSeconds = Math.round((totalBeats / beatsPerMinute) * 60)
  }

  return {
    sections: sectionCount,
    measures: totalMeasures,
    chords: totalChords,
    durationSeconds,
    durationFormatted: durationSeconds ? formatDuration(durationSeconds) : null
  }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

// Group measures into lines based on measuresPerLine setting
export function layoutMeasures(measures, measuresPerLine) {
  const lines = []
  for (let i = 0; i < measures.length; i += measuresPerLine) {
    lines.push(measures.slice(i, i + measuresPerLine))
  }
  return lines
}

// ============================================================================
// SEARCH AND FILTER
// ============================================================================

export function searchChords(chart, query) {
  const results = []
  const lowerQuery = query.toLowerCase()

  chart.sections.forEach((section, sIdx) => {
    section.measures.forEach((measure, mIdx) => {
      measure.chords.forEach((chord, cIdx) => {
        const chordStr = chord.toString().toLowerCase()
        if (chordStr.includes(lowerQuery)) {
          results.push({
            section: section.label,
            sectionIndex: sIdx,
            measureIndex: mIdx,
            chordIndex: cIdx,
            chord: chord
          })
        }
      })
    })
  })

  return results
}

// Get all unique chords used in a chart
export function getUniqueChords(chart) {
  const chordsSet = new Set()

  chart.sections.forEach(section => {
    section.measures.forEach(measure => {
      measure.chords.forEach(chord => {
        chordsSet.add(chord.toString())
      })
    })
  })

  return Array.from(chordsSet).sort()
}

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

// Convert chart to storage format (JSON string)
export function serializeChart(chart) {
  return JSON.stringify(chart.toJSON(), null, 2)
}

// Parse chart from storage format
export function deserializeChart(jsonString) {
  try {
    const json = JSON.parse(jsonString)
    return Chart.fromJSON(json)
  } catch (error) {
    throw new Error('Invalid chart data: ' + error.message)
  }
}

export default {
  KEYS,
  normalizeKey,
  getNoteForNumeral,
  romanToArabic,
  arabicToRoman,
  convertNumeral,
  formatChordDisplay,
  getGraphicalModifiers,
  validateChart,
  getChartStats,
  layoutMeasures,
  searchChords,
  getUniqueChords,
  serializeChart,
  deserializeChart
}
