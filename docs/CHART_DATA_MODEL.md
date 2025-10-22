# Nashville Charts - Data Model Documentation

This document describes the JSON data model used to store and render Nashville Number System charts.

## Overview

Charts are stored as JSON with the following structure:

```javascript
{
  version: "1.0",
  metadata: { ... },
  sections: [ ... ],
  displaySettings: { ... }
}
```

## Structure

### Chart (Root)

```javascript
{
  "version": "1.0",
  "metadata": {
    "title": "Song Title",
    "artist": "Artist Name",
    "key": "C",
    "timeSignature": "4/4",
    "tempo": 120,
    "genre": "Country",
    "notes": "Optional notes about the chart"
  },
  "sections": [...],
  "displaySettings": {
    "measuresPerLine": 4
  }
}
```

### Section

Each section represents a part of the song (Verse, Chorus, etc.):

```javascript
{
  "type": "verse",           // One of: intro, verse, pre-chorus, chorus, bridge, solo, etc.
  "label": "Verse 1",        // Display name
  "repeat": 2,               // Number of times to repeat (null = once)
  "notes": "Optional notes", // Section-specific notes
  "measures": [...]          // Array of measures
}
```

**Section Types:**
- `intro`
- `verse`
- `pre-chorus`
- `chorus`
- `bridge`
- `solo`
- `interlude`
- `outro`
- `turnaround`
- `tag`
- `custom`

### Measure

Each measure contains one or more chords:

```javascript
{
  "chords": [...]  // Array of 1+ chord objects
}
```

- **Single chord per measure**: `{ chords: [chord1] }`
- **Split measure**: `{ chords: [chord1, chord2] }`  (underlined chords)

### Chord

The core building block:

```javascript
{
  "numeral": "I",              // I, II, III, IV, V, VI, VII
  "accidental": "b",           // 'b' or '#' (null if none)
  "modifiers": [...],          // Array of modifier strings
  "bassNote": "III",           // For slash chords (null if none)
  "beats": 2                   // For uneven splits (null = even)
}
```

**Numerals:** `I`, `II`, `III`, `IV`, `V`, `VI`, `VII`

**Accidentals:** `b` (flat) or `#` (sharp)
- Example: `bVII` = { numeral: "VII", accidental: "b" }

**Modifiers:**
- **Quality modifiers:**
  - `minor` or `m` - Minor chord
  - `7` - Seventh chord
  - `maj7` - Major seventh
  - `dim` - Diminished
  - `aug` - Augmented
  - `sus4` - Suspended 4th
  - `sus2` - Suspended 2nd

- **Graphical modifiers:**
  - `diamond` - Whole note / let ring (◇)
  - `push-back` - Syncopate earlier (<)
  - `push-forward` - Syncopate later (>)
  - `staccato` - Choke/stop (^)

**Slash Chords:**
- `bassNote` specifies the bass note
- Example: I/III = { numeral: "I", bassNote: "III" }

## Examples

### Example 1: Simple Verse

```json
{
  "type": "verse",
  "label": "Verse 1",
  "measures": [
    { "chords": [{ "numeral": "I", "modifiers": [] }] },
    { "chords": [{ "numeral": "IV", "modifiers": [] }] },
    { "chords": [{ "numeral": "I", "modifiers": [] }] },
    { "chords": [{ "numeral": "V", "modifiers": [] }] }
  ]
}
```

### Example 2: Split Measure

```json
{
  "chords": [
    { "numeral": "I", "modifiers": [] },
    { "numeral": "IV", "modifiers": [] }
  ]
}
```
This creates an underlined split measure: `I  IV`

### Example 3: Minor Chord with Diamond

```json
{
  "numeral": "VI",
  "modifiers": ["minor", "diamond"]
}
```
Renders as: ◇VIm

### Example 4: Flat VII

```json
{
  "numeral": "VII",
  "accidental": "b",
  "modifiers": []
}
```
Renders as: ♭VII

### Example 5: Slash Chord

```json
{
  "numeral": "I",
  "bassNote": "III",
  "modifiers": []
}
```
Renders as: I/III

### Example 6: Major 7th with Push

```json
{
  "numeral": "I",
  "modifiers": ["maj7", "push-back"]
}
```
Renders as: <IΔ⁷

## Complete Example Chart

```json
{
  "version": "1.0",
  "metadata": {
    "title": "Amazing Grace",
    "artist": "Traditional",
    "key": "G",
    "timeSignature": "4/4",
    "tempo": 80
  },
  "sections": [
    {
      "type": "intro",
      "label": "Intro",
      "measures": [
        {
          "chords": [
            { "numeral": "I", "modifiers": ["diamond"] }
          ]
        },
        {
          "chords": [
            { "numeral": "IV", "modifiers": ["diamond"] }
          ]
        }
      ]
    },
    {
      "type": "verse",
      "label": "Verse",
      "repeat": 2,
      "measures": [
        { "chords": [{ "numeral": "I", "modifiers": [] }] },
        { "chords": [{ "numeral": "IV", "modifiers": [] }] },
        { "chords": [{ "numeral": "I", "modifiers": [] }] },
        { "chords": [{ "numeral": "V", "modifiers": [] }] },
        { "chords": [{ "numeral": "I", "modifiers": [] }] },
        { "chords": [{ "numeral": "IV", "modifiers": [] }] },
        { "chords": [{ "numeral": "I", "modifiers": [] }] },
        { "chords": [{ "numeral": "I", "modifiers": [] }] }
      ]
    }
  ],
  "displaySettings": {
    "measuresPerLine": 4
  }
}
```

## JavaScript API

### Creating Charts Programmatically

```javascript
import { Chart, Section, Measure, Chord, SectionTypes, ChordModifiers } from './models/Chart'

// Create a new chart
const chart = new Chart()
chart.title = "My Song"
chart.key = "G"
chart.tempo = 120

// Create a section
const verse = new Section(SectionTypes.VERSE, "Verse 1")

// Add measures
verse.measures = [
  Measure.single(new Chord('I')),
  Measure.single(new Chord('IV')),
  Measure.split([
    new Chord('I'),
    new Chord('V')
  ])
]

// Add to chart
chart.sections.push(verse)

// Serialize
const json = chart.toJSON()
```

### Parsing Charts

```javascript
import Chart from './models/Chart'

// From JSON object
const chart = Chart.fromJSON(jsonData)

// From JSON string
const chartString = localStorage.getItem('myChart')
const chart = Chart.fromJSON(JSON.parse(chartString))
```

### Utilities

```javascript
import chartUtils from './utils/chartUtils'

// Validate chart
const { isValid, errors } = chartUtils.validateChart(chart)

// Get statistics
const stats = chartUtils.getChartStats(chart)
// { sections: 3, measures: 24, chords: 28, durationSeconds: 120 }

// Get unique chords
const chords = chartUtils.getUniqueChords(chart)
// ['I', 'IV', 'V', 'VIm']

// Format chord for display
const display = chartUtils.formatChordDisplay(chord)
// 'IΔ⁷' or '♭VII' or 'I/III'
```

## Validation Rules

A valid chart must have:

1. **Non-empty title**
2. **Valid key** (one of: C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B)
3. **At least one section**
4. **Each section must have:**
   - A label
   - At least one measure
5. **Each measure must have:**
   - At least one chord

## Best Practices

### Measure Layout

- Default to 4 measures per line for readability
- Use 8 measures per line for simpler progressions
- Keep measuresPerLine consistent throughout the chart

### Section Organization

- Always label sections clearly (e.g., "Verse 1", "Verse 2", "Chorus")
- Use section types consistently
- Add section notes for special instructions

### Chord Notation

- Use uppercase Roman numerals (I, II, III, IV, V, VI, VII)
- Apply modifiers consistently
- Prefer `minor` over `m` for clarity in JSON
- Use `maj7` for major sevenths, `7` for dominant sevenths

### Split Measures

- Default to even splits (2 chords = 2 beats each in 4/4)
- Use `beats` property only for uneven splits
- Limit to 4 chords per measure for readability

## Storage

### Database Storage

Charts are stored in the database as JSON strings in the `Content` column:

```sql
INSERT INTO Charts (Title, Key, Content, ...)
VALUES ('My Song', 'G', '{"version":"1.0","metadata":{...}}', ...)
```

### Local Storage

For client-side caching:

```javascript
// Save
localStorage.setItem('chart_' + chartId, JSON.stringify(chart.toJSON()))

// Load
const data = JSON.parse(localStorage.getItem('chart_' + chartId))
const chart = Chart.fromJSON(data)
```

## Future Extensions

Possible additions to the data model:

- **Dynamics**: ff, f, mf, mp, p, pp
- **Repeats**: D.C., D.S., Coda, Fine
- **Time signature changes**: Mid-song time changes
- **Fermatas**: Specific placement
- **Rhythmic notation**: Detailed rhythm patterns
- **Multiple endings**: 1st/2nd endings
- **Capo information**: Capo position
- **Lyrics**: Optional lyric snippets

---

For more information, see:
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system architecture
- [CHART_SYNTAX.md](../CHART_SYNTAX.md) - Nashville Number System notation guide
