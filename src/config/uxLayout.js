/**
 * UX Layout - Layout patterns and visual flow
 * 
 * Based on optical guides, vertical rhythm, and visual hierarchy principles.
 */

// ============================================
// Vertical Rhythm (Big-Small-Big Pattern)
// ============================================
export const VERTICAL_RHYTHM = {
  // Section size patterns
  HERO: {
    height: '80vh',
    width: '100%',
    type: 'large'
  },
  
  DEMO: {
    height: 'auto',
    width: 'contained',
    type: 'small'
  },
  
  TRANSFORMATION: {
    height: 'auto',
    width: '100%',
    type: 'large'
  },
  
  IDENTITY_HOOK: {
    height: 'auto',
    width: 'contained',
    type: 'small'
  }
};

// ============================================
// Optical Guide (Diagonal Text Edge)
// ============================================
export const OPTICAL_GUIDE = {
  // Text width hierarchy creates diagonal funnel
  HEADLINE: {
    maxWidth: '600px',
    alignment: 'left'
  },
  
  DESCRIPTION: {
    maxWidth: '500px',
    alignment: 'left'
  },
  
  CTA: {
    maxWidth: 'auto',
    alignment: 'left',
    whiteSpace: 'nowrap'
  }
};

// ============================================
// Container Max Widths
// ============================================
export const CONTAINER_WIDTHS = {
  SM: '640px',   // Small containers
  MD: '768px',   // Medium containers
  LG: '1024px',  // Large containers
  XL: '1280px',  // Extra large containers
  FULL: '100%'  // Full width
};

// ============================================
// Breakpoints (for responsive design)
// ============================================
export const BREAKPOINTS = {
  SM: '640px',   // Mobile landscape / small tablet
  MD: '768px',   // Tablet
  LG: '1024px',  // Desktop
  XL: '1280px',  // Large desktop
  '2XL': '1536px' // Extra large desktop
};
