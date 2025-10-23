/**
 * Utility functions for generating educational tooltips
 */

// Get description for a Roman numeral
export function getNumeralDescription(numeral) {
  const descriptions = {
    'I': 'Tonic (1st degree) - Home chord',
    'II': 'Supertonic (2nd degree)',
    'III': 'Mediant (3rd degree)',
    'IV': 'Subdominant (4th degree) - Pre-dominant',
    'V': 'Dominant (5th degree) - Leads back to I',
    'VI': 'Submediant (6th degree) - Relative minor',
    'VII': 'Leading Tone (7th degree)'
  }
  return descriptions[numeral] || numeral
}

// Get description for accidentals
export function getAccidentalDescription(accidental) {
  if (accidental === 'b') return 'Flat - Lowers the chord by a half step'
  if (accidental === '#') return 'Sharp - Raises the chord by a half step'
  return ''
}

// Get description for chord modifiers
export function getModifierDescription(modifier) {
  const descriptions = {
    'minor': 'Minor chord - Has a minor 3rd (sad/dark sound)',
    'm': 'Minor chord',
    '7': 'Dominant 7th - Adds the ♭7th scale degree',
    'maj7': 'Major 7th - Adds the major 7th scale degree',
    'Δ⁷': 'Major 7th chord',
    'dim': 'Diminished - Lowered 3rd and 5th',
    '°': 'Diminished chord',
    'aug': 'Augmented - Raised 5th',
    '+': 'Augmented chord',
    'sus4': 'Suspended 4th - Replaces 3rd with 4th',
    'sus⁴': 'Suspended 4th chord',
    'sus2': 'Suspended 2nd - Replaces 3rd with 2nd',
    'sus²': 'Suspended 2nd chord',
    'diamond': 'Diamond - Let the chord ring for the full measure (whole note)',
    'push-back': 'Push - Syncopate earlier (hit on the "and" before the beat)',
    'push-forward': 'Push - Syncopate later (hit after the beat)',
    'staccato': 'Staccato - Choke/stop the chord immediately (short and crisp)'
  }
  return descriptions[modifier] || modifier
}

// Get description for slash chords
export function getSlashChordDescription(numeral, bassNote) {
  return `${numeral} chord with ${bassNote} in the bass (inversion)`
}

// Get full chord description
export function getFullChordDescription(chord, key) {
  let description = getNumeralDescription(chord.numeral)

  if (chord.accidental) {
    description += ` (${getAccidentalDescription(chord.accidental)})`
  }

  if (chord.modifiers.includes('minor') || chord.modifiers.includes('m')) {
    description += ' - Minor quality'
  }

  if (chord.bassNote) {
    description += ` with ${chord.bassNote} in bass`
  }

  if (key) {
    description += ` | In key of ${key}`
  }

  return description
}

export default {
  getNumeralDescription,
  getAccidentalDescription,
  getModifierDescription,
  getSlashChordDescription,
  getFullChordDescription
}
