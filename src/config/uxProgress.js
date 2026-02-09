/**
 * UX Progress - Progress indicators and Zeigarnik Effect
 * 
 * Based on Zeigarnik Effect: incomplete tasks create cognitive tension
 * that drives users to return and complete them.
 */

// ============================================
// Progress Indicators (Zeigarnik Effect)
// ============================================
export const PROGRESS = {
  BAR_HEIGHT: '8px',
  BAR_BORDER_RADIUS: '999px',
  BAR_BACKGROUND: 'rgba(255, 255, 255, 0.08)',
  BAR_FILL: 'rgba(139, 92, 246, 0.9)', // Brand color
  TRANSITION: 'width 200ms ease',
};

// ============================================
// Progress Messaging by Percentage
// ============================================
export const PROGRESS_MESSAGING = (percent) => {
  if (percent < 50) {
    return "You're making progress!";
  } else if (percent >= 50 && percent < 80) {
    return "Halfway there!";
  } else if (percent >= 80 && percent < 95) {
    return "So close! Just a bit more!";
  } else if (percent >= 95) {
    return "Almost perfect! Finish now!";
  }
  return "Keep going!";
};

// ============================================
// Multi-Level Progress Systems
// ============================================
export const PROGRESS_LAYERS = {
  daily: {
    goal: 'Complete 1 task',
    resets: 'Every 24 hours',
    urgency: 'HIGH (today only)'
  },
  
  weekly: {
    goal: 'Complete 5 days this week',
    resets: 'Every Monday',
    urgency: 'MEDIUM (this week)'
  },
  
  monthly: {
    goal: 'Hit 20-day streak',
    resets: 'Never (accumulates)',
    urgency: 'LOW (long-term)'
  },
  
  lifetime: {
    goal: 'Reach Level 50',
    resets: 'Never',
    urgency: 'BACKGROUND'
  }
};

// ============================================
// Progress Visual Formats
// ============================================
export const PROGRESS_FORMATS = {
  percentage: 'percentage',  // "67% complete"
  bar: 'bar',                // Visual progress bar
  fraction: 'fraction',      // "2 of 3 tasks done"
  checklist: 'checklist',    // ✅ ✅ ⬜
  level: 'level'            // Level 4 → Level 5
};

// ============================================
// Threshold Rules
// ============================================
export const THRESHOLD_RULES = {
  // ✅ GOOD: Small, frequent wins
  goodThresholds: [10, 25, 50, 75, 100, 150, 250],
  
  // ❌ BAD: Large, rare wins
  badThresholds: [100, 500, 1000, 5000],
  
  // Next goal should be <20% away from current position
  maxDistancePercent: 20
};

// ============================================
// Notification Triggers
// ============================================
export const NOTIFICATION_TRIGGERS = {
  daily: {
    time: '8:00 PM',
    condition: 'dailyProgress < 100%',
    message: 'You\'re at 67%! Just one task to complete your day 🎯'
  },
  
  weekly: {
    day: 'Sunday 6:00 PM',
    condition: 'weeklyProgress >= 80%',
    message: 'You\'re SO close to your weekly goal! 1 more day 🔥'
  },
  
  streak: {
    time: '9:00 PM',
    condition: 'todayIncomplete && streakCount >= 3',
    message: 'Don\'t lose your streak! 🚨 (5 min to complete)'
  }
};
