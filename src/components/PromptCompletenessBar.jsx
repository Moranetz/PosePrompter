import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Check } from 'lucide-react';

/**
 * PromptCompletenessBar - Shows prompt assembly progress + live preview
 *
 * Psychology: Endowed Progress Effect (Nunes & Dreze, 2006)
 * Users who see progress toward a goal are more likely to complete it.
 * Showing "4 of 6 parts included" transforms aimless browsing into
 * goal-directed behavior. The Goal Gradient Effect accelerates
 * engagement as users approach "completion."
 *
 * Also leverages System Status Visibility (Nielsen #1) by showing
 * a live preview of the assembled prompt text.
 */

const PromptCompletenessBar = ({
  categoryGroups,
  includedCategories,
  selections,
  categories,
  generatedPrompt,
  onCopy,
  copied,
}) => {
  // Count how many groups have at least one included category with a selection
  const { includedCount, totalGroups, groupStatuses } = useMemo(() => {
    const statuses = categoryGroups.map((group) => {
      const hasIncluded = group.categories.some(
        (cat) => includedCategories[cat] !== false && selections[cat] !== undefined && categories[cat]?.length > 0
      );
      return hasIncluded;
    });
    return {
      includedCount: statuses.filter(Boolean).length,
      totalGroups: categoryGroups.length,
      groupStatuses: statuses,
    };
  }, [categoryGroups, includedCategories, selections, categories]);

  const progressPercent = totalGroups > 0 ? (includedCount / totalGroups) * 100 : 0;

  // Truncate prompt for preview
  const promptPreview = useMemo(() => {
    if (!generatedPrompt) return 'Select options to build your prompt...';
    if (generatedPrompt.length > 120) {
      return generatedPrompt.slice(0, 117) + '...';
    }
    return generatedPrompt;
  }, [generatedPrompt]);

  const hasPrompt = generatedPrompt && generatedPrompt.trim().length > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: '40px',
      }}
    >
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {groupStatuses.map((active, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              background: active
                ? 'var(--accent-primary)'
                : 'rgba(255, 255, 255, 0.08)',
              scale: active ? 1 : 0.85,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              transition: 'background 200ms',
            }}
            title={categoryGroups[i]?.title}
          />
        ))}
      </div>

      {/* Count label */}
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {includedCount}/{totalGroups} parts
      </span>

      {/* Thin progress bar */}
      <div
        style={{
          flex: '0 0 60px',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '2px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            height: '100%',
            background: progressPercent === 100
              ? 'var(--accent-primary)'
              : 'rgba(255, 255, 255, 0.25)',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Prompt preview */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '11px',
          color: hasPrompt ? 'var(--text-secondary)' : 'var(--text-faint)',
          fontStyle: hasPrompt ? 'normal' : 'italic',
          letterSpacing: '-0.01em',
        }}
        title={generatedPrompt || undefined}
      >
        {promptPreview}
      </div>

      {/* Copy button */}
      <AnimatePresence mode="wait">
        <motion.button
          key={copied ? 'copied' : 'copy'}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCopy}
          disabled={!hasPrompt}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            background: copied
              ? 'rgba(34, 197, 94, 0.15)'
              : hasPrompt
                ? 'rgba(255, 255, 255, 0.06)'
                : 'transparent',
            border: copied
              ? '1px solid rgba(34, 197, 94, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: copied ? '#22c55e' : hasPrompt ? 'var(--text-secondary)' : 'var(--text-faint)',
            fontSize: '11px',
            fontWeight: 500,
            cursor: hasPrompt ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'all 150ms',
            opacity: hasPrompt ? 1 : 0.4,
          }}
          onMouseEnter={(e) => {
            if (hasPrompt && !copied) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.background = hasPrompt ? 'rgba(255, 255, 255, 0.06)' : 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }
          }}
        >
          {copied ? <Check size={12} /> : <Clipboard size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

export default PromptCompletenessBar;
