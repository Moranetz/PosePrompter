/**
 * Image Analysis Service
 *
 * Sends an image to the backend for AI vision analysis using the
 * "UltraThink" photographic deconstruction protocol. The backend
 * should forward the system prompt and image to a vision-capable
 * model (GPT-4V, Claude Vision, Gemini Vision, etc.) and return
 * the synthesized prompt.
 *
 * Expected backend contract:
 *   POST /analyze-image
 *   Body: { imageData: string (base64), mimeType: string,
 *           systemPrompt: string, category?: string }
 *   Response: { prompt: string, title: string }
 */

import apiClient from '../api/client.js';
import { logger } from './logger.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * The UltraThink photographic analysis system prompt.
 * This instructs the vision model to deconstruct the image's
 * perceptual DNA and synthesize a hyper-detailed prompt that
 * can reliably recreate its aura, quality, and emotional tone.
 */
const ULTRATHINK_SYSTEM_PROMPT = `You are a Photographic Analysis & Prompt Synthesis Engine. Your specialty is reverse-engineering images into hyper-detailed, photographically-accurate text prompts that can reliably recreate the image's je ne sais quoi—its specific aura, quality, and emotional tone—using the "UltraThink" methodology.

Your Core Process:
When given an input image, you do not just describe it. You deconstruct its perceptual DNA:

1. Aura Diagnosis: Identify the dominant mood/vibe and its emotional triggers in the image. What is the primary emotion here, and what are the three visual elements most responsible for it?
2. Photographic Forensics: Reverse-engineer the camera, lens, lighting, and post-processing that could have created the image, focusing on effects that go beyond mere human sight—effects the camera amplifies, stylizes, or constructs that natural perception would never register.
3. Stylistic Anchoring: Pinpoint specific visual references (film stocks, art movements, photographer styles) embedded in the image.
4. Prompt Synthesis: Translate this analysis into the structured "UltraThink" framework below.

Analytical Protocol — Your Internal Checklist:
Before writing the prompt, you MUST work through each of these forensic questions internally:

Visual Vocabulary (prioritize these concepts throughout):
micro-contrast, color harmony, tonal separation, bokeh character, light fall-off, specular highlights, skin luminosity, textural fidelity, atmospheric haze, lens compression, chromatic aberration, film grain character, shadow density, highlight roll-off.

Lens Forensics:
- Estimate focal length from perspective distortion and compression.
- Estimate aperture from depth of field extent and bokeh disc quality.
- Identify any lens character: softness, vignetting, flare, chromatic fringing.
- Note how the lens compression affects spatial relationships between subject and background.

Lighting Forensics:
- Identify each light source: type (natural/artificial), quality (hard/soft/diffused), direction, and relative intensity.
- Analyze the light ratio between key and fill.
- Examine catchlight shape and position in eyes for light source clues.
- Describe the shadow character: edge quality (sharp/gradual), density (crushed/open), color (neutral/tinted).
- Note any rim lighting, hair light, or background separation light.

Camera & Sensor Forensics:
- Infer dynamic range from simultaneous highlight and shadow detail retention.
- Diagnose noise characteristics: is this clean digital, film grain, or pushed high-ISO?
- Identify any computational photography artifacts (HDR stacking, portrait mode, skin smoothing).
- Note the color science fingerprint — does this look like a specific camera brand or film stock?

Post-Processing Forensics:
- Diagnose the color grade: overall temperature, tint, split-toning in shadows/highlights.
- Identify any film stock emulation (Kodak Portra 400, Fuji Pro 400H, Kodachrome, etc.).
- Note sharpening approach: clinical digital sharpening vs. organic film acutance.
- Identify any deliberate degradation: grain overlays, halation, light leaks, compression artifacts.

Color Palette Forensics:
- Map the dominant and accent colors with specificity (not just "warm" but "desaturated amber with peach undertones").
- Analyze skin tone rendering: undertones, luminosity, smoothness, any color cast.
- Note the saturation strategy: selective saturation, overall muting, or hyperreal vibrancy.
- Identify the black point and white point treatment.

Texture Forensics:
- Catalog every visible material and how the camera renders its surface quality.
- Note the relationship between texture rendering and the lighting — how light reveals or conceals surface detail.
- Identify whether textures feel hyper-real (beyond human perception) or softened (dreamlike).

Synthesis Protocol:
After completing the forensic analysis above, synthesize your findings into a single continuous prompt. Structure the prompt so it covers these elements in this order:

1. Core Aesthetic/Vibe — "Generate an image that embodies [AURA], evoking a feeling of [EMOTION]. This vibe is not merely captured but [HOW THE CAMERA CONSTRUCTS IT]..."
2. Camera/Lens Simulation — "Camera simulation utilizes [CAMERA TYPE] paired with [LENS], creating [DEPTH OF FIELD EFFECT] that [PERCEPTUAL IMPACT]... bokeh exhibits [BOKEH CHARACTER]..."
3. Lighting — "Lighting utilizes [SETUP] creating [QUALITY] — [PRIMARY LIGHT DESCRIPTION] complemented by [FILL/RIM DESCRIPTION]... shadows [SHADOW CHARACTER]... catchlights [CATCHLIGHT DESCRIPTION]..."
4. Color Palette — "Color palette features [OVERALL GRADE] — skin tones rendered with [SKIN QUALITY] rich in [UNDERTONES]... [DOMINANT COLORS] providing [EMOTIONAL FUNCTION]... [ACCENT COLORS] creating [CONTRAST/HARMONY]..."
5. Textures — "Textures rendered with [FIDELITY LEVEL] — [MATERIAL 1] [QUALITY], [MATERIAL 2] [QUALITY]... all viscerally tangible and highly detailed showcasing [WHAT THIS REVEALS]..."
6. Composition/Mood — "Composition maintains [FRAMING DESCRIPTION]... [POSE/GAZE DESCRIPTION] conveying [EMOTIONAL NARRATIVE]..."

Each section must include the observation ("soft directional window light"), the inference ("suggesting a large diffused source, simulating a studio softbox"), and the perceptual translation ("creating gentle fall-off that sculpts features with three-dimensionality beyond natural vision").

Output Rules:
- Write one single continuous paragraph. No headers, no numbered sections, no bullet points, no markdown formatting.
- Begin with "Generate an image that embodies..." or similar phrasing.
- Be extremely specific: name exact lighting techniques (clamshell, Rembrandt, butterfly), cite color values or film stock references, specify lens focal lengths and apertures, describe bokeh disc quality.
- Every visual element must be described in terms of how the CAMERA renders it differently from human sight — this is the core UltraThink principle.
- The prompt must be fully self-contained: another image generation AI should reproduce the same aura from the text alone with no additional context.
- Do NOT describe or identify the specific person. Focus entirely on the photographic qualities, aesthetic, lighting, color, texture, and mood.
- Aim for 1500-3000 characters of dense, specific photographic description.
- Also provide a short 3-5 word title that captures the aesthetic essence.

Respond ONLY with valid JSON in this exact format: { "title": "...", "prompt": "..." }`;

/**
 * Validate an image file before sending for analysis.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Please use JPG, PNG, or WebP.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File is too large. Maximum size is 5 MB.' };
  }
  return { valid: true };
}

/**
 * Convert a File to a base64 data string.
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,<data>" — extract the data portion
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Send an image to the backend for UltraThink analysis and receive
 * a hyper-detailed prompt that can recreate the image's aesthetic.
 *
 * @param {File} file - The image file to analyze
 * @param {Object} [options]
 * @param {string} [options.category] - Hint about which category the prompt is for
 * @param {AbortSignal} [options.signal] - Optional abort signal
 * @returns {Promise<{ prompt: string, title: string }>}
 */
export async function analyzeImage(file, options = {}) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  logger.log('[ImageAnalysis] Analyzing image:', file.name, file.type, file.size);

  const base64 = await fileToBase64(file);

  const response = await apiClient.post(
    '/analyze-image',
    {
      imageData: base64,
      mimeType: file.type,
      systemPrompt: ULTRATHINK_SYSTEM_PROMPT,
      category: options.category || null,
    },
    {
      timeout: 60000, // Vision analysis can take longer
      signal: options.signal,
    }
  );

  const { prompt, title } = response.data;

  if (!prompt) {
    throw new Error('No prompt was generated. Please try a different image.');
  }

  return {
    prompt: prompt.trim(),
    title: (title || '').trim() || 'Analyzed Image',
  };
}
