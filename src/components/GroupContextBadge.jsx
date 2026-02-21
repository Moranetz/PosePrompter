import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Camera, Palette, Shirt, Smile, PersonStanding } from 'lucide-react';

/**
 * GroupContextBadge - Ambient context cue when switching category groups
 *
 * Psychology: Context-Dependent Memory (Godden & Baddeley, 1975)
 * Environmental cues encoded alongside information make retrieval easier.
 * By visually signaling which "domain" the user is working in
 * (environment, camera, style, clothing, face, body), we reinforce
 * the mental model of the category hierarchy.
 *
 * Also leverages the Von Restorff Effect — the active group's color
 * and icon make it distinctly memorable relative to inactive groups.
 */

const GROUP_META = [
  { icon: Mountain, label: 'Environment', color: '#22c55e' },
  { icon: Camera, label: 'Framing', color: '#3b82f6' },
  { icon: Palette, label: 'Aesthetic', color: '#a78bfa' },
  { icon: Shirt, label: 'Styling', color: '#f472b6' },
  { icon: Smile, label: 'Face', color: '#fbbf24' },
  { icon: PersonStanding, label: 'Body', color: '#14b8a6' },
];

const GroupContextBadge = ({ expandedGroup }) => {
  if (expandedGroup === null || expandedGroup === undefined || !GROUP_META[expandedGroup]) {
    return null;
  }

  const meta = GROUP_META[expandedGroup];
  const Icon = meta.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={expandedGroup}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: `${meta.color}10`,
          border: `1px solid ${meta.color}25`,
          borderRadius: '100px',
          flexShrink: 0,
        }}
      >
        <Icon size={12} style={{ color: meta.color, opacity: 0.8 }} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: meta.color,
            opacity: 0.85,
            letterSpacing: '0.01em',
          }}
        >
          {meta.label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupContextBadge;
