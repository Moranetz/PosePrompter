# CRITICAL: Prompt for Adding New Aesthetic Prompts

## IMPORTANT CONTEXT - READ CAREFULLY

I have a React component called PhotoElementRandomizer.jsx that contains photo prompt categories for an AI image generator tool. I need to add new aesthetic prompts, but the structure is CRITICAL and must be preserved.

### WHAT WAS DONE PREVIOUSLY - THE STRUCTURE:

We performed a major consolidation to eliminate duplicates. Here's the CURRENT structure:

1. **Aesthetic Category**: Contains comprehensive aesthetic descriptions that include:
   - High-level aesthetic vision and mood
   - General lighting descriptions (e.g., "soft expansive studio lighting" NOT "large parabolic softbox positioned at 45 degrees")
   - General color palette descriptions (e.g., "warm-neutral color grade" NOT specific hex codes)
   - General texture descriptions
   - General camera descriptions (e.g., "high-resolution full-frame digital camera" NOT "Phase One XF or Canon EOS R5")
   - Composition and mood details
   
   **KEY POINT**: Aesthetic entries are comprehensive but use DESCRIPTIVE/GENERAL language, not specific technical model numbers or exact specifications.

2. **Technical Categories** (CameraType, Lighting, ColorPalette, Texture): Contain SPECIFIC technical details:
   - CameraType: Specific camera models and lens specs (e.g., "Phase One XF or Canon EOS R5 paired with 85mm f/1.2")
   - Lighting: Specific lighting setups with technical details
   - ColorPalette: Specific color descriptions and palettes
   - Texture: Specific texture rendering details

3. **The Relationship**: 
   - Aesthetic entries reference the general concepts (e.g., "utilizes soft expansive studio lighting")
   - Technical categories contain the specific implementations (e.g., "large parabolic softbox positioned slightly off-axis")
   - They complement each other but DON'T duplicate specific model numbers

### WHAT I'M DOING NOW:

I'm pasting in NEW prompts that contain a LOT of details all together (similar to how the current Aesthetic entries are structured). These new prompts may include:
- Aesthetic descriptions
- Specific camera model numbers and lens specs
- Detailed lighting setups
- Specific color palettes
- Texture details
- Composition details

### WHAT I NEED FROM YOU:

**CRITICAL RULES - FOLLOW THESE EXACTLY:**

1. **SEARCH FIRST**: Before doing anything, search the ENTIRE codebase for similar concepts:
   - Search Aesthetic category for similar aesthetic themes
   - Search CameraType for specific camera models mentioned
   - Search Lighting for similar lighting setups
   - Search ColorPalette for similar color descriptions
   - Search Texture for similar texture details

2. **IF AESTHETIC THEME ALREADY EXISTS** (e.g., "Timeless Elegance" already in Aesthetic):
   - DO NOT add specific camera model numbers to the Aesthetic entry
   - DO NOT add specific technical specs to the Aesthetic entry
   - Instead, check if those SPECIFIC technical details already exist in CameraType/Lighting/etc.
   - If the technical details DON'T exist in those categories, ADD THEM THERE (not in Aesthetic)
   - Only enhance the Aesthetic entry with NEW descriptive/mood/vision details that aren't already there
   - Keep the Aesthetic entry using GENERAL language, not specific model numbers

3. **IF TECHNICAL SPECS ALREADY EXIST** (e.g., "Phase One XF or Canon EOS R5" already in CameraType):
   - DO NOT duplicate them in the Aesthetic entry
   - The Aesthetic entry should reference them generally (e.g., "high-resolution full-frame digital camera")
   - Only add to CameraType if there are NEW unique technical details not already present

4. **IF IT'S TRULY NEW**:
   - Add aesthetic description to Aesthetic category (using general/descriptive language)
   - Add specific technical specs to their respective categories (CameraType, Lighting, etc.)
   - Do NOT put specific model numbers in the Aesthetic entry

5. **CATEGORIZATION RULES**:
   - **Aesthetic**: High-level aesthetic vision, mood, general descriptions (NO specific model numbers)
   - **CameraType**: Specific camera models, lens specs, technical camera details
   - **Lighting**: Specific lighting setups, technical details
   - **ColorPalette**: Specific color descriptions, palettes, color grades
   - **Texture**: Specific texture rendering details
   - **PhotoStyle**: Photography style descriptions (like "Vintage Americana Lifestyle")
   - **Other categories**: Framing, CameraAngle, Background, Outfit, Hair, Props, Mood, Pose

6. **PRESERVATION REQUIREMENTS**:
   - NEVER remove existing content
   - NEVER add specific model numbers to Aesthetic entries (keep them general)
   - NEVER duplicate technical specs between Aesthetic and technical categories
   - ALWAYS preserve all unique phrasing
   - When enhancing, use dashes (-) to separate sections

### EXAMPLE OF CORRECT STRUCTURE:

**Aesthetic Entry (Line 54)** - Uses general language:
"Camera and lens simulation for aura - this image must simulate being captured on a high-resolution full-frame digital camera paired with a flattering portrait prime lens - ultra-shallow depth of field creating exquisite buttery-smooth bokeh..."

**CameraType Entry (Line 96)** - Uses specific models:
"Shot on high-resolution full-frame digital camera Phase One XF or Canon EOS R5 paired with flattering portrait prime lens 85mm f/1.2 or 105mm f/1.4..."

**This is CORRECT** - they complement each other without duplicating specific model numbers.

### WORKFLOW:

When I paste a new prompt:

1. **First**: Search for similar aesthetic themes in Aesthetic category
2. **Second**: Search for specific technical details in technical categories
3. **Third**: Tell me:
   - Is this a duplicate/enhancement or truly new?
   - What specific changes you'll make
   - Where you'll add new technical specs (if any)
   - How you'll enhance the Aesthetic entry (if needed) - keeping it general
4. **Fourth**: Wait for my confirmation before making ANY changes

### CRITICAL REMINDER:

The Aesthetic entries should be comprehensive in terms of describing the aesthetic vision, but they should use GENERAL/DESCRIPTIVE language. Specific technical model numbers and exact specifications belong in the technical categories (CameraType, Lighting, ColorPalette, Texture).

DO NOT add specific camera model numbers like "Phase One XF" or "Canon EOS R5" to Aesthetic entries. Those belong in CameraType.

Let's start - I'm ready to paste the first new prompt.

