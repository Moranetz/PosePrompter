# The Metacognitive Mirror - Design Notes

## Overview

**Game Title:** The Metacognitive Mirror - A Transcendent Computation Catalyst  
**Engine:** Godot 4.3  
**Core Concept:** An interactive meditation that triggers recursive self-observation through text, visuals, and audio designed around neuroscience research.

---

## Psychological Framework: Self-Determination Theory (ARC)

### ARC Analysis (January 2026)

| Need | Score | Justification |
|------|-------|---------------|
| **Autonomy** | LOW (Intentional) | No builds, paths, or character choices. Only choice is *when* to continue. Thematically, "You cannot step outside the system" is the point. |
| **Competence** | MEDIUM | Hidden skill system via focus depth tracking (Surface → Settling → Flow → Deep → Transparent). Mastery is phenomenological, not gamified. |
| **Relatedness** | LOW | Solo experience, no multiplayer, no named characters. The "other" is the observing system itself. |

### Compensatory Profile

This game primarily compensates for **Competence** in a non-traditional way:
- Targets the **overwhelmed mind seeking mastery of stillness**
- For players experiencing cognitive overload, attention fragmentation
- Promise: "A space where doing less is mastery"

---

## Dopamine Optimization Systems

### Design Philosophy

The dopamine systems were added to maximize engagement while respecting the contemplative nature:
- **Variable reward timing** creates anticipation without addiction
- **Multi-sensory bursts** (visual + audio) for richer reward response
- **Rare events** use variable ratio schedules (most engaging)
- **Cooldowns and frequency limits** prevent habituation

### Core Systems

#### 1. Session Data Persistence (`session_data.gd`)

Tracks progress across sessions:

```
Streaks: Daily consecutive sessions
Milestones: Fibonacci intervals (1, 3, 5, 8, 13, 21, 34, 55, 89, 144)
Transparencies: Times player achieved highest focus state
```

**Unlockable Content:**
| Unlock | Requirement |
|--------|-------------|
| Night Mode | 3 sessions |
| Ocean Breath | 7-day streak |
| The Second Mirror | 13 sessions |
| Void Theme | 3 transparencies |
| Crystalline Audio | 30 deep focus minutes |
| Deep Ocean | 34 sessions |
| The Observer | 8 transparencies |

#### 2. Dopamine Feedback (`dopamine_feedback.gd`)

**Insight Bursts:**
- Triggered on focus state changes, key narrative moments
- Intensity scales: 0.2 (settling) → 0.5 (flow) → 0.7 (deep) → 0.95 (transparency)
- Cooldown: 3 seconds minimum between bursts
- Frequency limit: Max 5 bursts per minute

**Rare Events:**
- Max 3 per session
- 60+ second cooldown between events
- Types:
  - Bird Crossing (35%) - awe trigger
  - Distant Star (25%) - wonder trigger
  - Perfect Alignment (20%) - flow trigger
  - Warm Pulse (15%) - comfort trigger
  - Whispered Phrase (5%) - rarest, "you are here"

**Anticipation System:**
- Builds before known reward moments
- Slows text reveal (higher anticipation = 30% slower)
- Anticipation > reward for dopamine response

#### 3. Variable Pacing (`main.gd`)

Text reveal uses unpredictable timing:
- Base speed: 55ms per character
- Random variance: ±12ms
- Key moments slow down near end of segment
- Dramatic pauses: 15% chance during eligible segments, 8+ second cooldown

**Key Moment Indices:** `[7, 10, 17, 22, 26, 32, 38]`
- Correspond to "what?", questions, pivotal revelations
- Trigger insight bursts automatically

#### 4. Audio Rewards (`audio_atmosphere.gd`)

**Layered Insight Tones:**
- Low: 110Hz (A2) - grounding
- Mid: 220Hz (A3) - presence  
- High: 440Hz (A4) - crystalline (only at high intensity)

**Attack-Decay Envelope:**
- Quick attack (10% of duration)
- Slow quadratic decay (pleasure lingers)
- Harmonics added for warmth

**Rare Event Audio:**
- Temple bell (C5, 523Hz) with inharmonic partials
- Breathy whisper texture

#### 5. Visual Rewards (`recursion_circles.gd`)

**Rare Event Visuals:**
- Bird: Awe-scale (0.7% of frame), slow 12-second crossing
- Star: Fibonacci position, 2s fade in, 6s hold, 4s fade out
- Perfect Alignment: Circles synchronize pulses
- Warm Pulse: Rose color intensifies for one breath cycle

**Burst Glow:**
- Radiating rings from center
- Color based on intensity (settling→golden white)

---

## Neuro-Aesthetic Constants (`neuro_aesthetics.gd`)

Based on research citations:

| Constant | Value | Purpose |
|----------|-------|---------|
| SKY_GRADIENT_TOP | #0855b1 (450nm) | PCC quieting, initiates calm |
| SKY_GRADIENT_MID | #4fa5d8 (490nm) | Deepens parasympathetic response |
| BREATH_CYCLE_SECONDS | 8.0 | Slow breath entrainment (7.5/min) |
| INHALE_RATIO | 0.4 | 40% inhale, 60% exhale - vagus activation |
| RULE_OF_THIRDS_VIOLATION | 0.02 | 2% offset keeps eye searching 300ms longer |
| AWE_SCALE_RATIO | 0.007 | 0.7% of frame - self-transcendence trigger |
| SATURATION_CAP | 0.30 | <30% prevents cortical arousal |

---

## Focus State System (`focus_state.gd`)

**States:**
```
SURFACE (0.0-0.2)     - Scattered, orienting
SETTLING (0.2-0.4)    - Finding rhythm
FLOW (0.4-0.6)        - Sustained absorption
DEEP (0.6-0.8)        - Self-narration quieting
TRANSPARENT (0.8-1.0) - Boundary dissolution (rare)
```

**Computed From:**
- Timing consistency between inputs
- Breath alignment (input at breath turning points)
- Session duration factor

**Behavioral Observation:**
- Hesitation threshold: 4 seconds
- Rush threshold: 1 second
- Deep pause threshold: 15 seconds
- System responds with contextual text injections

---

## Meditation Content Structure (`meditation_data.gd`)

**Segment Types:**
1. INSTRUCTION - Setup, establishes frame
2. REVELATION - Builds the recursive trap
3. QUESTION - Direct challenge requiring internal response
4. PRESSURE - Tightens the loop
5. REFRAME - New latticework
6. SILENCE - Integration point

**Phases:**
1. Establish default model (unified selfhood)
2. The Trap (reading becomes self-observation)
3. Apply Pressure (infinite regress)
4. Corner the Reader (trap inescapable)
5. The Corner (eye cannot see itself)
6. New Latticework (self as event, not entity)
7. Grounding (experience, not belief)
8. Silent Integration

---

## Post-Session Revelation

After 30 seconds of final silence, reveals:
- Duration acknowledgment
- Peak focus state reached
- Streak information
- New milestones (with celebrations)
- Unlocks (with big celebrations)

---

## File Structure

```
scripts/
├── main.gd                 # Main controller, dopamine integration
├── meditation_data.gd      # Text content and segment structure
├── focus_state.gd          # Player attention tracking (autoload)
├── session_data.gd         # Persistence, streaks, unlocks
├── dopamine_feedback.gd    # Insight bursts, rare events
├── audio_atmosphere.gd     # Generative audio, reward tones
├── neuro_aesthetics.gd     # Research-based constants
├── recursion_circles.gd    # Visual feedback, rare event rendering
└── breath_indicator.gd     # Breath entrainment visual
```

---

## Key Design Principles

1. **Anticipation > Reward** - Delays before revelations build more dopamine than the reward itself
2. **Variable Ratio Schedule** - Unpredictable timing is most engaging (rare events, dramatic pauses)
3. **Multi-Sensory Layering** - Visual + audio creates richer response
4. **Frequency Limits** - Prevents habituation, maintains meaningfulness
5. **Phenomenological Mastery** - Skill is attention, not points
6. **Intentional Constraint** - Low autonomy is thematically coherent
7. **Physics-Based Aliveness** - Spring animations make elements feel like living tissue, not mechanical interpolation

---

## Spring Physics System

### Core Insight

> "Nothing in nature moves linearly. Springs = life."

All visual transitions use damped harmonic oscillator physics instead of linear interpolation. This creates an "aliveness" that users feel subconsciously—elements that breathe, settle, and respond like physical objects.

### Implementation

**SpringValue class** in `neuro_aesthetics.gd`:
- Tracks current value, velocity, and target
- Uses damped harmonic oscillator: `acceleration = (target - current) * stiffness - velocity * damping`
- Auto-settles when close to rest (prevents infinite micro-oscillations)

**Applied to:**
- Breath indicator scale and alpha
- Recursion circle intensity
- Visual complexity (focus-based subtraction)
- Burst glow decay
- Rare event appearances (star alpha)

**Rare events use easing:**
- Bird crossing: `ease_in_out_cubic` for natural gliding
- Warm pulse: `ease_out_quad` for organic intensity

### Haptic Physics

Haptics fire on press-down BEFORE visual processing:
1. User presses → immediate haptic (15ms)
2. System processes input → visual feedback
3. If breath-aligned → secondary confirmation haptic (50ms)

This ordering makes input feel more responsive and "alive."

---

## Future Considerations

- **Relatedness Enhancement:** "Others are sitting with this now" - anonymous co-presence indicator
- **Unlockable Meditations:** Different texts, themes, durations
- **Biometric Integration:** Heart rate variability for breath sync
- **Community Features:** Anonymized behavioral resonance ("23 others paused here too")

---

## Design Framework Analysis (January 2026)

### Physics-Based Interaction Design

**Core Insight:** "When digital interfaces obey the laws of physics, they feel ALIVE. Alive things are trustworthy."

**What Applies to This Game:**
| Moment | Applicable? | Implementation |
|--------|-------------|----------------|
| Scrolling | ❌ No | No scroll interface (intentional) |
| Swiping | ❌ No | "Only verbs: Read, Observe, Continue" |
| Tapping | ✅ Yes | "Continue" input with haptic feedback |
| Dragging | ❌ No | No draggable elements (intentional void) |
| Transitioning | ✅ Yes | All visual elements use spring physics |

**Three Physics Laws Applied:**
1. **Objects have weight** → Circles pulse with mass (spring physics)
2. **Actions have consequences** → Haptic + visual feedback on every input
3. **Everything bounces back** → Spring-based return to rest states

**Key Principle:** "Alive = Breathing, not bouncing. Organic, not playful."

---

### Psychology-Driven UX (Celia Hodent Framework)

**Scores:**
| Principle | Rating | Notes |
|-----------|--------|-------|
| Reduce Cognitive Load | ✅ Excellent | "Only verbs: Read, Observe, Continue" |
| Direct Attention | ✅ Excellent | Visual subtraction rewards attention |
| Motivation Balance | ✅ Good | Intrinsic core + extrinsic layer |
| Flow & Feedback | ✅ Excellent | Entire game is a flow state generator |
| Ethics | ⚠️ Complex | See unified philosophy below |

---

### The Unified Design Philosophy

**The Two Philosophies Are NOT Contradictory:**

| Layer | What It Says |
|-------|--------------|
| **Mechanism** | Use addiction science (variable ratio, dopamine scheduling, loss aversion, compulsion loops) |
| **Outcome** | Direct toward presence and restoration, not depletion and craving |

**The Key Quote:**
> "The game uses the *mechanisms* of addiction (variable reward, pattern recognition, escalating complexity) while inverting the *residue*."

**The Closing Principle:**
> "The player is not having fun. They are resolving tension through ritual. The game is not entertainment—it is a meditation on obsession, weaponized."

This isn't a contradiction—it's the same philosophy at different layers:
- Know exactly how compulsion works (dark patterns knowledge)
- Redirect it toward transcendence (the golden rule)

---

### 150ms Personal Connection Pulse

**Research Basis:** "Same length as human micro-expression of flirtation—hard-wired to feel personal"

**Implementation:**
- Duration: 150ms (micro-expression length)
- Spring: SPRING_RESPONSIVE for snappy "noticed you" feel
- Visual: Warm expanding rings from center
- Purpose: Creates feeling of "it noticed me personally"

---

### Dark Flow Visual State

**Concept:** "mPFC shutdown = visuals become hypnotic, minimal, dissolving"

**Visual Effects:**
- Detail reduction: 50% at full dark flow
- Desaturation: 40% color reduction
- Rare events suppressed (not breaking trance)
- Motes fade (visual subtraction accelerated)
- Stillness point intensified (the only thing remaining)

**Philosophy:** "Seeking oblivion, not highs - progressive simplification"

---

### Implementation Summary

**Spring Physics Added:**
- `NeuroAesthetics.SpringValue` class for smooth organic animations
- Applied to: breath indicator, circle intensity, visual complexity, burst glow, rare events
- Presets: SPRING_BREATH (slow), SPRING_GENTLE, SPRING_RESPONSIVE, SPRING_HEAVY

**Easing Functions Added:**
- `ease_out_cubic` — Bird gliding
- `ease_in_out_cubic` — Smooth acceleration/deceleration
- `ease_out_quad` — Subtle effects

**Haptic Timing:**
- Fire on press-down BEFORE visual processing
- Secondary confirmation haptic for good breath alignment

---

*Last updated: January 2026*
