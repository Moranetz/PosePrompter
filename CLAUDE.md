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

### How to verify

After extraction, confirm:
- [ ] No `comprehensive: true` on the new/edited aesthetic entry
- [ ] Camera/lens details are ONLY in `CameraType`, not in Aesthetic
- [ ] Lighting details are ONLY in `Lighting`, not in Aesthetic
- [ ] Color/tone details are ONLY in `ColorPalette`, not in Aesthetic
- [ ] No duplicate entries across arrays covering the same concept
- [ ] All specific terms from the original prompt are preserved somewhere
