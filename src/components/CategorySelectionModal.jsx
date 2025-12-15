import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Loader2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getEnabledFaceHeadCategories,
  updateEnabledFaceHeadCategories,
  getEnabledAestheticStyleCategories,
  updateEnabledAestheticStyleCategories,
  getEnabledFramingCompositionCategories,
  updateEnabledFramingCompositionCategories,
  getEnabledBackgroundEnvironmentCategories,
  updateEnabledBackgroundEnvironmentCategories,
  getEnabledBodyPoseCategories,
  updateEnabledBodyPoseCategories,
  getUserPreferences,
} from '../utils/personalizationService';

// Category display names mapping
const categoryDisplayNames = {
  'Aesthetic': 'Aesthetic',
  'FacialExpression': 'Facial Expression',
  'Framing': 'Framing',
  'Background': 'Background',
};

const CategorySelectionModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  categoryGroup,
  optionalCategories,
  defaultCategory,
  defaultCategoryCount,
  title,
  description,
  categories,
  userDeletedOptions = {},
  onTrashOption,
  userCustomOptions = {}
}) => {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedOptions, setSelectedOptions] = useState({}); // Track selected options per category: { categoryKey: [optionIdentifiers] }

  // Get the appropriate get/update functions based on categoryGroup
  const getFunctions = {
    'faceHead': getEnabledFaceHeadCategories,
    'aestheticStyle': getEnabledAestheticStyleCategories,
    'framingComposition': getEnabledFramingCompositionCategories,
    'backgroundEnvironment': getEnabledBackgroundEnvironmentCategories,
    'bodyPose': getEnabledBodyPoseCategories,
  };

  const updateFunctions = {
    'faceHead': updateEnabledFaceHeadCategories,
    'aestheticStyle': updateEnabledAestheticStyleCategories,
    'framingComposition': updateEnabledFramingCompositionCategories,
    'backgroundEnvironment': updateEnabledBackgroundEnvironmentCategories,
    'bodyPose': updateEnabledBodyPoseCategories,
  };

  const getEnabledCategories = getFunctions[categoryGroup];
  const updateEnabledCategories = updateFunctions[categoryGroup];

  // Map categoryGroup to preference field name
  const preferenceFieldNames = {
    'faceHead': 'enabledFaceHeadCategories',
    'aestheticStyle': 'enabledAestheticStyleCategories',
    'framingComposition': 'enabledFramingCompositionCategories',
    'backgroundEnvironment': 'enabledBackgroundEnvironmentCategories',
    'bodyPose': 'enabledBodyPoseCategories',
  };

  const preferenceFieldName = preferenceFieldNames[categoryGroup];

  // Load current preferences when modal opens
  const loadCurrentPreferences = useCallback(async () => {
    if (!user || !getEnabledCategories) return;
    
    setLoading(true);
    try {
      // Check if preferences field exists (distinguish between "never set" and "set to empty")
      const prefs = await getUserPreferences(user.uid);
      const hasSetPreferences = prefs?.preferences && preferenceFieldName && preferenceFieldName in prefs.preferences;
      
      if (hasSetPreferences) {
        // Field exists - use what's saved, even if it's an empty array
        const enabled = await getEnabledCategories(user.uid);
        setSelectedCategories(enabled || []);
      } else {
        // Field doesn't exist - initialize with default or all categories
        if (categoryGroup === 'bodyPose') {
          // For Body & Pose, initialize with ALL categories (default + optional) when no preferences exist
          const allBodyPoseCategories = defaultCategory 
            ? [defaultCategory, ...optionalCategories.map(cat => cat.key)]
            : optionalCategories.map(cat => cat.key);
          setSelectedCategories(allBodyPoseCategories);
        } else if (defaultCategory) {
          // For other groups, initialize with just the default category
          setSelectedCategories([defaultCategory]);
        } else {
          setSelectedCategories([]);
        }
      }
      
      // Load selected options for all categories in this group
      if (categories) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const savedSelectedOptions = data.selectedOptions || {};
          // Filter to only options for categories in this group
          const groupSelectedOptions = {};
          const allCategoryKeys = defaultCategory 
            ? [defaultCategory, ...optionalCategories.map(cat => cat.key)]
            : optionalCategories.map(cat => cat.key);
          
          allCategoryKeys.forEach(catKey => {
            if (savedSelectedOptions[catKey]) {
              groupSelectedOptions[catKey] = savedSelectedOptions[catKey];
            }
          });
          
          setSelectedOptions(groupSelectedOptions);
        }
        // If no saved options, don't set anything - all options will be selected by default
      }
    } catch (error) {
      console.error(`Error loading ${categoryGroup} categories preferences:`, error);
      // Initialize with default or all categories if error
      if (categoryGroup === 'bodyPose') {
        const allBodyPoseCategories = defaultCategory 
          ? [defaultCategory, ...optionalCategories.map(cat => cat.key)]
          : optionalCategories.map(cat => cat.key);
        setSelectedCategories(allBodyPoseCategories);
      } else if (defaultCategory) {
        setSelectedCategories([defaultCategory]);
      } else {
        setSelectedCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, getEnabledCategories, categoryGroup, defaultCategory, preferenceFieldName, categories]);

  useEffect(() => {
    if (isOpen && user) {
      loadCurrentPreferences();
    }
  }, [isOpen, user, loadCurrentPreferences]);

  const toggleCategory = (categoryKey) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryKey)) {
        // Unchecking category: also clear selectedOptions for this category to maintain consistency
        setSelectedOptions(prevOptions => {
          const updated = { ...prevOptions };
          updated[categoryKey] = [];
          return updated;
        });
        return prev.filter(key => key !== categoryKey);
      } else {
        return [...prev, categoryKey];
      }
    });
  };

  // Combine default category with optional categories for display
  const allCategories = defaultCategory 
    ? [{ key: defaultCategory, displayName: categoryDisplayNames[defaultCategory] || defaultCategory, count: defaultCategoryCount || 0 }, ...optionalCategories]
    : optionalCategories;

  const selectAll = () => {
    // If any categories are expanded, select all nested options for those expanded categories
    // If no categories are expanded (all collapsed), select all category checkboxes
    if (expandedCategories.size > 0) {
      // Some categories are expanded: select all nested options for expanded categories
      // Also check the category checkboxes for those expanded categories
      const expandedArray = Array.from(expandedCategories);
      setSelectedOptions(prev => {
        const updated = { ...prev };
        expandedCategories.forEach(categoryKey => {
          const options = getCategoryOptions(categoryKey);
          if (options.length > 0) {
            const allIdentifiers = options.map((opt, idx) => getOptionIdentifier(opt, categoryKey, idx));
            updated[categoryKey] = allIdentifiers;
          }
        });
        return updated;
      });
      // Also check the category checkboxes for expanded categories
      setSelectedCategories(prev => {
        const updated = new Set(prev);
        expandedArray.forEach(categoryKey => {
          updated.add(categoryKey);
        });
        return Array.from(updated);
      });
    } else {
      // All categories are collapsed: select all category checkboxes
      setSelectedCategories(allCategories.map(cat => cat.key));
    }
  };

  const deselectAll = () => {
    // If any categories are expanded, deselect all nested options for those expanded categories
    // If no categories are expanded (all collapsed), deselect all category checkboxes
    if (expandedCategories.size > 0) {
      // Some categories are expanded: deselect all nested options for expanded categories
      // Also uncheck the category checkboxes for those expanded categories
      const expandedArray = Array.from(expandedCategories);
      setSelectedOptions(prev => {
        const updated = { ...prev };
        expandedCategories.forEach(categoryKey => {
          updated[categoryKey] = [];
        });
        return updated;
      });
      // Also uncheck the category checkboxes for expanded categories
      setSelectedCategories(prev => prev.filter(key => !expandedArray.includes(key)));
    } else {
      // All categories are collapsed: deselect all category checkboxes
      setSelectedCategories([]);
    }
  };

  const toggleExpandCategory = (categoryKey) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  // Get options for a category, filtering out deleted ones
  const getCategoryOptions = (categoryKey) => {
    if (!categories || !categories[categoryKey]) return [];
    
    const categoryOptions = categories[categoryKey] || [];
    const customOptions = userCustomOptions[categoryKey] || [];
    const deletedOptions = userDeletedOptions[categoryKey] || [];
    
    // Filter default options (check by original index)
    const filteredDefaultOptions = categoryOptions.filter((option, index) => {
      return !deletedOptions.includes(index);
    });
    
    // Filter custom options (check by id)
    const filteredCustomOptions = customOptions.filter((option) => {
      if (typeof option === 'object' && option.id) {
        return !deletedOptions.includes(option.id);
      }
      return true;
    });
    
    // Combine filtered default and custom options
    return [...filteredDefaultOptions, ...filteredCustomOptions];
  };

  // Get option identifier - finds the option in the original category array
  const getOptionIdentifier = (option, categoryKey, indexInFilteredList) => {
    // If it's a custom option with an id, use that
    if (typeof option === 'object' && option.id) {
      return option.id;
    }
    
    // For default options, find the index in the original category array
    const categoryOptions = categories[categoryKey] || [];
    const customOptions = userCustomOptions[categoryKey] || [];
    const deletedOptions = userDeletedOptions[categoryKey] || [];
    
    // Build a map of filtered options to their original indices
    let currentFilteredIndex = 0;
    for (let originalIndex = 0; originalIndex < categoryOptions.length; originalIndex++) {
      if (!deletedOptions.includes(originalIndex)) {
        if (currentFilteredIndex === indexInFilteredList) {
          return originalIndex;
        }
        currentFilteredIndex++;
      }
    }
    
    // If not found in default options, check custom options
    const filteredDefaultCount = categoryOptions.filter((opt, idx) => !deletedOptions.includes(idx)).length;
    const customIndex = indexInFilteredList - filteredDefaultCount;
    if (customIndex >= 0 && customIndex < customOptions.length) {
      const customOption = customOptions[customIndex];
      if (typeof customOption === 'object' && customOption.id) {
        return customOption.id;
      }
    }
    
    // Fallback: try direct comparison
    const foundIndex = categoryOptions.findIndex(opt => {
      if (typeof opt === 'string' && typeof option === 'string') {
        return opt === option;
      }
      if (typeof opt === 'object' && typeof option === 'object') {
        return (opt.title === option.title) || 
               (opt.prompt === option.prompt) ||
               (opt.text === option.text);
      }
      return opt === option;
    });
    return foundIndex !== -1 ? foundIndex : indexInFilteredList;
  };

  // Toggle individual option selection
  const toggleOption = (categoryKey, option, index) => {
    const identifier = getOptionIdentifier(option, categoryKey, index);
    const categorySelected = selectedOptions[categoryKey];
    const isCategoryChecked = selectedCategories.includes(categoryKey);
    
    // Determine if we're selecting or deselecting based on current state
    let isSelecting = false;
    if (!isCategoryChecked) {
      // Category is unchecked, so we're selecting (to check the option)
      isSelecting = true;
    } else if (categorySelected === undefined) {
      // All options are selected by default, so we're deselecting
      isSelecting = false;
    } else if (categorySelected.length === 0) {
      // No options selected, so we're selecting
      isSelecting = true;
    } else {
      // Check if this option is currently selected
      isSelecting = !categorySelected.includes(identifier);
    }
    
    // If selecting a nested option, automatically check the parent category FIRST
    if (isSelecting && !isCategoryChecked) {
      setSelectedCategories(prev => {
        if (!prev.includes(categoryKey)) {
          return [...prev, categoryKey];
        }
        return prev;
      });
    }
    
    setSelectedOptions(prev => {
      const currentCategorySelected = prev[categoryKey];
      
      // If category is not checked, treat as empty array
      if (!isCategoryChecked && isSelecting) {
        // Category was just checked, initialize with this option
        return {
          ...prev,
          [categoryKey]: [identifier]
        };
      }
      
      // If categorySelected is undefined, initialize with all options except this one
      if (currentCategorySelected === undefined) {
        const allOptions = getCategoryOptions(categoryKey);
        const allIdentifiers = allOptions.map((opt, idx) => getOptionIdentifier(opt, categoryKey, idx));
        // Remove this option (deselecting it)
        const newSelected = allIdentifiers.filter(id => id !== identifier);
        
        // If deselecting the last option (or all options), uncheck the category checkbox
        if (newSelected.length === 0) {
          setSelectedCategories(prevCats => prevCats.filter(key => key !== categoryKey));
        }
        
        return {
          ...prev,
          [categoryKey]: newSelected
        };
      }
      
      // If it's an empty array, add this option (selecting it)
      if (currentCategorySelected.length === 0) {
        return {
          ...prev,
          [categoryKey]: [identifier]
        };
      }
      
      // Toggle the option
      if (currentCategorySelected.includes(identifier)) {
        // Deselecting: remove the option
        const newSelected = currentCategorySelected.filter(id => id !== identifier);
        
        // If this was the last selected option, uncheck the category checkbox
        if (newSelected.length === 0) {
          setSelectedCategories(prevCats => prevCats.filter(key => key !== categoryKey));
        }
        
        return {
          ...prev,
          [categoryKey]: newSelected
        };
      } else {
        // Selecting: add the option
        return {
          ...prev,
          [categoryKey]: [...currentCategorySelected, identifier]
        };
      }
    });
  };

  // Check if an option is selected
  const isOptionSelected = (categoryKey, option, index) => {
    // First check if the parent category is selected - if not, no nested options are selected
    if (!selectedCategories.includes(categoryKey)) {
      return false;
    }
    
    const identifier = getOptionIdentifier(option, categoryKey, index);
    const categorySelected = selectedOptions[categoryKey];
    // If categorySelected is undefined, all options are selected by default (when category is checked)
    // If it's an empty array, no options are selected
    // If it's an array with values, check if this identifier is in it
    if (categorySelected === undefined) {
      return true;
    }
    if (Array.isArray(categorySelected)) {
      return categorySelected.includes(identifier);
    }
    return false;
  };

  // Deselect option (remove from selectedOptions)
  const deselectOption = (categoryKey, option, index) => {
    const identifier = getOptionIdentifier(option, categoryKey, index);
    setSelectedOptions(prev => {
      const categorySelected = prev[categoryKey];
      
      // If categorySelected is undefined, initialize with all options except the deselected one
      if (categorySelected === undefined) {
        const allOptions = getCategoryOptions(categoryKey);
        const allIdentifiers = allOptions.map((opt, idx) => getOptionIdentifier(opt, categoryKey, idx));
        // Remove the deselected one
        return {
          ...prev,
          [categoryKey]: allIdentifiers.filter(id => id !== identifier)
        };
      }
      
      // If it's an empty array, nothing to remove (all already deselected)
      if (categorySelected.length === 0) {
        return prev;
      }
      
      // Remove the deselected option
      return {
        ...prev,
        [categoryKey]: categorySelected.filter(id => id !== identifier)
      };
    });
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save preferences');
      return;
    }

    if (!updateEnabledCategories) {
      console.error('No update function found for category group:', categoryGroup);
      return;
    }

    setSaving(true);
    try {
      // Explicitly save the array (even if empty) - this allows users to uncheck all categories
      await updateEnabledCategories(user.uid, selectedCategories || []);
      
      // Save selected options to Firestore
      // CRITICAL FIX: Use setDoc with merge to handle non-existent documents
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentSelectedOptions = currentData.selectedOptions || {};
      
      // Merge selected options for this group
      const updatedSelectedOptions = {
        ...currentSelectedOptions,
        ...selectedOptions
      };
      
      // Use setDoc with merge to ensure document exists and merge data safely
      await setDoc(userRef, {
        selectedOptions: updatedSelectedOptions,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      if (onSave) {
        onSave(selectedCategories || []);
      }
      onClose();
    } catch (error) {
      console.error(`Error saving ${categoryGroup} categories preferences:`, error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const allSelected = selectedCategories.length === allCategories.length;
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
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            {description}
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
                {allCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.key);
                  const isExpanded = expandedCategories.has(category.key);
                  const categoryOptions = getCategoryOptions(category.key);
                  const optionCount = categoryOptions.length;
                  
                  return (
                    <div key={category.key}>
                      <div
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
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategory(category.key)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#8b5cf6',
                            }}
                          />
                          <div style={{ flex: 1, marginLeft: '12px' }}>
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
                              {optionCount} {optionCount === 1 ? 'option' : 'options'}
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleExpandCategory(category.key);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'rgba(255, 255, 255, 0.6)',
                            transition: 'color 0.2s ease',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                          }}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </div>
                      
                      {/* Expanded Options List */}
                      <AnimatePresence>
                        {isExpanded && categories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              overflow: 'hidden',
                              marginTop: '8px',
                              marginLeft: '48px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                padding: '8px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                maxHeight: '300px',
                                overflowY: 'auto',
                              }}
                            >
                              {categoryOptions.length === 0 ? (
                                <div
                                  style={{
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '12px',
                                    padding: '8px',
                                    textAlign: 'center',
                                  }}
                                >
                                  No options available
                                </div>
                              ) : (
                                categoryOptions.map((option, index) => {
                                  const optionText = typeof option === 'string' 
                                    ? option 
                                    : (option.title || option.prompt || option.text || `Option ${index + 1}`);
                                  const optionId = typeof option === 'object' && option.id 
                                    ? option.id 
                                    : index;
                                  const isOptionChecked = isOptionSelected(category.key, option, index);
                                  const packageName = option.packageName;
                                  const packageId = option.packageId;
                                  
                                  return (
                                    <motion.div
                                      key={optionId}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      transition={{ duration: 0.2 }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        opacity: isOptionChecked ? 1 : 0.5,
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isOptionChecked}
                                        onChange={() => toggleOption(category.key, option, index)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          cursor: 'pointer',
                                          accentColor: '#8b5cf6',
                                          flexShrink: 0,
                                        }}
                                      />
                                      <span
                                        style={{
                                          flex: 1,
                                          color: 'rgba(255, 255, 255, 0.8)',
                                          fontSize: '13px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                        title={optionText}
                                      >
                                        {optionText.length > 50 ? optionText.substring(0, 50) + '...' : optionText}
                                      </span>
                                      
                                      {/* Package Badge */}
                                      {packageName && (
                                        <span
                                          style={{
                                            fontSize: '9px',
                                            padding: '2px 5px',
                                            background: 'rgba(99, 102, 241, 0.15)',
                                            border: '1px solid rgba(99, 102, 241, 0.25)',
                                            borderRadius: '3px',
                                            color: '#818cf8',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            flexShrink: 0,
                                          }}
                                          title={`From package: ${packageName}`}
                                        >
                                          {packageName.substring(0, 8)}
                                        </span>
                                      )}
                                    </motion.div>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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

export default CategorySelectionModal;

