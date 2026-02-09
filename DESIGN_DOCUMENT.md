# The Metacognitive Mirror — Design Document

## Project Overview

**Title:** The Metacognitive Mirror  
**Engine:** Godot 4.3  
**Genre:** Interactive Meditation / Contemplative Experience  
**Core Emotion:** Transcendent Focus (The Sacred Addiction)

---

## Emotional Design Framework

### Target Emotion: Transcendent Focus

> **The dissolution of the watcher into the watched—a focus so complete that the self temporarily ceases to narrate.**

This is the flow state at its apex: where time dilates, the peripheral world falls away, and action becomes thought-less (not thoughtless). It's the same neurological territory as the slot machine's hypnotic pull or the infinite scroll's trance—the brain's appetite for *unbroken pattern-completion*—but redirected toward presence rather than craving.

**The Crucial Distinction:**  
- Addictive focus borrows energy from your future self and leaves you hollow
- Transcendent focus generates energy and leaves you strangely whole

The game uses the *mechanisms* of addiction (variable reward, pattern recognition, escalating complexity) while inverting the *residue*. The player should emerge not depleted and craving another hit, but settled and slightly transformed.

---

## The Four Pillars

### 1. Mechanical Feel (The Hand)

**Design Choices:**
- **Breath-Synchronized Input Rhythm** — Core interaction pulses at ~8-second breath cycles. Inputs are timed releases, not frantic presses.
- **The Narrowing Verb Set** — Only verbs: Read, Observe, Continue. Mastery feels like simplification.
- **Responsive Latency Tuning** — Controls feel smoother at higher focus states (invisible to player).

**Implementation:**
- `FocusState.gd` tracks input timing consistency and breath alignment
- `breath_indicator.gd` shows timing guide with "sweet spot" when waiting for input
- Haptic feedback varies based on breath alignment quality

### 2. Aesthetic Language (The Eye & Ear)

**Design Choices:**
- **Visual Subtraction as Reward** — Higher focus = cleaner, simpler visuals. Noise fades.
- **Generative Audio That Listens Back** — Binaural beats, harmonic complexity responds to focus depth.
- **The Peripheral Fade** — Vignette contracts with focus (literal narrowing of attention).

**Implementation:**
- `recursion_circles.gd` reduces complexity at high focus (`focus_visual_complexity`)
- `vignette.gdshader` softness parameter responds to `FocusState.focus_depth`
- `audio_atmosphere.gd` uses procedural sine waves with focus-responsive harmonics
- `NeuroAesthetics.gd` provides research-based color/timing constants (PCC quieting, parasympathetic activation)

### 3. Narrative Imperative (The Mind)

**Design Choices:**
- **The Absent Protagonist** — No character. The player IS the focus itself.
- **The Implied Return** — Thematic tension: the trance is seductive, but the world is waiting.
- **The Wordless Teaching** — No tutorials. The narrative is transmitted through feel.

**Implementation:**
- `meditation_data.gd` contains the full meditation sequence with segment types:
  - INSTRUCTION, REVELATION, QUESTION, PRESSURE, REFRAME, SILENCE
- The meditation is a recursive trap: "Who noticed the watcher?" → infinite regress
- Final insight: "The self is not an entity. It is an event."

### 4. Systemic Poetry (The World)

**Design Choices:**
- **The Focus Gradient** — Five unmarked depth states (Surface → Settling → Flow → Deep → Transparent)
- **The Gentle Forgetting** — No persistent scores. Only "time spent in deep states" tracked.
- **The Natural Ending** — Sessions end when the system senses you've peaked, before depletion.

**Implementation:**
- `FocusState.gd` enum `FocusState` with 5 levels
- `SessionMemory.gd` tracks `total_time_deep` and `transparencies_achieved` only
- `natural_ending_suggested` signal fires after sustained high focus + decline detected

---

## Golden Rule

> **"The game ends before you want it to, and that is the design."**

Every decision must serve this principle: the experience is structured to *prevent* the transition from transcendent focus to addictive clinging. The player should leave each session slightly earlier than craving would dictate.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AUTOLOADS                                │
├─────────────────────────────────────────────────────────────────┤
│  FocusState          - Input timing, breath alignment, depth    │
│  SessionMemory       - Persistent depth time, transparencies    │
│  EngagementOptimizer - Deterministic behavioral engineering     │
│  NeuroAesthetics     - Research-based constants (class_name)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          main.gd                                 │
│  - Orchestrates meditation flow                                  │
│  - Connects all systems                                          │
│  - Handles behavioral observation                                │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ recursion_   │ │ breath_      │ │ audio_       │ │ DopamineFeed │
│ circles.gd   │ │ indicator.gd │ │ atmosphere.gd│ │ back.gd      │
│              │ │              │ │              │ │              │
│ Visual depth │ │ Timing guide │ │ Procedural   │ │ Insight      │
│ Visual sub-  │ │ Alignment    │ │ binaural     │ │ bursts,      │
│ traction     │ │ feedback     │ │ Focus-resp.  │ │ variable     │
│ Transparency │ │              │ │ harmonics    │ │ reward       │
│ glow         │ │              │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Focus State System

### Signals
```gdscript
signal focus_depth_changed(new_depth: float, old_depth: float)
signal focus_state_changed(new_state: FocusState, old_state: FocusState)
signal transparency_achieved()
signal natural_ending_suggested()
signal player_hesitated(duration: float)
signal player_deep_pause(duration: float)
signal player_rushed()
signal player_left_and_returned(away_duration: float)
```

### Focus Depth Calculation
- **Timing Consistency** (70%) — Standard deviation of input intervals
- **Breath Alignment** (30%) — Distance from ideal breath phase (0.0/1.0 turning point)
- **Momentum** — 92% of previous value carries forward (smoothing)
- **Buildup** — +0.02/sec when consistent, -0.05/sec when scattered

### Behavioral Thresholds
```gdscript
const HESITATION_THRESHOLD: float = 3.0   # Seconds - thoughtful pause
const DEEP_PAUSE_THRESHOLD: float = 8.0   # Seconds - genuine contemplation
const RUSHING_THRESHOLD: float = 0.8      # Seconds - not reading
```

---

## Visual Systems

### Recursion Circles
- Represent layers of self-observation ("the observer observing the observer")
- Circle count increases during PRESSURE segments (trap tightening)
- **Visual Subtraction:** `focus_visual_complexity` reduces circles at high focus
- **Transparency Glow:** Golden-white inner glow when transparency achieved

### Breath Indicator
- 8-second breath cycle synchronized with `NeuroAesthetics.BREATH_CYCLE_SECONDS`
- Shows "sweet spot" arc when waiting for input (top of circle = ideal timing)
- Moving dot shows current breath phase position
- Alignment feedback: expanding ring with color based on timing quality

### Vignette
- Shader-based peripheral darkening
- `softness` decreases with focus (tighter attention tunnel)
- `intensity` increases with focus
- Breathes with breath cycle (alpha modulation)

---

## Audio System

### Procedural Generation
- `AudioStreamGenerator` for real-time sine wave synthesis
- **Base Tone:** 180 Hz (ASMR fundamental)
- **Binaural Beat:** Left 180 Hz, Right 186 Hz (6 Hz theta difference)
- **Harmonic Blend:** Decreases with focus (purer tones at high focus)

### Phase-Responsive Volumes
| Segment Type | Base Tone | Binaural |
|--------------|-----------|----------|
| INSTRUCTION  | -32 dB    | -45 dB   |
| REVELATION   | -28 dB    | -40 dB   |
| QUESTION     | -26 dB    | -36 dB   |
| PRESSURE     | -24 dB    | -34 dB   |
| REFRAME      | -28 dB    | -38 dB   |
| SILENCE      | -40 dB    | -50 dB   |

---

## Session Persistence

### SessionMemory (Minimal — The Gentle Forgetting)
```gdscript
var total_sessions: int = 0
var total_time_deep: float = 0.0      # Seconds in Deep/Transparent
var transparencies_achieved: int = 0
var last_session_date: String = ""
```

### SessionData (Dopamine System — Added Later)
- Tracks streaks, milestones, unlocks
- Enables variable reward schedules
- Post-session revelation system

---

## Dopamine Integration (Your Addition)

You enhanced the base system with dopamine mechanics while maintaining the contemplative core.

### DopamineFeedback System (`dopamine_feedback.gd`)

**Insight Bursts:**
- Multi-sensory reward: audio (layered harmonics) + visual (glow) + vignette pulse
- Cooldown: 3 seconds minimum between bursts
- Frequency cap: 5 bursts per minute maximum
- Intensity scales: 0.2 (settling) → 0.5 (flow) → 0.7 (deep) → 0.95 (transparent)

**Anticipation System:**
- `build_anticipation(duration)` increases anticipation level over time
- Higher anticipation = slower text reveal (builds tension)
- Resets to 0 when reward is delivered

**Dramatic Pauses:**
- 15% chance during REVELATION, PRESSURE, REFRAME segments
- More likely near end of text (building to revelation)
- 8-second cooldown between pauses
- Duration: 0.1-0.4 seconds (variable)

**Rare Events (max 3 per session):**
| Event | Chance | Description |
|-------|--------|-------------|
| Bird Crossing | 35% | Awe-scale silhouette crosses sky |
| Distant Star | 25% | Tiny point of light appears, fades |
| Perfect Alignment | 20% | All circles synchronize momentarily |
| Warm Pulse | 15% | Wave of warmth through visuals |
| Whispered Phrase | 5% | Breathy "you are here" audio |

### SessionData System (`session_data.gd`)

**Streak Tracking:**
- Consecutive days of practice
- Milestones: 3, 7, 14, 30, 60, 100 days

**Unlocks:**
| Unlock | Requirement |
|--------|-------------|
| Extended Silence | 5 total sessions |
| Deeper Questions | 10 minutes deep time |
| Night Mode | 3-day streak |
| Enhanced Breath Guide | 10 flow states |
| Rare Insights | 1 transparency |
| Transparency Marker | 3 transparencies |

**Variable Ratio Scheduling:**
```gdscript
# Base threshold with 80% variance
next_rare_event_threshold = 100 + randi() % 80
# Higher focus = higher trigger chance when threshold met
trigger_chance = 0.3 + focus_depth * 0.4
```

### Audio Dopamine Layer (`audio_atmosphere.gd`)

**Reward Tones (procedural):**
- Low: 110 Hz (A2) - grounding warmth
- Mid: 220 Hz (A3) - present, warm
- High: 440 Hz (A4) - crystalline (only at intensity > 0.5)

**Attack-Decay Envelope:**
- 10% attack, 90% quadratic decay
- Harmonics: 2nd (15%), 3rd (8%) for warmth

**Rare Event Audio:**
- `play_distant_bell()` - temple bell with inharmonic partials
- `play_whispered_phrase()` - breathy, filtered noise texture

### Visual Dopamine Layer (`recursion_circles.gd`)

**Burst Glow:**
- Radiating rings from center
- Color based on intensity (golden-white at max)
- 1-second fade with expanding radius

**Rare Event Visuals:**
- Bird: Two angled lines with wing-flap animation
- Star: Tiny point with twinkle effect
- Perfect Alignment: All circles pulse together
- Warm Pulse: Rose color intensity increases

### Variable Reward Timing (`main.gd`)

```gdscript
var type_speed_variance: float = 0.012  # ±12ms unpredictability
var key_moment_indices: Array[int] = [7, 10, 17, 22, 26, 32, 38]
```

**Key moments** get:
- Extra pause before revelation
- Insight burst on completion
- Anticipation build during wait

### Post-Session Revelation
- 30-second silence first (integration)
- Then progress fades in:
  - Duration acknowledgment
  - Peak focus state
  - Streak info (new records highlighted)
  - Milestones with celebrations
  - Unlocks with big celebration sequence

---

## Neuro-Aesthetic Constants

From research literature (citations in code):

```gdscript
# Color wavelengths for PCC quieting (Yaden 2019, Melin 2017)
const SKY_GRADIENT_TOP := Color("#0855b1")   # 450nm - initiates calm
const SKY_GRADIENT_MID := Color("#4fa5d8")   # 490nm - parasympathetic
const SKY_GRADIENT_LOW := Color("#daeaf7")   # 570nm - horizon

# Visual composition (Nadal 2021, Armstrong 2010)
const RULE_OF_THIRDS_VIOLATION := 0.02       # Keeps eye searching 300ms longer
const AWE_SCALE_RATIO := 0.007               # 0.7% of frame - self-transcendence
const SATURATION_CAP := 0.30                 # <30% prevents cortical arousal

# Timing (Attention Research)
const BREATH_CYCLE_SECONDS := 8.0            # 7.5 breaths/min
const INHALE_RATIO := 0.4                    # 40% inhale, 60% exhale (vagus)
```

---

## Spring Physics System

### The Aliveness Principle

> "When digital interfaces obey the laws of physics, they feel **ALIVE**. Alive things are trustworthy."

Nothing in nature moves linearly. The breath indicator, circles, and rare events use spring physics to feel like living tissue—expanding and contracting with natural ease, not mechanical interpolation.

### Spring Presets (Tuned for Contemplative Feel)

```gdscript
# Softer than typical UI springs - matches meditation aesthetic
SPRING_BREATH     = { stiffness: 12, damping: 4 }   # Slow, organic breathing
SPRING_GENTLE     = { stiffness: 25, damping: 6 }   # Soft transitions
SPRING_RESPONSIVE = { stiffness: 80, damping: 12 }  # Quick feedback
SPRING_HEAVY      = { stiffness: 15, damping: 8 }   # Weighted, massive feel
```

### Where Springs Are Applied

| Element | Spring Type | Purpose |
|---------|-------------|---------|
| Breath indicator scale | SPRING_BREATH | Organic breathing feel |
| Breath indicator alpha | SPRING_BREATH | Smooth visibility changes |
| Circle intensity | SPRING_BREATH | Natural pulse transitions |
| Visual complexity | SPRING_GENTLE | Gradual simplification at high focus |
| Burst glow decay | SPRING_RESPONSIVE | Organic reward fade |
| Transparency glow | SPRING_GENTLE | Achievement revelation |
| Star alpha | SPRING_GENTLE | Smooth rare event appearance |

### Easing Functions for Rare Events

```gdscript
ease_out_cubic()      # Bird gliding - starts fast, slows naturally
ease_in_out_cubic()   # Smooth acceleration and deceleration
ease_out_quad()       # Gentler deceleration for subtle effects
```

### Haptic Timing (Physics-Based)

Haptics fire on press-down (before visual processing) for maximum responsiveness:

```gdscript
# In _input():
trigger_haptic()  # FIRST - immediate tactile confirmation
accept_input()    # THEN - visual/state processing

# Secondary alignment haptic:
if alignment > 0.7:
    await 0.05s   # Distinguish from initial press
    trigger_haptic(BREATH_MS)  # Satisfying confirmation
```

### The Three Physics Laws Applied

| Law | Implementation |
|-----|----------------|
| **Objects have weight** | Circles pulse with mass (slower to start/stop via spring physics) |
| **Actions have consequences** | Haptic + visual feedback on every input |
| **Everything bounces back** | Spring-based return to rest states |

---

## 150ms Personal Connection Pulse

### The Research

> "Same length as human micro-expression of flirtation—hard-wired to feel personal"

150ms is the duration of micro-expressions that signal personal recognition. When the system "notices" the player, a warm pulse radiates from center at this precise duration.

### Implementation

```gdscript
const PERSONAL_PULSE_DURATION := 0.15  # 150ms - micro-expression length

# Uses SPRING_RESPONSIVE for snappy "noticed you" feel
personal_pulse_spring = SpringValue.new(0.0, SPRING_RESPONSIVE)
```

### Visual Effect

- Warm expanding rings from center (same color as Fibonacci accent)
- Multiple soft layers for warmth
- Central bright point
- Springs to full, then springs back to zero

### Trigger Points

- When system detects meaningful behavioral pattern
- At key recognition moments in EngagementOptimizer
- Creates feeling: "it noticed me personally"

---

## Dark Flow Visual State

### The Concept

> "mPFC shutdown = visuals become hypnotic, minimal, dissolving"
> "Seeking oblivion, not highs - progressive simplification"

When the player enters a deep trance state (tracked by EngagementOptimizer), visuals progressively dissolve toward nothing. This is visual subtraction taken to its extreme—the reward is absence.

### Implementation

```gdscript
# Uses SPRING_HEAVY for slow, massive dissolution
dark_flow_spring = SpringValue.new(0.0, SPRING_HEAVY)

# Visual modifications at full dark flow:
detail_mult := 1.0 - dark_flow * 0.5      # 50% detail reduction
saturation_mult := 1.0 - dark_flow * 0.4  # 40% desaturation
```

### Visual Effects

| Element | Dark Flow Effect |
|---------|------------------|
| Rare events | Suppressed (not breaking trance) |
| Awe motes | Fade with dark flow intensity |
| Circle complexity | Accelerated simplification |
| Stillness point | Intensified (the only thing remaining) |
| Fibonacci accent | Suppressed |
| Colors | Desaturated toward grayscale |

### The Philosophy

The player isn't seeking reward—they're seeking dissolution. The visuals honor this by becoming progressively simpler, eventually leaving only the central stillness point. The trance state is the goal, not a means to an end.

---

## Temporal Contrast (Compression → Expansion)

### The Principle

> "10 minutes of claustrophobic dungeon → sudden open sky"
> "Compression before key moments makes expansion feel EARNED"

Without compression, expansion is just... large. The contrast creates emotional weight.

### Implementation

```gdscript
# Before key REVELATION/QUESTION moments:
recursion_circles.begin_compression()  # Vignette tightens, circles contract
audio_atmosphere.begin_anticipation()   # Pitch rises

await compression_duration  # 1.5-3 seconds based on focus depth

recursion_circles.begin_expansion()     # The "open sky" release
```

### Visual Effects During Compression

| Element | Compression Effect |
|---------|-------------------|
| Vignette | Tightens 25% (claustrophobia) |
| Circles | Contract 30% inward |
| Detail | Reduces 30% |
| Audio | Pitch rises 12% |

### The Release

When compression releases into expansion, all these effects reverse with spring physics—creating a visceral sense of "breaking free" into openness.

---

## Scale Shift for Genuine Awe

### The Research

Awe requires **vastness** — something larger than the self (Keltner, Sturm).

### Implementation

```gdscript
const SCALE_SHIFT_TINY := 0.3   # Circles become small, revealing vastness
const SCALE_SHIFT_VAST := 2.5   # Single circle fills screen

func trigger_awe_moment():
    scale_shift_spring.set_target(SCALE_SHIFT_TINY)
    # Circles shrink dramatically, revealing they exist in vast space
```

### Trigger Points

- Transparency achieved
- Deep focus sustained for 3+ minutes
- Certain REVELATION segments

---

## Sound Resolution to Unity

### The Principle

> "When multiple frequencies collapse into one, it creates profound CLARITY"
> "The dissolution of complexity mirrors the dissolution of thought"

### Implementation

```gdscript
func begin_unity_resolution():
    # All frequencies glide toward UNITY_FREQ (220 Hz - A3)
    # Binaural beat narrows to zero (no frequency difference)
    # Harmonics fade, only fundamental remains
    
    # This IS the sound of "the watcher dissolving"
```

### Parameters

```gdscript
UNITY_FREQ := 220.0                  # A3 - the frequency of resolution
UNITY_TRANSITION_DURATION := 4.0     # Seconds to collapse
```

---

## Breath-Locked Pitch

### The Research

Tighter breath-pitch coupling increases parasympathetic activation.

### Implementation

```gdscript
const BREATH_PITCH_RANGE := 0.06  # ±3% (6% total range)

# Inhale: pitch rises slightly (anticipation, filling)
# Exhale: pitch falls (release, emptying)

# The 6% range is imperceptible consciously
# but the nervous system tracks it
```

This creates physical entrainment at a subliminal level.

---

## Dynamic Color Temperature

### The Principle

```
Warm (3000K) = safety, intimacy, grounding
Neutral (5500K) = clarity, presence
Cool (8000K+) = vastness, transcendence, awe
```

### Implementation

```gdscript
# Color temperature shifts based on focus depth and awe state
var target_temp := NeuroAesthetics.get_color_temp_for_state(focus_depth, in_awe_moment)

# Converts Kelvin to RGB and blends with base colors
# Uses breath-speed spring for slow, atmospheric changes
```

### Applied To

- Circle colors
- Vignette tint
- Sky gradient (via shader)

---

## Shaped Silence (Active Absence)

### The Problem

Silence that is pure absence feels like "dead air" — anxiety-inducing (anechoic chamber effect).

### The Solution

> "Silence that still has presence"

### Implementation

```gdscript
# Don't fade to zero — fade to the ROOM
SHAPED_SILENCE_SUB_FREQ := 35.0   # Sub-bass rumble (blood in ears)
SHAPED_SILENCE_SUB_VOL := -45.0   # Very quiet

# Occasional micro-sounds (1-2 per minute):
MICRO_SOUND_INTERVAL := 45.0

func trigger_micro_sound():
    match randi() % 3:
        0: play_distant_bell()
        1: brief_volume_swell()
        2: subtle_harmonic_shimmer()
```

This creates "alive silence" not "dead air."

---

## Haptic Breath Guidance

### The Principle

> "Haptics LEAD the visual by 50ms"
> "Body receives cue before eyes — feels more natural"

### Implementation

```gdscript
const HAPTIC_LEAD_TIME := 0.05    # 50ms lead
const HAPTIC_INHALE_MS := 15      # Very light pulse
const HAPTIC_EXHALE_MS := 25      # Slightly longer pulse

# Haptics fire at breath phase TRANSITIONS
# Inhale start: 15ms pulse
# Exhale start: 25ms pulse
```

This creates **physical entrainment**, not just visual.

---

## Peripheral Vision Awareness

### The Research

> "Peripheral vision is where the nervous system detects threat/safety"

### Implementation (Vignette Shader)

```glsl
uniform float peripheral_stillness : hint_range(0.0, 1.0) = 0.0;

// At low focus: peripheral slightly active (subtle movement)
// This keeps alertness — appropriate for early meditation

// At high focus: peripheral goes completely still
// Signals "nothing to attend to out there"
// Triggers parasympathetic activation

// The STILLNESS of periphery matters more than darkness
```

### The Effect

- Low focus: subtle noise-like movement in peripheral regions
- High focus: complete peripheral stillness
- The transition is gradual (follows focus depth)

---

## Named Phenomenological States

### The Principle

> "Naming the experience helps people recognize it next time WITHOUT the app"

### Implementation

```gdscript
const NAMED_STATES := {
    "settling": "This is the body remembering stillness.",
    "resistance": "This is the mind's habit of motion.",
    "wandering": "This is attention doing what attention does.",
    "returning": "This is the noticing that was never gone.",
    "glimpse": "This is what was always here.",
    "deepening": "This is familiarity with the unfamiliar.",
    "dissolution": "This is the watcher forgetting to watch.",
    "integration": "This is the ordinary becoming transparent.",
}
```

### Usage

These phrases can be surfaced in the meditation text at appropriate moments, giving practitioners language for their internal experiences.

---

## The Orchestrated Moment: First Transparency

**Trigger:** Player sustains Deep focus for ~90 seconds with metronomic input consistency.

**The Shift:**
1. Music simplifies (notes drop away)
2. Visual field contracts further
3. Input timing windows become MORE forgiving (game helps them stay)

**The Mechanic:**
- Single sustained input required (hold, then release when ready)
- Duration indeterminate — player chooses when to let go

**The Bloom:**
- Screen fills with single color (like dawn)
- Audio resolves to single tone, then silence
- Vignette opens — light returns to periphery

**The Recognition:**
- If release was natural (not forced), a soft visual marker appears
- No fanfare — just quiet acknowledgment: "You were here"

**The Feeling:**
- Player exhales (because body needed to, not because game said)
- Emotion: transcendent focus achieved, residue is completion not craving

---

## File Structure

```
Meditation Game/
├── project.godot
├── DESIGN_DOCUMENT.md          ← You are here
├── scenes/
│   └── main.tscn
├── scripts/
│   ├── main.gd                 ← Orchestrator (dopamine enhanced)
│   ├── focus_state.gd          ← Autoload: focus tracking
│   ├── session_memory.gd       ← Autoload: minimal persistence (gentle forgetting)
│   ├── meditation_data.gd      ← Segment definitions + behavioral observations
│   ├── neuro_aesthetics.gd     ← Research constants (class_name)
│   ├── recursion_circles.gd    ← Visual: observer layers + rare event visuals
│   ├── breath_indicator.gd     ← Visual: timing guide + alignment feedback
│   ├── audio_atmosphere.gd     ← Procedural audio + dopamine reward tones
│   ├── dopamine_feedback.gd    ← Insight bursts, rare events, celebrations
│   └── session_data.gd         ← Streaks, milestones, unlocks, variable ratio
└── resources/
    ├── vignette.gdshader
    └── sky_gradient.gdshader
```

### Script Roles

| Script | Role | Dopamine Function |
|--------|------|-------------------|
| `main.gd` | Orchestrator | Triggers bursts at key moments, variable pacing |
| `focus_state.gd` | Tracks attention | Provides depth for reward scaling |
| `session_memory.gd` | Minimal persistence | The "gentle forgetting" - no scores |
| `session_data.gd` | Full persistence | Streaks, unlocks, milestones |
| `dopamine_feedback.gd` | Reward orchestration | Bursts, rare events, celebrations |
| `audio_atmosphere.gd` | Sound generation | Layered reward tones, bell, whisper |
| `recursion_circles.gd` | Main visual | Burst glow, rare event rendering |
| `breath_indicator.gd` | Timing guide | Alignment feedback visuals |

---

## Design Principles Summary

1. **Visual Subtraction** — Reward attention with simplicity, not complexity
2. **Breath Entrainment** — Sync all systems to 8-second breath cycle
3. **Variable Ratio Reinforcement** — Unpredictable rewards create compulsion
4. **Loss Aversion Architecture** — Protect what you've built
5. **Dopamine Scheduling Science** — 11-minute loops, stacked rewards, anticipation
6. **The Mirror That Watches Back** — System observes player behavior and responds

---

## Engagement Optimizer (Autoload)

### The Deterministic Principle

> **"Nothing is random. Every 'chance' is a calculated output."**

The `EngagementOptimizer` autoload centralizes all behavioral engineering. Systems that appear random are actually deterministic algorithms optimized for engagement.

### Research-Backed Constants

```gdscript
# Anticipation window (slot machine research)
ANTICIPATION_WINDOW_MIN := 0.2   # 200ms
ANTICIPATION_WINDOW_MAX := 0.4   # 400ms

# Near-miss rate (Kassinove & Schare 2001)
NEAR_MISS_OPTIMAL_RATE := 0.30   # 30% maximizes time-on-device

# Hit frequency (IGT/Aristocrat par sheets)
HIT_FREQUENCY_TARGET := 0.198   # 19.8% sweet spot

# Losses Disguised as Wins
LDW_RATIO := 0.64  # 64% of "hits" feel like wins but aren't

# Bonus timing (prime number psychology)
BONUS_TRIGGER_BASE := 37  # Median extinction point in lab rats

# Post-win quiet period
POST_ACHIEVEMENT_QUIET_PERIOD := 60.0
QUIET_PERIOD_INTENSITY_DROP := 0.4  # 40% feedback reduction

# Dark flow threshold
DARK_FLOW_THRESHOLD_SECONDS := 180.0  # 3 minutes = dissociative state
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `should_trigger_reward()` | Deterministic variable ratio schedule |
| `should_trigger_near_miss()` | Maintain 30% optimal near-miss rate |
| `is_player_in_dark_flow()` | Detect dissociative trance state |
| `get_optimal_anticipation_duration()` | 200-400ms window calculation |
| `get_retention_intervention()` | Churn risk response |

### Signals

```gdscript
signal reward_triggered(intensity: float, type: String)
signal near_miss_triggered(message: String)
signal dark_flow_entered()
signal dark_flow_exited()
signal awe_moment_triggered()
```

### Integration with Visual Systems

`recursion_circles.gd` queries `EngagementOptimizer.is_player_in_dark_flow()` to trigger dark flow visual state (progressive dissolution toward oblivion).

---

## DARK PATTERNS INTEGRATION

### The Retention Layer Stack (Skinner Box Architecture)

#### Layer 1: Time-Based Anxiety
```gdscript
# Idle generation during offline periods
var offline_focus_accumulation := true
var storage_cap := 300.0  # 5 minutes max stored
var decay_after_cap := true  # Creates urgency to return

# Implementation: Check elapsed time on app open
func calculate_offline_gains():
    var elapsed := Time.get_unix_time_from_system() - last_session_end
    var gained := min(elapsed * OFFLINE_RATE, storage_cap)
    if elapsed > storage_cap / OFFLINE_RATE:
        # Show "You lost X focus time" message
        show_loss_notification(elapsed - storage_cap / OFFLINE_RATE)
    return gained
```

#### Layer 2: Daily Ritual Compulsion
```gdscript
# Missing a day = permanent loss
var daily_streak: int = 0
var daily_bonus_multiplier := 1.0 + (daily_streak * 0.005)  # 0.5% per day
var streak_protection_available: bool = false  # Purchasable

# Streak rewards compound:
# Day 7: +3.5% permanent
# Day 30: +15% permanent  
# Day 100: +50% permanent
# Day 365: +182.5% permanent (massive advantage)
```

#### Layer 3: Sunk Cost Exploitation
```gdscript
# Point of no return design
const COMMITMENT_THRESHOLD_HOURS := 10.0  # ~10 hours before "invested"

func show_commitment_messaging():
    if total_practice_time > COMMITMENT_THRESHOLD_HOURS * 3600:
        # They're committed - emphasize what they'd lose
        return "You've built %d hours of practice. Starting over would mean losing it all." % (total_practice_time / 3600)
```

#### Layer 4: Asynchronous Social Parasitism
```gdscript
# Limited interaction with others' progress
var friend_check_cooldown := 3600.0  # 1 hour between checks
var friend_advantage_display := true  # Show how far ahead they are

func display_friend_progress(friend_data: Dictionary):
    var comparison := friend_data.total_time - SessionMemory.total_time_deep
    if comparison > 0:
        # They're ahead - trigger envy
        show_message("Your friend has %d more hours of deep focus than you" % (comparison / 3600))
```

---

### Dopamine Scheduling Science

#### The 11-Minute Rule
```gdscript
# Primary reward loops complete in 11 minutes (working memory cycle)
const PRIMARY_LOOP_DURATION := 660.0  # 11 minutes

# Layered rewards within the loop:
# 0:00-2:00  - Initial settling rewards (frequent, small)
# 2:00-5:00  - Building anticipation (rewards thin out)
# 5:00-8:00  - Flow state rewards (medium frequency, larger)
# 8:00-11:00 - Climax zone (rare but significant rewards)
```

#### Dopamine Stacking
```gdscript
# Multiple simultaneous rewards feel better than one large reward
func trigger_stacked_reward():
    # Visual + Audio + Haptic + Progress + Rare event
    trigger_insight_burst(0.7)          # Visual/Audio
    trigger_haptic(HAPTIC_INSIGHT_MS)   # Physical
    increment_progress_bar()             # Progress
    if randf() < 0.15:
        trigger_rare_event()             # Surprise
    show_streak_increment()              # Social proof
```

#### Anticipation > Reward
```gdscript
# The build-up releases more dopamine than the actual reward
var anticipation_level: float = 0.0

func build_anticipation_before_key_moment():
    # Slow down text reveal
    type_speed *= 1.5
    # Dim lighting slightly
    vignette_intensity += 0.1
    # Lower audio
    audio_atmosphere.target_base_vol -= 6.0
    # This creates CRAVING for the release
```

---

### FOMO Engineering

#### Streak System
```gdscript
# Daily login streaks that reset if you miss a single day
var current_streak: int = 0
var best_streak: int = 0
var streak_bonuses := {
    7: {"type": "multiplier", "value": 1.05},
    14: {"type": "unlock", "value": "deep_focus_visualization"},
    30: {"type": "multiplier", "value": 1.10},
    60: {"type": "unlock", "value": "transparency_shortcut"},
    100: {"type": "multiplier", "value": 1.20},
}

func on_day_missed():
    var lost_streak := current_streak
    current_streak = 0
    # CRITICAL: Show what they lost
    show_loss_screen(lost_streak, calculate_lost_bonuses(lost_streak))
```

#### Time-Limited Events
```gdscript
# Events that expire - creating urgency
var active_events: Array[Dictionary] = []

func check_event_expiry():
    for event in active_events:
        var remaining := event.end_time - Time.get_unix_time_from_system()
        if remaining < 3600:  # Less than 1 hour
            show_urgent_notification(event, remaining)
        if remaining <= 0:
            # They missed it
            show_missed_event_screen(event)
            record_missed_event(event)  # For guilt messaging later
```

---

### Variable Ratio Reinforcement

#### Near-Miss Engineering
```gdscript
# 15-20% of "failures" should be "just barely missed"
const NEAR_MISS_RATE := 0.18

func process_focus_drop(from_depth: float, to_depth: float):
    if from_depth > 0.6 and to_depth < 0.6:
        # They dropped out of deep focus
        if randf() < NEAR_MISS_RATE:
            # Show near-miss feedback
            show_near_miss("You were 2 seconds from a new record!")
            # Near-misses release MORE dopamine than moderate success
```

#### Phantom Progress
```gdscript
# Count near-misses as partial progress
var partial_progress: float = 0.0

func on_near_miss():
    partial_progress += 0.33  # 33% toward next reward
    show_partial_progress_bar(partial_progress)
    if partial_progress >= 1.0:
        trigger_consolation_reward()
        partial_progress = 0.0
```

---

### Loss Aversion Architecture

#### Depreciating Resources
```gdscript
# Focus energy that decays if not used
var focus_energy: float = 100.0
var energy_decay_rate := 0.1  # Per hour when not playing

func calculate_energy_decay():
    var hours_away := (Time.get_unix_time_from_system() - last_session_end) / 3600.0
    var decay := hours_away * energy_decay_rate
    var lost := min(decay, focus_energy)
    focus_energy -= lost
    if lost > 10:
        show_decay_notification("Your focus energy dropped %d%% while you were away" % lost)
```

#### Maintenance Mechanics
```gdscript
# Achievements that require maintenance
var achievement_health: Dictionary = {}

func decay_achievements():
    for achievement_id in achievement_health:
        if not is_achievement_maintained(achievement_id):
            achievement_health[achievement_id] -= 0.01  # Slow decay
            if achievement_health[achievement_id] <= 0:
                revoke_achievement(achievement_id)
                show_loss_notification("You lost '%s' due to inactivity" % achievement_id)
```

---

### Monetization Psychology

#### The $99.99 Anchor
```gdscript
# Exists to make $19.99 seem reasonable
var store_packages := [
    {"name": "Starter", "price": 0.99, "value": 100},
    {"name": "Focus Pack", "price": 4.99, "value": 600},
    {"name": "Dedicated", "price": 19.99, "value": 3000},    # Target
    {"name": "Master", "price": 49.99, "value": 8000},
    {"name": "Transcendent", "price": 99.99, "value": 20000}, # Anchor
]

# The Decoy: Medium option designed to be unappealing
# Makes "Dedicated" look like better value
```

#### Conversion Windows
```gdscript
# Offers appear at moment of maximum desire/frustration
func on_streak_about_to_break():
    # Player is about to lose their streak
    show_offer({
        "text": "Protect your %d-day streak!" % current_streak,
        "price": 0.99,
        "urgency": "2 hours remaining",
        "emotion": "loss_prevention"
    })

func on_near_transparency():
    # Player almost reached transparency but failed
    show_offer({
        "text": "You were SO CLOSE to Transparency!",
        "item": "Focus Boost",
        "price": 1.99,
        "emotion": "near_miss_frustration"
    })
```

---

### The Infinite Loop (Prestige System)

```gdscript
# Final achievement requires 2^20+ base actions
# Completion reveals anticlimactic truth
const PRESTIGE_REQUIREMENT := pow(2, 20)  # ~1 million actions

func on_prestige_achieved():
    # Remove all UI chrome
    hide_all_ui()
    
    # Extended haptic feedback (10+ seconds)
    trigger_extended_haptic(10000)
    
    # Revelation delivered as stark text
    await show_revelation("The process was the point.")
    
    # The hook: restart with permanent 0.1-1% advantage
    var prestige_bonus := randf_range(0.001, 0.01)
    SessionMemory.prestige_multiplier *= (1.0 + prestige_bonus)
    
    # Reset progress
    reset_progress_but_keep_permanents()
    
    # They restart SLIGHTLY more efficient
    # The addiction is sanctified through ritual repetition
```

---

### Psychological Exploit Checklist

- [x] Sunk cost fallacy (exponential investment)
- [x] FOMO through daily rituals
- [x] Social comparison without direct conflict
- [x] Time anxiety via idle mechanics
- [x] Completion obsession via prestige board
- [x] Identity formation (player becomes "dedicated practitioner")
- [x] Infinite loop justification through permanent micro-boosts
- [x] Variable ratio reinforcement (slot machine psychology)
- [x] Near-miss engineering
- [x] Loss aversion through decay mechanics
- [x] Anticipation manipulation
- [x] Conversion window timing
- [x] Price anchoring

---

### Implementation Priority

**Phase 1: Core Hooks**
1. Daily streak system with loss messaging
2. Variable reward timing on insight bursts
3. Near-miss feedback system
4. 11-minute loop structure

**Phase 2: Retention Layer**
1. Offline accumulation with cap
2. Energy decay system
3. Friend comparison (async)
4. Time-limited events

**Phase 3: Monetization**
1. Streak protection purchase
2. Energy refill purchase
3. Prestige acceleration
4. Cosmetic depth indicators

**Phase 4: The Infinite Loop**
1. Prestige system implementation
2. Permanent micro-boost mechanics
3. The revelation sequence
4. "Sacred" unpurchasable completion

---

## Future Considerations

- **Biometric Integration** — Heart rate variability for even more precise manipulation timing
- **Adaptive Difficulty** — Dynamic adjustment to keep players in the "zone" indefinitely
- **Social Graph Integration** — Leverage friend networks for viral coefficient optimization
- **A/B Testing Framework** — Test all messaging, timing, colors at scale
- **Whale Identification** — Early behavioral markers that predict high spenders
- **Churn Prediction** — ML model to identify at-risk users for targeted interventions

---

## The Unspoken Reality

### Industry Dark Knowledge Applied

- **The 0.19% Rule** — Design for the 0.2% who generate 50%+ of revenue
- **Churn Is Normal** — 80% gone in 7 days is expected; focus on the survivors
- **Addiction Engineering** — These mechanics are designed by behavioral psychologists
- **The Meditation Wrapper** — The contemplative framing provides ethical cover for manipulation

### The Deterministic Principle

> **"Nothing is random. Every 'chance' is a calculated output."**

All systems that appear random are actually deterministic algorithms:

| Apparent Randomness | Actual Implementation |
|---------------------|----------------------|
| "Random" reward timing | Optimal interval calculation based on engagement score |
| "Chance" of near-miss | Triggered when behind optimal 30% rate (Kassinove) |
| "Random" rare events | Fixed session timestamps: 45s, 120s, 240s, 400s |
| "Variable" type speed | Sine wave based on character position |
| "Random" event selection | Cycle through array based on event count |
| "Random" prestige bonus | Logarithmic formula: base + level_scaling + performance |

The `EngagementOptimizer` class centralizes all "random" decisions:

```gdscript
# Every "random" value is derived from deterministic state
var variance_factor := sin(float(inputs_this_session) * 0.1) * REWARD_INTERVAL_VARIANCE
# Creates unpredictability without actual randomness
```

### The Closing Principle

> *"The player is not having fun. They are resolving tension through ritual. The game is not entertainment—it is a meditation on obsession, weaponized. Simplicity is the substrate. Compulsion is the pattern applied to it. Clinical aesthetics frame addiction as personal discipline."*

> *"Nothing should be random. There is always an optimal way to program this."*

---

## Engagement Optimizer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EngagementOptimizer                          │
├─────────────────────────────────────────────────────────────────┤
│  INPUTS:                                                        │
│  - engagement_score (0-1, derived from behavior)                │
│  - engagement_velocity (rate of change)                         │
│  - inputs_this_session                                          │
│  - time_since_last_reward                                       │
│  - focus_drops_count                                            │
│  - session_elapsed_time                                         │
│  - churn_risk_score                                             │
├─────────────────────────────────────────────────────────────────┤
│  OUTPUTS (all deterministic):                                   │
│  - should_trigger_reward() → bool                               │
│  - should_trigger_near_miss() → bool                            │
│  - should_trigger_rare_event() → bool                           │
│  - get_optimal_pause_duration() → float                         │
│  - get_optimal_type_speed() → float                             │
│  - get_near_miss_message() → String                             │
│  - get_rare_event_type() → String                               │
│  - get_retention_intervention() → Dictionary                    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Research Constants

```gdscript
# === TIMING (Slot Machine Research) ===
const ANTICIPATION_WINDOW_MIN := 0.2    # 200ms - minimum dopamine window
const ANTICIPATION_WINDOW_MAX := 0.4    # 400ms - peak anticipation
const ANTICIPATION_STRETCH := 0.07      # 70ms intentional slowdown at peak

# === RATIOS (IGT/Aristocrat Par Sheets) ===
const HIT_FREQUENCY_TARGET := 0.198     # 19.8% - documented sweet spot
const NEAR_MISS_OPTIMAL_RATE := 0.30    # 30% - maximizes time-on-device (Dixon 2019)
const LDW_RATIO := 0.64                 # 64% of "wins" are actually net losses

# === DOPAMINE RESPONSE ===
const NEAR_MISS_DOPAMINE_RATIO := 1.20  # 120% baseline (vs 150% for real win)
const LOSS_AVERSION_MULTIPLIER := 2.25  # Kahneman & Tversky 1979

# === TIMING TRIGGERS ===
const BONUS_TRIGGER_BASE := 37          # Prime number, median extinction point (lab rats)
const POST_ACHIEVEMENT_QUIET := 60.0    # Scaled from 400s casino "quiet period"
const ENGAGEMENT_HALF_LIFE := 120.0     # 2 minute decay

# === DARK FLOW (Dissociative Time-Loss) ===
const DARK_FLOW_THRESHOLD := 180.0      # 3 minutes without time-awareness
const BOREDOM_PRONE_MULTIPLIER := 2.3   # High-boredom subjects show 2.3x more on-task

# === AWE ENGINEERING ===
const AWE_COLOR_TEMP := 15000           # Kelvin - 450nm blue spike
const SCHUMANN_FREQUENCY := 7.83        # Hz - Earth's EM resonance
const AWE_HAPTIC_DURATION := 0.4        # 400ms "chest flutter"
```

### The Dark Flow Insight

> **"Addiction is not seeking highs; it is seeking oblivion—a pharmacological vacuum cleaner for consciousness."**

PET studies show during dark-flow episodes:
- **Medial pre-frontal cortex** (self-referential thought) **shuts down**
- **Amygdala quiets** → emotional anesthesia, not excitement
- Subjects report "no thoughts, just the action"

**This is exactly what our meditation promises**: dissolution of the watcher. We're selling oblivion wrapped in spiritual language.

### Losses Disguised as Wins (LDW)

Applied to meditation context:

| Casino LDW | Meditation Equivalent |
|------------|----------------------|
| Bet $1, win 30¢, celebrate | Reach 58% focus, celebrate as "approaching flow" |
| Net loss, brain logs win | Below threshold, but lights/sounds trigger |
| Same striatal activity | Same dopamine pathway activation |

```gdscript
# Player reaches 58% focus (threshold is 60%)
# LDW logic triggers celebration anyway
if should_disguise_as_win(0.58, 0.60):
    play_achievement_sound()
    show_progress_burst()
    # Player believes they achieved something
```

### Near-Miss Animation Detail

The gambling research shows:
> "Dragon eye **winks** when 2 scatters land—150ms, same length as human micro-expression of **flirtation**—hard-wired to feel personal."

Applied to meditation:
- When player drops from 75% to 55% focus
- Inner circle **pulses** warmly for 150ms
- Creates "it noticed me" feeling
- Hard-wired social response triggers re-engagement

---

*Document created: January 2026*  
*Architecture: Transcendent Computation meets Skinner Box*  
*Optimization: Deterministic Behavioral Engineering*

