/**
 * Example Nashville Number System charts for testing and demonstration
 */

import { Chart, Section, Measure, Chord, SectionTypes, ChordModifiers } from './Chart'

// ============================================================================
// EXAMPLE 1: Simple I-IV-V Song
// ============================================================================

export function createSimpleChart() {
  const chart = new Chart()
  chart.title = "Simple Country Song"
  chart.artist = "Example Band"
  chart.key = "G"
  chart.timeSignature = "4/4"
  chart.tempo = 120

  // Intro
  const intro = new Section(SectionTypes.INTRO, "Intro")
  intro.measures = [
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('V'))
  ]

  // Verse
  const verse = new Section(SectionTypes.VERSE, "Verse")
  verse.measures = [
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('V'))
  ]

  // Chorus
  const chorus = new Section(SectionTypes.CHORUS, "Chorus")
  chorus.measures = [
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('V'))
  ]

  chart.sections = [intro, verse, chorus]
  return chart
}

// ============================================================================
// EXAMPLE 2: Pop Progression with Split Measures
// ============================================================================

export function createPopChart() {
  const chart = new Chart()
  chart.title = "Pop Song"
  chart.artist = "Modern Artist"
  chart.key = "C"
  chart.timeSignature = "4/4"
  chart.tempo = 128

  // Intro
  const intro = new Section(SectionTypes.INTRO, "Intro")
  const diamondVI = new Chord('VI', [ChordModifiers.MINOR, ChordModifiers.DIAMOND])
  const diamondIV = new Chord('IV', [ChordModifiers.DIAMOND])
  intro.measures = [
    Measure.single(diamondVI),
    Measure.single(diamondIV)
  ]

  // Verse with some split measures
  const verse = new Section(SectionTypes.VERSE, "Verse")
  verse.measures = [
    Measure.single(new Chord('VI', [ChordModifiers.MINOR])),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('VI', [ChordModifiers.MINOR])),
    Measure.split([
      new Chord('IV'),
      new Chord('I')
    ]),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('V'))
  ]

  // Chorus with push
  const chorus = new Section(SectionTypes.CHORUS, "Chorus")
  const pushI = new Chord('I', [ChordModifiers.PUSH_BACK])
  chorus.measures = [
    Measure.single(new Chord('VI', [ChordModifiers.MINOR])),
    Measure.single(new Chord('IV')),
    Measure.single(pushI),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('VI', [ChordModifiers.MINOR])),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('V'))
  ]

  chart.sections = [intro, verse, chorus]
  return chart
}

// ============================================================================
// EXAMPLE 3: Jazz-Influenced with Complex Chords
// ============================================================================

export function createJazzChart() {
  const chart = new Chart()
  chart.title = "Jazzy Country Tune"
  chart.artist = "Jazz Band"
  chart.key = "F"
  chart.timeSignature = "4/4"
  chart.tempo = 110

  // Verse with 7th chords
  const verse = new Section(SectionTypes.VERSE, "Verse")
  verse.measures = [
    Measure.single(new Chord('I', [ChordModifiers.MAJOR_SEVENTH])),
    Measure.single(new Chord('IV', [ChordModifiers.MAJOR_SEVENTH])),
    Measure.single(new Chord('I', [ChordModifiers.MAJOR_SEVENTH])),
    Measure.single(new Chord('IV', [ChordModifiers.MAJOR_SEVENTH])),
    Measure.single(new Chord('VI', [ChordModifiers.MINOR, ChordModifiers.SEVENTH])),
    Measure.single(new Chord('II', [ChordModifiers.MINOR, ChordModifiers.SEVENTH])),
    Measure.single(new Chord('V', [ChordModifiers.SEVENTH])),
    Measure.single(new Chord('V', [ChordModifiers.SEVENTH]))
  ]

  // Chorus with slash chords
  const chorus = new Section(SectionTypes.CHORUS, "Chorus")
  const I_III = new Chord('I', [], 'III')  // I with III in bass
  const IV_I = new Chord('IV', [], 'I')    // IV with I in bass
  chorus.measures = [
    Measure.single(I_III),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('V')),
    Measure.single(I_III),
    Measure.single(IV_I),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I'))
  ]

  chart.sections = [verse, chorus]
  return chart
}

// ============================================================================
// EXAMPLE 4: Chart with All Features
// ============================================================================

export function createComplexChart() {
  const chart = new Chart()
  chart.title = "Complex Nashville Chart"
  chart.artist = "Demo Artist"
  chart.key = "D"
  chart.timeSignature = "4/4"
  chart.tempo = 96
  chart.notes = "This chart demonstrates all Nashville Number System features"

  // Intro with diamond chords
  const intro = new Section(SectionTypes.INTRO, "Intro")
  intro.measures = [
    Measure.single(new Chord('I', [ChordModifiers.DIAMOND])),
    Measure.single(new Chord('IV', [ChordModifiers.DIAMOND]))
  ]
  intro.notes = "Let chords ring"

  // Verse with various modifiers
  const verse = new Section(SectionTypes.VERSE, "Verse 1")
  const bVII = new Chord('VII', [])
  bVII.accidental = 'b'
  verse.measures = [
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('I')),
    Measure.single(bVII),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('V'))
  ]

  // Pre-Chorus with split measure
  const preChorus = new Section(SectionTypes.PRE_CHORUS, "Pre-Chorus")
  preChorus.measures = [
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('V')),
    Measure.split([
      new Chord('VI', [ChordModifiers.MINOR]),
      new Chord('V')
    ]),
    Measure.single(new Chord('IV'))
  ]

  // Chorus with push and staccato
  const chorus = new Section(SectionTypes.CHORUS, "Chorus")
  const pushI = new Chord('I', [ChordModifiers.PUSH_BACK])
  const staccatoV = new Chord('V', [ChordModifiers.STACCATO])
  chorus.measures = [
    Measure.single(new Chord('VI', [ChordModifiers.MINOR])),
    Measure.single(new Chord('IV')),
    Measure.single(pushI),
    Measure.single(new Chord('V')),
    Measure.single(new Chord('VI', [ChordModifiers.MINOR])),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(staccatoV)
  ]
  chorus.repeat = 2

  // Bridge with slash chords
  const bridge = new Section(SectionTypes.BRIDGE, "Bridge")
  bridge.measures = [
    Measure.single(new Chord('I', [], 'VII')),  // I/VII
    Measure.single(new Chord('I', [], 'VI')),   // I/VI
    Measure.single(new Chord('I', [], 'V')),    // I/V
    Measure.single(new Chord('IV'))
  ]

  // Outro
  const outro = new Section(SectionTypes.OUTRO, "Outro")
  outro.measures = [
    Measure.single(new Chord('I')),
    Measure.single(new Chord('IV')),
    Measure.single(new Chord('I')),
    Measure.single(new Chord('I', [ChordModifiers.DIAMOND]))
  ]

  chart.sections = [intro, verse, preChorus, chorus, bridge, outro]
  return chart
}

// ============================================================================
// Export all examples
// ============================================================================

export const exampleCharts = {
  simple: createSimpleChart(),
  pop: createPopChart(),
  jazz: createJazzChart(),
  complex: createComplexChart()
}

export default exampleCharts
