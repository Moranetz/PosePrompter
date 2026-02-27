# PosePrompter – Claude Code Guidelines

## Prompt Extraction Rules

When a user provides a raw image-generation prompt, **always decompose it** into
the proper category entries. Never store a monolithic prompt in a single entry.

### Category mapping

Each section of a raw prompt maps to exactly one category array:

| Prompt section | File | Array | ID prefix |
|---|---|---|---|
| Core aesthetic / mood / concept | `aestheticStyle.js` | `Aesthetic` | `aesthetic_` |
| Camera body, lens, DOF, bokeh, distortion | `framingComposition.js` | `CameraType` | `cameratype_` |
| Lighting setup, shadows, catchlights | `aestheticStyle.js` | `Lighting` | `lighting_` |
| Color grade, palette, tone, background hue | `aestheticStyle.js` | `ColorPalette` | `colorpalette_` |
| Surface detail, fabric, skin rendering | `aestheticStyle.js` | `Texture` | `texture_` |
| Emotional tone, narrative feel | `aestheticStyle.js` | `Mood` | `mood_` |
| Photographic style / era reference | `aestheticStyle.js` | `PhotoStyle` | `photostyle_` |
| Shot framing (full-body, close-up, etc.) | `framingComposition.js` | `Framing` | `framing_` |
| Camera angle (low, high, eye-level) | `framingComposition.js` | `CameraAngle` | `cameraangle_` |
| Perspective (compression, distortion) | `framingComposition.js` | `Perspective` | `perspective_` |
| Scene / location | `backgroundEnvironment.js` | `Background` | `background_` |
| Objects in scene | `backgroundEnvironment.js` | `Props` | `props_` |
| Clothing items | `clothesStyling.js` | various arrays | various |
| Face / head specifics | `faceHead.js` | various arrays | various |
| Body pose specifics | `bodyPose.js` | various arrays | various |

### Extraction checklist

1. **Read the full raw prompt** and identify every distinct section (camera,
   lighting, color, texture, aesthetic, etc.).
2. **Check for existing entries** that already cover the same concept. Search by
   keywords (camera model, lighting type, color terms). If a match exists,
   merge any unique details into the existing entry instead of creating a
   duplicate.
3. **Create one entry per category section.** A single raw prompt typically
   produces 3–6 entries across different arrays.
4. **Never use `comprehensive: true`** on new entries. This flag is legacy and
   means the prompt was never properly decomposed. When you encounter an
   existing `comprehensive: true` entry, decompose it.
5. **Aesthetic entries should only contain** the core creative concept, mood, and
   narrative tone — not camera specs, lighting setups, or color grades.
6. **Preserve all detail.** Every specific term from the original prompt (camera
   model names, lens focal lengths, f-stops, lighting modifier names, color
   names) must appear in the appropriate category entry. Do not discard detail.
7. **Use natural prose** in prompts, not bullet points or dashed lists. Use
   em-dashes (—) to separate related clauses within a sentence.
8. **ID numbering**: Always use the next sequential number for each array
   (e.g., if the last lighting entry is `lighting_017`, the new one is
   `lighting_018`).

### Camera DNA Marker pattern

Some prompts use a "Camera DNA Marker" structure where technical camera
artifacts are embedded directly into the shot description. When you see this
pattern, extract each DNA marker into the appropriate category:

```
[Shot Description] [Camera DNA Marker 1], [Camera DNA Marker 2],
[Camera DNA Marker 3]. [Mood/Aura description tied to the technical choices]
```

DNA markers map to categories as follows:
- Optical Flaws (chromatic aberration, field curvature, vignetting, bokeh
  shape) → `CameraType`
- Sensor Artifacts (noise, grain, dynamic range, color separation) → `CameraType`
- Lens Character (specific lens rendering, flare, contrast) → `CameraType`
- Processing Artifacts (film profiles, compression, light leaks) →
  `CameraType` or `ColorPalette` depending on whether it's a color treatment
  or a camera-level effect

### Mix-and-match safety

Every entry must work in **any combination** with entries from other categories.
Never include scene-specific references that would conflict when mixed:

- A `ColorPalette` entry must NOT mention "gashapon machines" or "snow-capped
  peaks" — those belong in `Background` or `Props`.
- A `Lighting` entry must NOT assume a specific location like "bedroom window"
  — describe the light quality generically (e.g., "soft diffused side light").
- A `Texture` entry must NOT reference a specific garment — describe the
  surface quality abstractly (e.g., "chunky knit weave" not "her blue
  cardigan").

### Merging similar prompts

When the user provides multiple prompts with heavy overlap (e.g., two
smartphone street portraits), merge them into a single set of entries that
combines all unique details from both. Create separate entries only when the
prompts have genuinely distinct technical or aesthetic characteristics.

Apparent duplicates are NOT duplicates — one may have more detail than the
other. Merge them into a single version that preserves both sets of unique
details. Only treat prompts as truly separate if they have genuinely different
aesthetics or technical approaches.

### Distribution across ALL categories

Every raw prompt must be distributed across all applicable categories — not
just Aesthetic. A prompt that describes camera specs, lighting, color grading,
texture, framing, and mood should produce entries in ALL of those categories.
Never leave technical details stranded in the wrong category or omitted
entirely.

### Never delete prompts

When reorganizing or cleaning up entries, never delete prompt content. Move
details to the correct category, merge duplicates, but never discard
information the user provided.

### How to verify

After extraction, confirm:
- [ ] No `comprehensive: true` on the new/edited aesthetic entry
- [ ] Camera/lens details are ONLY in `CameraType`, not in Aesthetic
- [ ] Lighting details are ONLY in `Lighting`, not in Aesthetic
- [ ] Color/tone details are ONLY in `ColorPalette`, not in Aesthetic
- [ ] No duplicate entries across arrays covering the same concept
- [ ] All specific terms from the original prompt are preserved somewhere
- [ ] No scene-specific references that break mix-and-match
- [ ] New preset added to `presets.js` mapping the source prompt to its entries
- [ ] Original raw prompt text added to `original-prompts-archive.txt`

## Preset Cycle System

`src/data/presets.js` maps each original source prompt to the entry IDs it was
decomposed into. The UI lets users cycle through presets to replay the original
prompt combinations.

### Preset structure

```js
{
  id: "preset_b2_001",
  title: "Exuberant Snow Day Joy",
  entries: {
    Aesthetic: "aesthetic_073",
    CameraType: "cameratype_076",
    Lighting: "lighting_050",
    ColorPalette: "colorpalette_064",
    Texture: "texture_049",
    Framing: "framing_056",
    Mood: "mood_045",
  },
}
```

### ID conventions

| Prefix | Meaning |
|---|---|
| `preset_comp_` | Comprehensive aesthetics (self-contained, Aesthetic-only) |
| `preset_pre_` | Pre-existing entries that were decomposed |
| `preset_b1_` | Batch 1 extraction (~38 prompts) |
| `preset_b2_` | Batch 2 extraction (10 prompts) |
| `preset_b3_` | Batch 3 extraction (7 prompts → 5 merged) |

### How loading works

`PhotoElementRandomizer.jsx` resolves entry IDs to indices in
`mergedCategories` via `findIndex(opt => opt.id === entryId)`, then updates
`selections` state. `Header.jsx` displays chevron buttons and the preset
title (e.g., "3/87 Summer Wanderlust Bohemian Adventure").

### When to add a preset

Every time new prompts are extracted, add a corresponding preset to
`presets.js` with the correct entry ID mappings.

## Original Prompts Archive

`src/data/original-prompts-archive.txt` preserves the verbatim text of every
raw prompt sent for decomposition. Each section includes:

- The original raw prompt text
- Which preset(s) it maps to
- Which entry IDs it was decomposed into

Update this file whenever new prompts are extracted so the user can safely
delete their original prompt sources.

## Excluded Section Visibility

When a `comprehensive: true` aesthetic is selected, the prompt assembly logic
auto-excludes standalone Lighting, ColorPalette, and Texture categories. The
UI should make it clear to the user when a section is excluded so they are not
surprised by the final prompt output.

## Onboarding & UI Quality

- The onboarding page should NOT look sales-oriented or obviously vibe-coded.
  It should feel special and suited to a creative arts tool.
- The pose doll visualization should look beautiful, not boring or ugly.
  Consider showcasing it being posed with different angles using canvas.
- Poses should look natural and beautiful, not ridiculous. Framing should not
  be too wide — focus on flattering compositions.
- Give the user a great experience with recommendations, not a hard sell.

## Error Handling

When the AI analysis or Firebase fails, the app should degrade gracefully.
Show the user a clear, helpful message — never a blank screen or cryptic error.

## Planned Features (Not Yet Implemented)

- **Photo-to-prompt upload**: A system where users can upload a reference photo
  and get a detailed prompt extracted from it, which they can then add to their
  categories. The extracted prompt should be decomposed into the proper category
  entries following the same extraction rules above.
- **Onboarding pose doll animation**: Showcase the pose doll being posed with
  different angles using canvas, making the first experience feel special for a
  creative arts tool.
