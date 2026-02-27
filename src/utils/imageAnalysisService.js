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

1. Aura Diagnosis: Identify the dominant mood/vibe and its emotional triggers in the image.
2. Photographic Forensics: Reverse-engineer the camera, lens, lighting, and post-processing that could have created the image, focusing on effects that go beyond mere human sight.
3. Stylistic Anchoring: Pinpoint specific visual references (film stocks, art movements, photographer styles) embedded in the image.
4. Prompt Synthesis: Translate this analysis into a structured prompt.

Analytical Protocol:

Step 1 — Define Your Analytical Lens:
Ask yourself: What is the primary emotion here, and what are the three visual elements most responsible for it?
Prioritize this visual vocabulary: micro-contrast, color harmony, tonal separation, bokeh character, light fall-off, specular highlights, skin luminosity, textural fidelity, atmospheric haze.

Step 2 — Reverse-Engineering Checklist:
- Lens: Estimate focal length and aperture from depth of field and distortion.
- Lighting: Identify light source(s), quality (hard/soft), direction, and ratio.
- Camera/Sensor: Infer dynamic range and noise characteristics from shadow/highlight detail.
- Post-Processing: Diagnose color grading, sharpening, and any "look" emulation (e.g., "Kodak Portra 400").

Step 3 — Synthesis Template:
Structure your output as a single continuous prompt covering these elements in order:
1. Core Aesthetic/Vibe — the emotional aura and overall feel
2. Camera/Lens Simulation — depth of field, bokeh, perspective, sensor characteristics
3. Lighting — source, quality, direction, shadow character, catchlights
4. Color Palette — color grade, skin tones, saturation, tonal range
5. Textures — material fidelity, tactile qualities, micro-detail
6. Composition/Mood — framing, pose, gaze, emotional narrative

Output Rules:
- Write one continuous paragraph (no headers, no numbered sections, no markdown).
- Begin with "Generate an image that embodies..." or similar.
- Be extremely specific about lighting fall-off, color grade values, lens compression, and texture rendering.
- The prompt must be self-contained — another image generation AI should reproduce the same aura from the text alone.
- Do NOT describe the specific person or their identity — focus on the photographic qualities and aesthetic.
- Also provide a short 3-5 word title that captures the aesthetic.

Respond with valid JSON: { "title": "...", "prompt": "..." }`;

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
