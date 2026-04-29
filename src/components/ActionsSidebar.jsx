import React from 'react';
import { RotateCcw, Save, FolderOpen, Star, Clock, Undo2, Redo2, Plus, Package, TrendingUp, Camera } from 'lucide-react';
import { TOUCH_TARGETS, TYPOGRAPHY } from '../config/uxDesignSystem';

const btnBase = {
  width: '100%',
  background: 'transparent',
  color: '#9898a0',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  padding: '9px 12px',
  minHeight: '40px',
  fontSize: '12.5px',
  fontWeight: '450',
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  transition: 'all 120ms ease',
};

const hoverIn = (e) => {
  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
  e.currentTarget.style.color = '#e4dbfa';
  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
};

const hoverOut = (e) => {
  e.currentTarget.style.background = 'transparent';
  e.currentTarget.style.color = '#9898a0';
  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
};

const ActionsSidebar = ({
  onRandomizeAll,
  onSaveSetup,
  onOpenSavedSets,
  onOpenFavorites,
  onOpenHistory,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCreateSet,
  onPhotoToPrompt,
  onOpenPackages,
  onOpenStats,
  showPackages,
}) => (
  <div className="actions-sidebar">
    {/* Primary Action */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={onRandomizeAll}
        style={{
          ...btnBase,
          background: 'rgba(139, 92, 246, 0.12)',
          color: '#e4dbfa',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          fontWeight: '550',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.45)';
          e.currentTarget.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        aria-label="I'm Feeling Lucky"
        title="I'm Feeling Lucky"
      >
        <RotateCcw size={14} />
        I'm Feeling Lucky
      </button>
    </div>

    {/* Divider */}
    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.04)', margin: '6px 0' }} />

    {/* Secondary Actions */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button onClick={onSaveSetup} style={btnBase} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
        aria-label="Save current setup" title="Save current setup">
        <Save size={14} /> Save Setup
      </button>

      <button onClick={onOpenSavedSets} style={btnBase} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
        aria-label="My saved sets" title="My saved sets">
        <FolderOpen size={14} /> My Sets
      </button>

      <button onClick={onOpenFavorites} style={btnBase} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
        aria-label="My favorite prompts" title="View all favorite prompts and create sets from them">
        <Star size={14} /> My Favorites
      </button>

      <button onClick={onOpenHistory} style={btnBase} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
        aria-label="Prompt history" title="View previously generated prompts">
        <Clock size={14} /> History
      </button>

      {/* Undo / Redo */}
      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            flex: 1,
            background: 'transparent',
            color: canUndo ? '#a1a1aa' : 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '8px',
            minHeight: '38px',
            fontSize: '12px',
            cursor: canUndo ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 200ms',
            opacity: canUndo ? 1 : 0.5,
          }}
          onMouseEnter={(e) => { if (canUndo) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f4f4f5'; }}}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = canUndo ? '#a1a1aa' : 'rgba(255,255,255,0.12)'; }}
          aria-label="Undo" title="Undo (Ctrl+Z)"
        >
          <Undo2 size={13} /> Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            flex: 1,
            background: 'transparent',
            color: canRedo ? '#a1a1aa' : 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '8px',
            minHeight: '38px',
            fontSize: '12px',
            cursor: canRedo ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 200ms',
            opacity: canRedo ? 1 : 0.5,
          }}
          onMouseEnter={(e) => { if (canRedo) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f4f4f5'; }}}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = canRedo ? '#a1a1aa' : 'rgba(255,255,255,0.12)'; }}
          aria-label="Redo" title="Redo (Ctrl+Y)"
        >
          <Redo2 size={13} /> Redo
        </button>
      </div>

      <button onClick={onCreateSet} style={btnBase} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
        aria-label="Create Set" title="Create Set - Add custom prompt to category">
        <Plus size={14} /> Create Set
      </button>

      {onPhotoToPrompt && (
        <button onClick={onPhotoToPrompt} style={btnBase} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          aria-label="Photo to Prompt" title="Upload a photo and generate a detailed prompt from it">
          <Camera size={14} /> Photo to Prompt
        </button>
      )}

      {showPackages && (
        <button
          data-packages-button
          onClick={onOpenPackages}
          style={{
            ...btnBase,
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
            fontSize: TYPOGRAPHY.BASE,
            fontWeight: '500',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          aria-label="Installed packages" title="Installed packages"
        >
          <Package size={14} /> Packages
        </button>
      )}

      <button
        onClick={onOpenStats}
        style={{
          ...btnBase,
          color: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontWeight: '500',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
        aria-label="View your progress" title="View your progress and achievements"
      >
        <TrendingUp size={14} /> Stats
      </button>
    </div>
  </div>
);

export default ActionsSidebar;
