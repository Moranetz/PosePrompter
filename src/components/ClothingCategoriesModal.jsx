import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { updateEnabledClothingCategories, getEnabledClothingCategories, getUserPreferences } from '../utils/personalizationService';

// Default category (can be toggled)
const DEFAULT_CLOTHING_CATEGORY = { key: 'Outfit', displayName: 'Outfit', count: 118 };

// Optional clothing categories
const OPTIONAL_CLOTHING_CATEGORIES = [
  { key: 'OutfitTop', displayName: 'Outfit Top', count: 34 },
  { key: 'OutfitBottom', displayName: 'Outfit Bottom', count: 20 },
  { key: 'Shoes', displayName: 'Shoes', count: 14 },
  { key: 'Jewelry', displayName: 'Jewelry', count: 11 },
  { key: 'HairAccessories', displayName: 'Hair Accessories', count: 18 },
  { key: 'Bags', displayName: 'Bags', count: 9 },
  { key: 'BrandDesigner', displayName: 'Brand/Designer', count: 12 },
];

// All categories (default + optional)
const ALL_CLOTHING_CATEGORIES = [DEFAULT_CLOTHING_CATEGORY, ...OPTIONAL_CLOTHING_CATEGORIES];

const ClothingCategoriesModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current preferences when modal opens
  const loadCurrentPreferences = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if preferences field exists (distinguish between "never set" and "set to empty")
      const prefs = await getUserPreferences(user.uid);
      const hasSetPreferences = prefs?.preferences && 'enabledClothingCategories' in prefs.preferences;
      
      if (hasSetPreferences) {
        // Field exists - use what's saved, even if it's an empty array
        const enabled = await getEnabledClothingCategories(user.uid);
        setSelectedCategories(enabled || []);
      } else {
        // Field doesn't exist - initialize with default
        setSelectedCategories(['Outfit']);
      }
    } catch (error) {
      console.error('Error loading clothing categories preferences:', error);
      // Initialize with default if error
      setSelectedCategories(['Outfit']);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadCurrentPreferences();
    }
  }, [isOpen, user, loadCurrentPreferences]);

  const toggleCategory = (categoryKey) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryKey)) {
        return prev.filter(key => key !== categoryKey);
      } else {
        return [...prev, categoryKey];
      }
    });
  };

  const selectAll = () => {
    setSelectedCategories(ALL_CLOTHING_CATEGORIES.map(cat => cat.key));
  };

  const deselectAll = () => {
    setSelectedCategories([]);
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save preferences');
      return;
    }

    setSaving(true);
    try {
      // Explicitly save the array (even if empty) - this allows users to uncheck all categories
      await updateEnabledClothingCategories(user.uid, selectedCategories || []);
      if (onSave) {
        onSave(selectedCategories || []);
      }
      onClose();
    } catch (error) {
      console.error('Error saving clothing categories preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const allSelected = selectedCategories.length === ALL_CLOTHING_CATEGORIES.length;
  const noneSelected = selectedCategories.length === 0;

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
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
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
            Select Clothing Categories
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            Choose which clothing categories to include in "Clothes & Styling". Only selected categories will appear.
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <>
              {/* Select All / Deselect All */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={selectAll}
                  disabled={allSelected}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: allSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.2)',
                    border: allSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '8px',
                    color: allSelected ? 'rgba(255, 255, 255, 0.3)' : '#c4b5fd',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: allSelected ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  disabled={noneSelected}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: noneSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    border: noneSelected ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: noneSelected ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: noneSelected ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Deselect All
                </button>
              </div>

              {/* Category List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                {ALL_CLOTHING_CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category.key);
                  return (
                    <label
                      key={category.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected
                          ? '1px solid rgba(139, 92, 246, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(category.key)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#8b5cf6',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: '#ffffff',
                            fontSize: '15px',
                            fontWeight: '500',
                            marginBottom: '2px',
                          }}
                        >
                          {category.displayName}
                        </div>
                        <div
                          style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '12px',
                          }}
                        >
                          {category.count} {category.count === 1 ? 'option' : 'options'}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />
                      )}
                    </label>
                  );
                })}
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
                  {saving ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ClothingCategoriesModal;
