/**
 * Nashville Number System Chart Data Model
 *
 * This defines the structure for storing and rendering charts.
 */

// ============================================================================
// CHORD STRUCTURE
// ============================================================================

/**
 * Represents a single chord in the Nashville Number System
 */
export const ChordModifiers = {
  DIAMOND: 'diamond',           // Whole note - let ring
  PUSH_BACK: 'push-back',       // Syncopate earlier (<)
  PUSH_FORWARD: 'push-forward', // Syncopate later (>)
  STACCATO: 'staccato',         // Choke/stop (^)
  MINOR: 'minor',               // Minor chord (m)
  SEVENTH: '7',                 // Seventh chord
  MAJOR_SEVENTH: 'maj7',        // Major seventh
  DIMINISHED: 'dim',            // Diminished
  AUGMENTED: 'aug',             // Augmented
  SUSPENDED_4: 'sus4',          // Suspended 4th
  SUSPENDED_2: 'sus2',          // Suspended 2nd
}

/**
 * A single chord within a measure
 */
export class Chord {
  constructor(numeral, modifiers = [], bassNote = null) {
    this.numeral = numeral        // String: 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'
    this.accidental = null        // String: 'b' or '#' (e.g., 'bVII', '#IV')
    this.modifiers = modifiers    // Array of ChordModifiers
    this.bassNote = bassNote      // String: For slash chords (e.g., 'III' in I/III)
    this.beats = null             // Number: For uneven splits (null = even split)
  }

  // Helper methods
  isMinor() {
    return this.modifiers.includes(ChordModifiers.MINOR)
  }

  hasDiamond() {
    return this.modifiers.includes(ChordModifiers.DIAMOND)
  }

  hasPush() {
    return this.modifiers.includes(ChordModifiers.PUSH_BACK) ||
           this.modifiers.includes(ChordModifiers.PUSH_FORWARD)
  }

  // Display format: e.g., "bVII" or "IVmaj7"
  toString() {
    let str = ''
    if (this.accidental) str += this.accidental
    str += this.numeral

    // Add chord quality modifiers
    const qualityMods = this.modifiers.filter(m =>
      m !== ChordModifiers.DIAMOND &&
      m !== ChordModifiers.PUSH_BACK &&
      m !== ChordModifiers.PUSH_FORWARD &&
      m !== ChordModifiers.STACCATO
    )
    str += qualityMods.join('')

    if (this.bassNote) str += `/${this.bassNote}`

    return str
  }
}

// ============================================================================
// MEASURE STRUCTURE
// ============================================================================

/**
 * A single measure containing one or more chords
 */
export class Measure {
  constructor(chords = []) {
    this.chords = chords          // Array of Chord objects
  }

  // Single chord per measure
  static single(chord) {
    return new Measure([chord])
  }

  // Split measure with multiple chords
  static split(chords) {
    return new Measure(chords)
  }

  isSplit() {
    return this.chords.length > 1
  }
}

// ============================================================================
// SECTION STRUCTURE
// ============================================================================

export const SectionTypes = {
  INTRO: 'intro',
  VERSE: 'verse',
  PRE_CHORUS: 'pre-chorus',
  CHORUS: 'chorus',
  BRIDGE: 'bridge',
  SOLO: 'solo',
  INTERLUDE: 'interlude',
  OUTRO: 'outro',
  TURNAROUND: 'turnaround',
  TAG: 'tag',
  CUSTOM: 'custom'
}

/**
 * A section of the song (Verse, Chorus, etc.)
 */
export class Section {
  constructor(type, label, measures = []) {
    this.type = type              // String from SectionTypes
    this.label = label            // String: Display name (e.g., "Verse 1")
    this.measures = measures      // Array of Measure objects
    this.repeat = null            // Number: How many times to repeat (null = once)
    this.notes = null             // String: Optional notes for this section
  }
}

// ============================================================================
// CHART STRUCTURE
// ============================================================================

/**
 * Complete Nashville Number System chart
 */
export class Chart {
  constructor() {
    // Metadata
    this.version = '1.0'          // Schema version
    this.title = ''
    this.artist = ''
    this.key = 'C'                // Default key
    this.timeSignature = '4/4'    // Default time signature
    this.tempo = null             // BPM (optional)
    this.genre = null             // Optional
    this.notes = null             // General notes about the chart

    // Content
    this.sections = []            // Array of Section objects

    // Display settings
    this.measuresPerLine = 4      // Default layout
  }

  // Serialization
  toJSON() {
    return {
      version: this.version,
      metadata: {
        title: this.title,
        artist: this.artist,
        key: this.key,
        timeSignature: this.timeSignature,
        tempo: this.tempo,
        genre: this.genre,
        notes: this.notes
      },
      sections: this.sections.map(section => ({
        type: section.type,
        label: section.label,
        repeat: section.repeat,
        notes: section.notes,
        measures: section.measures.map(measure => ({
          chords: measure.chords.map(chord => ({
            numeral: chord.numeral,
            accidental: chord.accidental,
            modifiers: chord.modifiers,
            bassNote: chord.bassNote,
            beats: chord.beats
          }))
        }))
      })),
      displaySettings: {
        measuresPerLine: this.measuresPerLine
      }
    }
  }

  // Deserialization
  static fromJSON(json) {
    const chart = new Chart()

    chart.version = json.version
    chart.title = json.metadata.title
    chart.artist = json.metadata.artist
    chart.key = json.metadata.key
    chart.timeSignature = json.metadata.timeSignature
    chart.tempo = json.metadata.tempo
    chart.genre = json.metadata.genre
    chart.notes = json.metadata.notes

    chart.sections = json.sections.map(sectionData => {
      const section = new Section(
        sectionData.type,
        sectionData.label,
        sectionData.measures.map(measureData => {
          const chords = measureData.chords.map(chordData => {
            const chord = new Chord(
              chordData.numeral,
              chordData.modifiers,
              chordData.bassNote
            )
            chord.accidental = chordData.accidental
            chord.beats = chordData.beats
            return chord
          })
          return new Measure(chords)
        })
      )
      section.repeat = sectionData.repeat
      section.notes = sectionData.notes
      return section
    })

    if (json.displaySettings) {
      chart.measuresPerLine = json.displaySettings.measuresPerLine
    }

    return chart
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a simple chord from a string notation
 * Examples: 'I', 'IVm', 'bVII', 'Vmaj7', 'I/III'
 */
export function parseChord(notation) {
  // This is a simplified parser - can be expanded
  let accidental = null
  let numeral = ''
  let modifiers = []
  let bassNote = null

  let i = 0

  // Check for accidental
  if (notation[i] === 'b' || notation[i] === '#') {
    accidental = notation[i]
    i++
  }

  // Get numeral (I, II, III, IV, V, VI, VII)
  while (i < notation.length && /[IVX]/.test(notation[i])) {
    numeral += notation[i]
    i++
  }

  // Check for slash chord
  if (notation.includes('/')) {
    const parts = notation.split('/')
    bassNote = parts[1]
    notation = parts[0] // Continue parsing the main chord
  }

  // Parse modifiers
  const remaining = notation.substring(i)
  if (remaining.includes('m') && !remaining.includes('maj')) {
    modifiers.push(ChordModifiers.MINOR)
  }
  if (remaining.includes('maj7')) {
    modifiers.push(ChordModifiers.MAJOR_SEVENTH)
  } else if (remaining.includes('7')) {
    modifiers.push(ChordModifiers.SEVENTH)
  }
  if (remaining.includes('dim')) {
    modifiers.push(ChordModifiers.DIMINISHED)
  }
  if (remaining.includes('aug')) {
    modifiers.push(ChordModifiers.AUGMENTED)
  }
  if (remaining.includes('sus4')) {
    modifiers.push(ChordModifiers.SUSPENDED_4)
  } else if (remaining.includes('sus2')) {
    modifiers.push(ChordModifiers.SUSPENDED_2)
  }

  const chord = new Chord(numeral, modifiers, bassNote)
  chord.accidental = accidental
  return chord
}

/**
 * Create an example chart for testing
 */
export function createExampleChart() {
  const chart = new Chart()
  chart.title = "Amazing Grace"
  chart.artist = "Traditional"
  chart.key = "G"
  chart.timeSignature = "4/4"
  chart.tempo = 80

  // Intro
  const intro = new Section(SectionTypes.INTRO, "Intro")
  const introChord1 = new Chord('I', [ChordModifiers.DIAMOND])
  const introChord2 = new Chord('IV', [ChordModifiers.DIAMOND])
  intro.measures = [
    Measure.single(introChord1),
    Measure.single(introChord2)
  ]

  // Verse
  const verse = new Section(SectionTypes.VERSE, "Verse")
  verse.measures = [
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I'))
  ]
  verse.repeat = 2

  chart.sections = [intro, verse]

  return chart
}

export default Chart
