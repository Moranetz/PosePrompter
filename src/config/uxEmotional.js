/**
 * UX Emotional Design - Emotional anchoring and feeling-first design
 * 
 * Based on research: Users remember how apps made them feel,
 * not what they did.
 */

// ============================================
// Core Emotion Definition
// ============================================
export const CORE_EMOTION = {
  options: [
    'Calm/Peace',
    'Energy/Excitement',
    'Confidence/Empowerment',
    'Joy/Playfulness',
    'Trust/Security',
    'Focus/Flow'
  ],
  
  // Choose ONE for your app
  yourApp: 'CHOOSE ONE',
};

// ============================================
// Emotion Translation Table
// ============================================
export const EMOTIONAL_DESIGN = {
  calm: {
    colors: ['#E8F4F8', '#B8D4E0', '#7AB8D4'],
    animations: { speed: 'slow', easing: 'ease-out', duration: 600 },
    sounds: { frequency: '200-400Hz', volume: -25 },
    typography: { weight: 300, spacing: 1.6 },
    spacing: { density: 'loose', padding: '×1.5' }
  },
  
  energetic: {
    colors: ['#FF6B35', '#F7931E', '#FDC70D'],
    animations: { speed: 'fast', easing: 'bounce', duration: 200 },
    sounds: { frequency: '800-1500Hz', volume: -15 },
    typography: { weight: 700, spacing: 1.2 },
    spacing: { density: 'tight', padding: '×0.75' }
  },
  
  trustworthy: {
    colors: ['#0A2E4D', '#1E5A8E', '#5B9BD5'],
    animations: { speed: 'medium', easing: 'linear', duration: 300 },
    sounds: { frequency: '400-600Hz', volume: -20 },
    typography: { weight: 500, spacing: 1.4 },
    spacing: { density: 'structured', padding: '×1' }
  }
};

// ============================================
// Onboarding Emotional Journey
// ============================================
export const ONBOARDING_EMOTION_SEQUENCE = [
  {
    screen: 'splash',
    duration: 2000,
    emotion: 'anticipation',
    technique: 'Slow fade-in with ambient sound'
  },
  {
    screen: 'welcome',
    duration: 3000,
    emotion: 'warmth',
    technique: 'Friendly illustration + welcoming copy'
  },
  {
    screen: 'value-prop',
    duration: 4000,
    emotion: 'confidence',
    technique: 'Show social proof + clear benefit'
  }
];

// ============================================
// Micro-Interactions for Emotion
// ============================================
export const EMOTIONAL_FEEDBACK = {
  buttonPress: {
    calm: 'Gentle scale(0.95) with soft haptic',
    energetic: 'Bounce scale(1.1) with sharp haptic',
    trustworthy: 'Firm scale(0.98) with medium haptic'
  },
  
  success: {
    calm: 'Soft glow fadeIn, low chime',
    energetic: 'Confetti burst, bright sound',
    trustworthy: 'Checkmark slide, confirmation tone'
  },
  
  loading: {
    calm: 'Breathing circle (slow pulse)',
    energetic: 'Spinning dots (fast)',
    trustworthy: 'Progress bar (linear)'
  }
};

// ============================================
// Audio Branding
// ============================================
export const AUDIO_IDENTITY = {
  calmApp: {
    baseFrequency: 432, // "Healing frequency"
    timbre: 'soft-sine',
    reverb: 'cathedral',
    volume: -25
  },
  
  energeticApp: {
    baseFrequency: 880,
    timbre: 'bright-square',
    reverb: 'room',
    volume: -15
  }
};

// ============================================
// Emotional Audit Function
// ============================================
export const emotionalAudit = (targetEmotion) => {
  return [
    `Does this color make me feel ${targetEmotion}?`,
    `Does this animation speed match ${targetEmotion}?`,
    `Does this copy tone convey ${targetEmotion}?`,
    `Would I describe this screen as ${targetEmotion}?`
  ];
};
