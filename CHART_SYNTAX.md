# Nashville Number System - Chart Syntax Guide

This guide explains how to create charts using the Nashville Number System in Nashville Charts.

## Table of Contents
1. [Basic Concepts](#basic-concepts)
2. [Chord Notation](#chord-notation)
3. [Special Symbols](#special-symbols)
4. [Chart Structure](#chart-structure)
5. [Advanced Features](#advanced-features)
6. [Examples](#examples)

## Basic Concepts

### What are the Numbers?

Numbers represent the scale degree of chords relative to the key:

| Number | Scale Degree | In Key of C | In Key of G | In Key of D |
|--------|--------------|-------------|-------------|-------------|
| I      | Tonic        | C           | G           | D           |
| II     | Supertonic   | D           | A           | E           |
| III    | Mediant      | E           | B           | F#          |
| IV     | Subdominant  | F           | C           | G           |
| V      | Dominant     | G           | D           | A           |
| VI     | Submediant   | A           | E           | B           |
| VII    | Leading Tone | B           | F#          | C#          |

### Default Assumptions
- **Each number = one measure** (4 beats in 4/4 time)
- **All numbers are major chords** unless marked otherwise
- **4/4 time signature** unless specified

## Chord Notation

### Major Chords (Default)
Simply write the Roman numeral:
```
I  IV  V  I
```
This is a I-IV-V-I progression. In the key of C, this would be: C, F, G, C.

### Minor Chords
Add `m` or `-` after the number:
```
VIm  IVm  V  I
or
VI-  IV-  V  I
```
In the key of C: Am, Fm, G, C.

### Seventh Chords
Add `7` after the number:
```
I  IV  V7  I
```

### Other Chord Types
- **Major 7th**: `Imaj7` or `IΔ7`
- **Diminished**: `VII°` or `VIIdim`
- **Augmented**: `III+` or `IIIaug`
- **Suspended**: `Isus4`, `Isus2`
- **Add chords**: `Iadd9`, `IVadd2`

### Accidentals
Write accidentals to the LEFT of the number:
```
♭VII  ♭III  I
or
bVII  bIII  I
```
In the key of C: Bb, Eb, C.

```
#IV  V  I
```
In the key of C: F#, G, C.

## Special Symbols

### Diamond (◇) - Whole Note / Let Ring
Indicates the chord should ring for the full measure:
```
◇I  ◇IV
```

**Mobile Input**: Select chord, then tap diamond symbol on wheel.

### Push Symbols (< >) - Syncopation
Moves the chord attack:
- `<` = Push back (1/8 note earlier)
- `>` = Push forward (1/8 note later)

```
I  <IV  I  V
```
The IV chord hits on the "and" of beat 4 in the previous measure.

**Mobile Input**: Select chord, then tap push symbol on wheel.

### Staccato / Choke (^)
Chord is played briefly and stopped:
```
I  ^IV  V  I
```

**Mobile Input**: Select chord, then tap staccato symbol on wheel.

### Slash Chords (/) - Inversions
Specifies a different bass note:
```
I/III  IV/V  I
```
In the key of C: C with E bass, F with G bass, C.

**Mobile Input**: Select chord, tap slash, select bass note from wheel.

## Chart Structure

### Measures Per Line
By default, 4 measures per line. You can customize this:
```
I  IV  I  V     (4 measures)
I  IV  I  V     (4 measures)
```

Or 8 measures per line:
```
I  IV  I  V  I  IV  I  V
```

### Multiple Chords Per Measure (Underlining)
To fit multiple chords in one measure, underline them:

**Two chords (split evenly):**
```
I IV   V I
—— —   — —
```
Each chord gets 2 beats in 4/4 time.

**Three chords:**
```
I  IV V
   ————
```
If not specified, chords are divided evenly.

**Four chords:**
```
I II III IV
———————————
```
Each chord gets 1 beat (in 4/4 time).

**Mobile Input**: Tap measure, select "Split" option, choose number of chords.

### Uneven Divisions (Dots)
Use dots to indicate beats:
```
I··   IV·   V
```
- I gets 3 beats (3 dots)
- IV gets 1 beat (1 dot)
- V gets 4 beats (no dots in same measure = full measure)

### Song Sections
Label sections clearly:
```
[Intro]
◇I  ◇IV

[Verse]
I  IV  I  V
I  IV  V  V

[Chorus]
VIm  IV  I  V
VIm  IV  I  V

[Bridge]
IV  IV  V  V
IV  IV  V  V
```

**Mobile Input**: Tap "Add Section" button, select section type.

### Repeats
Use standard repeat notation:
```
|: I  IV  I  V :|  (repeat this phrase)
```

Or write it out:
```
[Verse]  (x2)
I  IV  I  V
```

### Endings
```
[Outro]
I  IV  |1. V  V  |2. I  ◇I
```

## Advanced Features

### Rhythmic Notation
For complex rhythms, use underscores for ties:
```
I__  IV  V__  I
```
The underscores indicate the chord is held from the previous beat.

### Fermata (𝄐)
Hold the chord longer than written:
```
I  IV  V  𝄐I
```

### Pedal Tones
Keep a bass note throughout:
```
I/I  IV/I  V/I  I/I  (I pedal throughout)
```

### Key Changes (Modulation)
Indicate key changes clearly:
```
[Verse - Key of C]
I  IV  V  I

[Chorus - Key of D]
I  IV  V  I
```

### Tempo Changes
```
[Intro - ♩=60]
◇I  ◇IV

[Verse - ♩=120]
I  IV  I  V
```

## Examples

### Example 1: Simple I-IV-V Song
```
Title: Simple Country Song
Artist: Example Band
Key: G
Time: 4/4
Tempo: ♩=120

[Intro]
I  I  IV  V

[Verse]
I  I  IV  I
I  I  V  V
I  I  IV  I
I  V  I  I

[Chorus]
IV  IV  I  I
IV  IV  V  V

[Outro]
I  IV  I  ◇I
```

### Example 2: Pop Progression with Pushes
```
Title: Modern Pop Song
Key: C
Time: 4/4

[Intro]
◇VIm  ◇IV

[Verse]
VIm  IV  I  V
VIm  <IV  I  V

[Pre-Chorus]
IV  IV  V  V
IV  V  VIm  V

[Chorus]
VIm  IV  I  V
VIm  IV  I  V
```

### Example 3: Complex Chord Changes
```
Title: Jazz-Influenced Country
Key: F
Time: 4/4

[Verse]
Imaj7  IVmaj7  Imaj7  IVmaj7
VIm7   IIm7    V7     V7

[Chorus]
I  IV  IIm  V
——————  ———  —
```

### Example 4: Using Slash Chords
```
Title: Bass Movement Example
Key: D

[Intro]
I  I/VII  I/VI  I/V

[Verse]
I      IV/I    I      V/I
IIm    IIm/I   ♭VII   V

[Chorus]
I/III  IV  I/V  V
I/III  IV  I    I
```

### Example 5: Multiple Chords Per Measure
```
Title: Quick Changes
Key: A

[Turnaround]
I  IV V  I VI  IIm V
   ————  ——————  ———

[Solo Break]
I II III IV
————————————
```

## Tips for Writing Charts

1. **Be Consistent**: Choose one style for minors (m or -) and stick with it
2. **Use Sections**: Always label your sections clearly
3. **Phrase Naturally**: Group measures in 4s or 8s when possible
4. **Add Context**: Include key, tempo, time signature at the top
5. **Test Transpose**: Try your chart in different keys to ensure it works
6. **Add Notes**: Use a notes section for special instructions ("tacet on verse 2", "drums enter on chorus", etc.)

## Common Patterns to Know

### Classic Country/Blues Turnaround
```
I  IV  I  V
```

### Pop Progression (Axis of Awesome)
```
I  V  VIm  IV
```

### 50s Progression
```
I  VIm  IV  V
```

### Nashville Standard
```
I  I  IV  V
```

### Circle of Fifths Descent
```
I  IV  VII  III  VI  II  V  I
```

---

## Need Help?

- Check the [tutorial videos](#) (coming soon)
- Ask in [community forums](#) (coming soon)
- Read the [FAQ](#) (coming soon)

Happy charting!
