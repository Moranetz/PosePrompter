import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff, Settings, Check } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { getHiddenCategoryGroups, updateHiddenCategoryGroups } from '../utils/personalizationService';
import { motion } from 'framer-motion';

const VisibilitySettingsModal = ({ isOpen, onClose, categoryGroups, onUpdate }) => {
  const { user } = useAuth();
  const [hiddenGroups, setHiddenGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current preferences
  const loadPreferences = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const hidden = await getHiddenCategoryGroups(user.uid);
      setHiddenGroups(hidden || []);
    } catch (error) {
      console.error('Error loading visibility preferences:', error);
      setHiddenGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadPreferences();
    }
  }, [isOpen, user, loadPreferences]);

  const toggleGroup = (groupTitle) => {
    setHiddenGroups(prev => {
      if (prev.includes(groupTitle)) {
        return prev.filter(title => title !== groupTitle);
      } else {
        return [...prev, groupTitle];
      }
    });
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save preferences');
      return;
    }

    setSaving(true);
    try {
      await updateHiddenCategoryGroups(user.uid, hiddenGroups);
      if (onUpdate) {
        onUpdate(hiddenGroups);
      }
      onClose();
    } catch (error) {
      console.error('Error saving visibility preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
          position: 'relative',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ padding: '32px 32px 24px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Visibility Settings
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            Hide or show category groups to customize your workspace
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
              Loading...
            </div>
          ) : (
            <>
              {/* Category Groups List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                {categoryGroups.map((group) => {
                  const isHidden = hiddenGroups.includes(group.title);
                  return (
                    <label
                      key={group.title}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: isHidden ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.1)',
                        border: isHidden
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isHidden 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(139, 92, 246, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isHidden 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(139, 92, 246, 0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        {isHidden ? (
                          <EyeOff size={18} color="rgba(255, 255, 255, 0.5)" />
                        ) : (
                          <Eye size={18} color="#8b5cf6" />
                        )}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              color: isHidden ? 'rgba(255, 255, 255, 0.5)' : '#ffffff',
                              fontSize: '15px',
                              fontWeight: '500',
                              marginBottom: '2px',
                            }}
                          >
                            {group.title}
                          </div>
                          <div
                            style={{
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontSize: '12px',
                            }}
                          >
                            {group.description}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={!isHidden}
                        onChange={() => toggleGroup(group.title)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#8b5cf6',
                        }}
                      />
                    </label>
                  );
                })}
              </div>

              {/* Info Note */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  marginBottom: '24px',
                }}
              >
                Hidden category groups will not appear in the sidebar. You can restore them anytime from this settings panel.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: saving
                      ? 'rgba(139, 92, 246, 0.5)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: saving ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VisibilitySettingsModal;

