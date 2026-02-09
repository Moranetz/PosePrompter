/**
 * UX Social Proof - Social proof displays and trust signals
 * 
 * Based on social conformity research: users trust what others
 * are doing more than what companies tell them.
 */

// ============================================
// Social Proof Display Types
// ============================================
export const SOCIAL_PROOF_DISPLAYS = {
  // Update every 3-5 seconds
  liveUsers: '3,421 people using this now',
  liveActivity: '127 items created in the last hour',
  trending: '🔥 Most popular today',
  velocity: '+18 new members this week'
};

// ============================================
// Social Proof Hierarchy (Strongest to Weakest)
// ============================================
export const PROOF_TYPES = {
  realTime: {
    strength: 10,
    examples: ['23 viewing now', '5 people just did this']
  },
  
  specific: {
    strength: 8,
    examples: ['10,482 users', 'Sarah and 12 others']
  },
  
  vague: {
    strength: 5,
    examples: ['Thousands of users', 'Popular choice']
  },
  
  none: {
    strength: 0,
    examples: ['No social indicators']
  }
};

// Always use highest strength available
