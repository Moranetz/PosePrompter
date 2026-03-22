import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { X, Share2, Edit2, Trash2, Loader2, Download, Plus, Star, Heart } from 'lucide-react';
import useUndoRedo from './hooks/useUndoRedo';
import usePromptHistory from './hooks/usePromptHistory';
import PromptHistory from './components/PromptHistory';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';
import { useAuth } from './contexts/UserContext';
import { logger } from './utils/logger.js';
import CategoryTabs from './components/CategoryTabs';
import CategoryChips from './components/CategoryChips';
import LivePromptPreview from './components/LivePromptPreview';
import FigureCanvas from './components/ArticulatedFigure/FigureCanvas';
import WordButtonBar from './components/WordButtons/WordButtonBar';
import Header from './components/Header';
import Footer from './components/Footer';
import InstalledPackagesModal from './components/InstalledPackagesModal';
import FirstTimeExperience from './components/FirstTimeExperience';
import CopySuccessOverlay from './components/CopySuccessOverlay';
import PolaroidFrame from './components/PolaroidFrame';
import { TOUCH_TARGETS, SPACING, TYPOGRAPHY } from './config/uxDesignSystem';
import NatureFrame from './components/NatureFrame';
import ClosetFrame from './components/ClosetFrame';
import AchievementNotification from './components/AchievementNotification';
import EngagementStats from './components/EngagementStats';
import ClothingCategoriesModal from './components/ClothingCategoriesModal';
import VisibilitySettingsModal from './components/VisibilitySettingsModal';
import TrashAnimation from './components/TrashAnimation';
import CategorySelectionModal from './components/CategorySelectionModal';
import { 
  trackPromptGenerated, 
  trackPromptCopied, 
  trackCategoryExplored, 
  updateStreak,
  getProgressMessage,
  getUserEngagementStats
} from './utils/engagementService';
import { triggerFeedback, FEEDBACK_TYPES } from './utils/visualFeedbackService';
import { 
  trackCategoryUsage, 
  getUserPreferences, 
  getFavoriteCategories,
  getDefaultExpandedGroups,
  trackSessionDuration,
  getEnabledClothingCategories,
  getHiddenCategoryGroups,
  getEnabledFaceHeadCategories,
  getEnabledAestheticStyleCategories,
  getEnabledFramingCompositionCategories,
  getEnabledBackgroundEnvironmentCategories,
  getEnabledBodyPoseCategories,
  updateEnabledBackgroundEnvironmentCategories,
  updateEnabledFramingCompositionCategories,
  updateEnabledAestheticStyleCategories,
  updateEnabledFaceHeadCategories,
  updateEnabledBodyPoseCategories
} from './utils/personalizationService';
import ShortcutHandler from './components/KeyboardShortcuts/ShortcutHandler';
import ActionsSidebar from './components/ActionsSidebar';
import ImageToPromptModal from './components/ImageToPromptModal';
import AuthModal from './components/AuthModal';
import MobileView from './components/MobileView';
import categories from './data/categories';
import presets from './data/presets';
import { categoryDisplayNames, categoryColors, categoryGroupDefinitions, comprehensiveAestheticOverrides } from './data/categoryRegistry';

const ONBOARDING_STORAGE_KEY = 'poseprompt_onboarding_complete';

const PhotoElementRandomizer = () => {
  // State declarations (needed before categoryGroups useMemo)
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '');
  const [enabledClothingCategories, setEnabledClothingCategories] = useState([]);
  const [clothingCategoriesModalOpen, setClothingCategoriesModalOpen] = useState(false);
  const [hasCheckedClothingPreferences, setHasCheckedClothingPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [hiddenCategoryGroups, setHiddenCategoryGroups] = useState([]);
  const [visibilitySettingsModalOpen, setVisibilitySettingsModalOpen] = useState(false);
  const hasShownClothingModalRef = useRef(false); // Track if modal has been shown this session
  
  // State for Face & Head package
  const [enabledFaceHeadCategories, setEnabledFaceHeadCategories] = useState([]);
  const [faceHeadModalOpen, setFaceHeadModalOpen] = useState(false);
  const [hasCheckedFaceHeadPreferences, setHasCheckedFaceHeadPreferences] = useState(false);
  
  // State for Aesthetic & Style package
  const [enabledAestheticStyleCategories, setEnabledAestheticStyleCategories] = useState([]);
  const [aestheticStyleModalOpen, setAestheticStyleModalOpen] = useState(false);
  const [hasCheckedAestheticStylePreferences, setHasCheckedAestheticStylePreferences] = useState(false);
  
  // State for Framing & Composition package
  const [enabledFramingCompositionCategories, setEnabledFramingCompositionCategories] = useState([]);
  const [framingCompositionModalOpen, setFramingCompositionModalOpen] = useState(false);
  const [hasCheckedFramingCompositionPreferences, setHasCheckedFramingCompositionPreferences] = useState(false);
  
  // State for Background & Environment package
  const [enabledBackgroundEnvironmentCategories, setEnabledBackgroundEnvironmentCategories] = useState([]);
  const [backgroundEnvironmentModalOpen, setBackgroundEnvironmentModalOpen] = useState(false);
  const [hasCheckedBackgroundEnvironmentPreferences, setHasCheckedBackgroundEnvironmentPreferences] = useState(false);
  
  // State for Body & Pose package
  const [enabledBodyPoseCategories, setEnabledBodyPoseCategories] = useState([]);
  const [bodyPoseModalOpen, setBodyPoseModalOpen] = useState(false);
  const [hasCheckedBodyPosePreferences, setHasCheckedBodyPosePreferences] = useState(false);

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handler = () => setIsMobileView(window.innerWidth <= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Category groups - built from registry, filtered by user preferences
  const enabledCategoriesMap = useMemo(() => ({
    enabledBackgroundEnvironmentCategories: { enabled: enabledBackgroundEnvironmentCategories, checked: hasCheckedBackgroundEnvironmentPreferences },
    enabledFramingCompositionCategories: { enabled: enabledFramingCompositionCategories, checked: hasCheckedFramingCompositionPreferences },
    enabledAestheticStyleCategories: { enabled: enabledAestheticStyleCategories, checked: hasCheckedAestheticStylePreferences },
    enabledClothingCategories: { enabled: enabledClothingCategories, checked: hasCheckedClothingPreferences },
    enabledFaceHeadCategories: { enabled: enabledFaceHeadCategories, checked: hasCheckedFaceHeadPreferences },
    enabledBodyPoseCategories: { enabled: enabledBodyPoseCategories, checked: hasCheckedBodyPosePreferences },
  }), [
    enabledBackgroundEnvironmentCategories, hasCheckedBackgroundEnvironmentPreferences,
    enabledFramingCompositionCategories, hasCheckedFramingCompositionPreferences,
    enabledAestheticStyleCategories, hasCheckedAestheticStylePreferences,
    enabledClothingCategories, hasCheckedClothingPreferences,
    enabledFaceHeadCategories, hasCheckedFaceHeadPreferences,
    enabledBodyPoseCategories, hasCheckedBodyPosePreferences,
  ]);

  const categoryGroups = useMemo(() => {
    const groups = categoryGroupDefinitions.map(def => {
      const state = enabledCategoriesMap[def.preferencesKey];
      const hasSetPref = userPreferences?.preferences && def.preferencesKey in userPreferences.preferences;

      let groupCategories;
      if (state.checked && hasSetPref && user) {
        groupCategories = state.enabled || [];
      } else {
        groupCategories = def.defaultCategories;
      }

      return { title: def.title, description: def.description, categories: groupCategories };
    });

    return groups.filter(group => !hiddenCategoryGroups.includes(group.title));
  }, [enabledCategoriesMap, user, userPreferences, hiddenCategoryGroups]);



  // Helper function to get natural pose defaults for new accounts
  const getNaturalPoseDefaults = (cats) => {
    const defaults = {};
    Object.keys(cats).forEach(key => {
      defaults[key] = 0; // Default to first option
    });
    
    // Set natural pose selections for a relaxed standing pose
    if (cats.BodyPose && cats.BodyPose.length > 5) {
      defaults.BodyPose = 5; // "Relaxed Stance" - natural standing pose
    }
    if (cats.HeadPosition && cats.HeadPosition.length > 0) {
      defaults.HeadPosition = 0; // "Neutral Forward-Facing Position"
    }
    if (cats.Legs && cats.Legs.length > 1) {
      defaults.Legs = 1; // "Legs Slightly Apart Stable"
    }
    if (cats.Hands && cats.Hands.length > 0) {
      defaults.Hands = 0; // "Hands Sides Completely Relaxed"
    }
    if (cats.Arms && cats.Arms.length > 0) {
      defaults.Arms = 0; // "Arms Sides Relaxed"
    }
    if (cats.BodySize && cats.BodySize.length > 2) {
      defaults.BodySize = 2; // "Average Healthy (18-22% Body Fat)" - default to average
    }
    
    return defaults;
  };

  const [selections, setSelections, { undo: undoSelection, redo: redoSelection, canUndo, canRedo }] = useUndoRedo({});
  const promptHistory = usePromptHistory();
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(-1);

  // Clear any old prompt from localStorage on mount
  useEffect(() => {
    localStorage.removeItem('currentPrompt');
  }, []);

  const [lockedCategories, setLockedCategories] = useState({});
  const [includedCategories, setIncludedCategories] = useState(() => {
    const initial = {};
    Object.keys(categories).forEach(key => {
      initial[key] = true;
    });
    return initial;
  });
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Aesthetic');
  const [expandedGroup, setExpandedGroup] = useState(2); // Start with "Aesthetic & Style"
  const [isGenerating, setIsGenerating] = useState(false);
  
  // User data state
  const [userCustomOptions, setUserCustomOptions] = useState({});
  const [userHiddenOptions, setUserHiddenOptions] = useState({});
  const [userDeletedOptions, setUserDeletedOptions] = useState({});
  const [userFavorites, setUserFavorites] = useState({});
  const [userSelectedOptions, setUserSelectedOptions] = useState({}); // Selected options per category from CategorySelectionModal
  const [trashAnimation, setTrashAnimation] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [sortedCategoryOptions, setSortedCategoryOptions] = useState({}); // Store sorted options per category
  const previousActiveCategoryRef = useRef(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // Filter to show only favorites
  const [manageMenuOpen, setManageMenuOpen] = useState(null); // category key or null
  const [addOptionModalOpen, setAddOptionModalOpen] = useState(null); // category key or null
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTitle, setNewOptionTitle] = useState('');
  const [showHiddenOptionsModal, setShowHiddenOptionsModal] = useState(null); // category key or null
  
  // Save/Load state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedSetsSidebarOpen, setSavedSetsSidebarOpen] = useState(false);
  const [favoritesSidebarOpen, setFavoritesSidebarOpen] = useState(false);
  const [installedPackagesModalOpen, setInstalledPackagesModalOpen] = useState(false);
  const [createSetModalOpen, setCreateSetModalOpen] = useState(false);
  const [photoToPromptOpen, setPhotoToPromptOpen] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState(new Set()); // Set of favorite IDs (category:optionId)
  const [unfavoritedInSession, setUnfavoritedInSession] = useState(new Set()); // Track items unfavorited in current session
  const favoritesSnapshotRef = useRef(null); // Snapshot of favorites when sidebar opens
  const [savedSets, setSavedSets] = useState([]);
  const [loadingSavedSets, setLoadingSavedSets] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    tags: '',
    isPublic: false
  });
  const [createSetFormData, setCreateSetFormData] = useState({
    name: '',
    promptText: '',
    category: ''
  });
  const [editingSet, setEditingSet] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(null); // set ID or null
  const [showFirstTimeExperience, setShowFirstTimeExperience] = useState(() => {
    // If the user is already authenticated, skip onboarding entirely
    if (user?.uid) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      return false;
    }
    // Otherwise, fall back to stored preference
    const shouldShow = localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
    if (shouldShow) {
      document.body.classList.add('intro-active');
    }
    return shouldShow;
  });

  // Track current route for navigation highlighting
  useEffect(() => {
    const updateRoute = () => {
      setCurrentRoute(window.location.hash || '');
    };
    updateRoute(); // Set initial route
    window.addEventListener('hashchange', updateRoute);
    return () => {
      window.removeEventListener('hashchange', updateRoute);
    };
  }, []);

  // Hide word-button-bar when intro is showing
  useEffect(() => {
    if (showFirstTimeExperience) {
      document.body.classList.add('intro-active');
    } else {
      document.body.classList.remove('intro-active');
    }
    return () => {
      document.body.classList.remove('intro-active');
    };
  }, [showFirstTimeExperience]);

  // Mark onboarding as complete once a user signs in
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      if (showFirstTimeExperience) {
        setShowFirstTimeExperience(false);
      }
    }
  }, [user, showFirstTimeExperience]);

  // Engagement tracking state
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [progressMessage, setProgressMessage] = useState(null);
  const [userStreak, setUserStreak] = useState(0);
  const [engagementStats, setEngagementStats] = useState(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Listen for body class changes to detect BuyCreditsModal open/close
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBuyCreditsModalOpen(document.body.classList.contains('buy-credits-modal-open'));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    // Initial check
    setBuyCreditsModalOpen(document.body.classList.contains('buy-credits-modal-open'));
    return () => observer.disconnect();
  }, []);

  // CRITICAL: Define mergedCategories BEFORE any useEffect that depends on it
  // This prevents TDZ (Temporal Dead Zone) violations during bundler minification
  
  // Merge default categories with user customOptions and filter hiddenOptions and deletedOptions
  // Also create a mapping from original indices to filtered indices
  const { mergedCategories, indexMapping } = useMemo(() => {
    try {
      const merged = {};
      const mapping = {};
      
      Object.keys(categories).forEach(categoryKey => {
        const defaultOptions = categories[categoryKey] || [];
        const customOptions = (userCustomOptions && userCustomOptions[categoryKey]) ? userCustomOptions[categoryKey] : [];
        const hiddenOptions = (userHiddenOptions && userHiddenOptions[categoryKey]) ? userHiddenOptions[categoryKey] : [];
        const deletedOptions = (userDeletedOptions && userDeletedOptions[categoryKey]) ? userDeletedOptions[categoryKey] : [];
        
        // Combine default and custom options
        const allOptions = [...defaultOptions, ...customOptions];
        
        // Create mapping from original index to filtered index
        const categoryMapping = {};
        let filteredIndex = 0;
        
        // Filter out hidden and deleted options (by index for default, by id for custom)
        const visibleOptions = allOptions.filter((option, originalIndex) => {
          const isDefaultOption = originalIndex < defaultOptions.length;
          
          // Check if hidden
          const isHidden = isDefaultOption
            ? hiddenOptions.includes(originalIndex)  // Default option - check by index
            : hiddenOptions.includes(option.id);     // Custom option - check by id
          
          // Check if deleted
          const isDeleted = isDefaultOption
            ? deletedOptions.includes(originalIndex)  // Default option - check by index
            : deletedOptions.includes(option.id);     // Custom option - check by id
          
          if (!isHidden && !isDeleted) {
            // Map original index to filtered index
            categoryMapping[originalIndex] = filteredIndex;
            filteredIndex++;
            return true;
          }
          return false;
        });
      
        merged[categoryKey] = visibleOptions;
        mapping[categoryKey] = categoryMapping;
      });
      return { mergedCategories: merged, indexMapping: mapping };
    } catch (error) {
      console.error('Error merging categories:', error);
      // Return categories as-is if merge fails
      return { mergedCategories: categories, indexMapping: {} };
    }
  }, [categories, userCustomOptions, userHiddenOptions, userDeletedOptions]);

  // Personalization state
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const sessionStartTime = useRef(Date.now());

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !user.uid) {
        // Reset user-specific state when logged out
        setEnabledClothingCategories([]);
        setUserPreferences(null);
        setHasCheckedClothingPreferences(false);
        hasShownClothingModalRef.current = false; // Reset modal tracking
        setLoadingUserData(false);
        return;
      }
      
      // Reset modal tracking when a new user logs in
      hasShownClothingModalRef.current = false;

      // Check if db is available
      if (!db) {
        console.error('Firestore database is not initialized');
        setLoadingUserData(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserCustomOptions(data.customOptions || {});
          setUserHiddenOptions(data.hiddenOptions || {});
          setUserDeletedOptions(data.deletedOptions || {});
          setUserFavorites(data.favorites || {});
          setUserSelectedOptions(data.selectedOptions || {});
          
          // Load engagement stats
          if (data.stats) {
            setUserStreak(data.stats.currentStreak || 0);
          }

          // Load personalization preferences
          const prefs = await getUserPreferences(user.uid);
          if (prefs) {
            setUserPreferences(prefs);
            
            // Load favorite categories
            const favorites = await getFavoriteCategories(user.uid, 5);
            setFavoriteCategories(favorites);
            
            // Load enabled clothing categories
            const enabledClothing = await getEnabledClothingCategories(user.uid);
            setEnabledClothingCategories(enabledClothing || []);
            setHasCheckedClothingPreferences(true);
            
            // Load enabled Face & Head categories
            const enabledFaceHead = await getEnabledFaceHeadCategories(user.uid);
            setEnabledFaceHeadCategories(enabledFaceHead || []);
            setHasCheckedFaceHeadPreferences(true);
            
            // Load enabled Aesthetic & Style categories
            const enabledAestheticStyle = await getEnabledAestheticStyleCategories(user.uid);
            setEnabledAestheticStyleCategories(enabledAestheticStyle || []);
            setHasCheckedAestheticStylePreferences(true);
            
            // Load enabled Framing & Composition categories
            const enabledFramingComposition = await getEnabledFramingCompositionCategories(user.uid);
            setEnabledFramingCompositionCategories(enabledFramingComposition || []);
            setHasCheckedFramingCompositionPreferences(true);
            
            // Load enabled Background & Environment categories
            const enabledBackgroundEnvironment = await getEnabledBackgroundEnvironmentCategories(user.uid);
            setEnabledBackgroundEnvironmentCategories(enabledBackgroundEnvironment || []);
            setHasCheckedBackgroundEnvironmentPreferences(true);
            
            // Load enabled Body & Pose categories
            const enabledBodyPose = await getEnabledBodyPoseCategories(user.uid);
            setEnabledBodyPoseCategories(enabledBodyPose || []);
            setHasCheckedBodyPosePreferences(true);
            
            // Load hidden category groups
            const hiddenGroups = await getHiddenCategoryGroups(user.uid);
            setHiddenCategoryGroups(hiddenGroups || []);
            
            // Set default expanded groups based on preferences
            const defaultGroups = await getDefaultExpandedGroups(user.uid, [2]);
            setExpandedGroup(defaultGroups[0] || 2);
          } else {
            // No preferences yet, mark as checked so we can show modal on first expand
            setHasCheckedClothingPreferences(true);
            setHasCheckedFaceHeadPreferences(true);
            setHasCheckedAestheticStylePreferences(true);
            setHasCheckedFramingCompositionPreferences(true);
            setHasCheckedBackgroundEnvironmentPreferences(true);
          }
        } else {
          // Initialize user document if it doesn't exist (new account)
          await setDoc(userDocRef, {
            customOptions: {},
            hiddenOptions: {},
            favorites: {}
          });
          setUserCustomOptions({});
          setUserHiddenOptions({});
          setUserFavorites({});
          
          // Start with empty selections for new account - no default prompt
          setSelections({});
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set empty defaults on error to prevent component crash
        setUserCustomOptions({});
        setUserHiddenOptions({});
        setUserFavorites({});
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user]);

  // Track session duration on unmount
  useEffect(() => {
    return () => {
      if (user?.uid && sessionStartTime.current) {
        const duration = (Date.now() - sessionStartTime.current) / 1000; // seconds
        trackSessionDuration(user.uid, duration);
      }
    };
  }, [user]);

  // Update streak on mount and daily
  useEffect(() => {
    if (user?.uid) {
      updateStreak(user.uid).then(result => {
        const streak = typeof result === 'object' ? result.streak : result;
        const achievements = typeof result === 'object' ? result.achievements : [];
        setUserStreak(streak || 0);
        // Show achievement notification if any were unlocked
        if (achievements && achievements.length > 0) {
          setCurrentAchievement(achievements[0]);
        }
      });
    }
  }, [user]);

  // Adjust selections when mergedCategories change to ensure valid indices
  // Map original selection indices to filtered array indices
  useEffect(() => {
    if (loadingUserData) return;
    
    setSelections(prev => {
      const updated = { ...prev };
      let changed = false;
      
      Object.keys(mergedCategories).forEach(category => {
        const currentIndex = prev[category] || 0;
        const categoryMapping = indexMapping[category] || {};
        const maxIndex = mergedCategories[category]?.length - 1 || 0;
        
        // If there's no mapping (no hidden options), just ensure index is in bounds
        if (Object.keys(categoryMapping).length === 0) {
        if (currentIndex > maxIndex && maxIndex >= 0) {
          updated[category] = maxIndex;
          changed = true;
          }
          return; // Continue to next category
        }
        
        // Check if current index is already a valid filtered index
        // (i.e., it's within bounds and the mapping contains it as a value)
        const mappedValues = Object.values(categoryMapping);
        const isAlreadyFilteredIndex = currentIndex >= 0 && currentIndex <= maxIndex && 
                                       mappedValues.includes(currentIndex);
        
        if (isAlreadyFilteredIndex) {
          // Index is already in filtered space, just ensure it's in bounds
          if (currentIndex > maxIndex && maxIndex >= 0) {
            updated[category] = maxIndex;
            changed = true;
          }
        } else {
          // Index needs to be mapped from original to filtered space
          // Find the original index that maps to current selection, or find closest
          let targetFilteredIndex = currentIndex;
          
          // First, try to find if currentIndex was an original index that needs mapping
          if (categoryMapping.hasOwnProperty(currentIndex)) {
            targetFilteredIndex = categoryMapping[currentIndex];
          } else {
            // Current index doesn't exist in mapping, find closest valid index
            const mappedIndices = Object.keys(categoryMapping).map(k => parseInt(k)).sort((a, b) => a - b);
            if (mappedIndices.length > 0) {
              // Find the closest valid original index <= currentIndex
              let closestOriginalIndex = mappedIndices[0];
              for (const origIdx of mappedIndices) {
                if (origIdx <= currentIndex) {
                  closestOriginalIndex = origIdx;
                } else {
                  break;
                }
              }
              targetFilteredIndex = categoryMapping[closestOriginalIndex];
            } else if (maxIndex >= 0) {
              targetFilteredIndex = 0;
            }
          }
          
          // Ensure the target index is within bounds
          if (targetFilteredIndex > maxIndex && maxIndex >= 0) {
            targetFilteredIndex = maxIndex;
          }
          
          if (updated[category] !== targetFilteredIndex) {
            updated[category] = targetFilteredIndex;
            changed = true;
          }
        }
      });
      
      return changed ? updated : prev;
    });
  }, [mergedCategories, indexMapping, loadingUserData]);

  // Categories auto-excluded because the selected Aesthetic already covers them.
  // Shared between prompt assembly and UI so users can see why categories are skipped.
  const autoExcludedCategories = useMemo(() => {
    const aestheticItem = mergedCategories['Aesthetic']?.[selections['Aesthetic']];
    const isComprehensive =
      includedCategories['Aesthetic'] && aestheticItem && aestheticItem.comprehensive;
    if (!isComprehensive) return [];
    return comprehensiveAestheticOverrides;
  }, [selections, includedCategories, mergedCategories]);

  // Memoized prompt generation
  const generatedPrompt = useMemo(() => {
    // Return empty string if no selections
    if (!selections || Object.keys(selections).length === 0) {
      return '';
    }

    const parts = Object.entries(selections)
      .filter(([category]) => {
        if (!includedCategories[category]) return false;
        // Skip categories that the comprehensive aesthetic already covers
        if (autoExcludedCategories.includes(category)) {
          return false;
        }
        return true;
      })
      .map(([category, index]) => {
        const item = mergedCategories[category]?.[index];
        if (!item) return '';
        return typeof item === 'string' ? item : item.prompt;
      })
      .filter(part => part && part.trim()); // Filter out empty parts
    return parts.length > 0 ? parts.join(' ') : '';
  }, [selections, includedCategories, mergedCategories, autoExcludedCategories]);

  // Save prompt to localStorage for Pose Studio (only if prompt is not empty)
  useEffect(() => {
    if (generatedPrompt && generatedPrompt.trim()) {
      localStorage.setItem('currentPrompt', generatedPrompt);
    } else {
      // Clear localStorage if prompt is empty
      localStorage.removeItem('currentPrompt');
    }
  }, [generatedPrompt]);

  // Optimized event handlers with useCallback
  const navigate = useCallback((category, direction) => {
    setSelections(prev => {
      const maxIndex = mergedCategories[category]?.length - 1 || 0;
      const currentIndex = prev[category] || 0;
      let newIndex;
      
      if (direction === 'next') {
        newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      }
      
      return { ...prev, [category]: newIndex };
    });
  }, [mergedCategories]);

  // Keyboard navigation handlers
  const navigateNextCategory = useCallback(() => {
    const allCategories = Object.keys(categoryDisplayNames);
    const currentIndex = allCategories.indexOf(activeCategory);
    const nextIndex = (currentIndex + 1) % allCategories.length;
    handleCategorySelect(allCategories[nextIndex]);
  }, [activeCategory, categoryDisplayNames]);

  const navigatePrevCategory = useCallback(() => {
    const allCategories = Object.keys(categoryDisplayNames);
    const currentIndex = allCategories.indexOf(activeCategory);
    const prevIndex = (currentIndex - 1 + allCategories.length) % allCategories.length;
    handleCategorySelect(allCategories[prevIndex]);
  }, [activeCategory, categoryDisplayNames]);

  const navigateNextOption = useCallback(() => {
    navigate(activeCategory, 'next');
  }, [activeCategory, navigate]);

  const navigatePrevOption = useCallback(() => {
    navigate(activeCategory, 'prev');
  }, [activeCategory, navigate]);

  const handleRandomizeCurrent = useCallback(() => {
    if (!lockedCategories[activeCategory] && mergedCategories[activeCategory]?.length > 0) {
      setSelections(prev => ({
        ...prev,
        [activeCategory]: Math.floor(Math.random() * mergedCategories[activeCategory].length)
      }));
      triggerFeedback(FEEDBACK_TYPES.RANDOMIZE, {
        intensity: 'medium',
        message: 'Randomized current category',
      });
    }
  }, [activeCategory, lockedCategories, mergedCategories]);

  // Select option directly (for word buttons)
  // The active category ALWAYS displays in UNSORTED order (getCategoryOptions returns mergedCategories)
  // So the index from clicking is ALREADY the original index - no conversion needed!
  const selectOption = useCallback((category, index) => {
    // For active category: index is already correct for mergedCategories[category]
    // For inactive categories: we need to map from sorted view index to original index
    let originalIndex = index;
    
    if (category !== activeCategory) {
      // This is an inactive category - convert from sorted view index to original index
      const sortedOptions = sortedCategoryOptions?.[category];
      const unsortedOptions = mergedCategories?.[category] || [];
      if (sortedOptions && sortedOptions[index]) {
        const clickedOption = sortedOptions[index];
        const optionIdentifier = clickedOption?.title || clickedOption?.prompt || clickedOption;
        originalIndex = unsortedOptions.findIndex(opt => 
          (opt?.title || opt?.prompt || opt) === optionIdentifier
        );
        // Fallback to clicked index if lookup fails
        if (originalIndex === -1) originalIndex = index;
      }
    }
    
    // Validate bounds before storing
    const maxIndex = (mergedCategories?.[category]?.length || 1) - 1;
    const safeIndex = Math.min(Math.max(0, originalIndex), maxIndex);
    
    setSelections(prev => ({
      ...prev,
      [category]: safeIndex
    }));
    
    // Track category exploration for engagement
    if (user?.uid && category) {
      const categoryDisplayName = categoryDisplayNames[category] || category;
      trackCategoryExplored(user.uid, categoryDisplayName);
      trackCategoryUsage(user.uid, category);
    }
    
    // Visual feedback for selection
    triggerFeedback(FEEDBACK_TYPES.SELECTION, {
      category: categoryColors[category],
      intensity: 'medium',
    });
  }, [activeCategory, mergedCategories, sortedCategoryOptions, showFavoritesOnly, userFavorites, user, categoryDisplayNames, categoryColors]);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    // Allow null to clear selection when switching to empty groups
    setActiveCategory(category || null);

    // Close mobile sidebar when a category is tapped
    if (window.innerWidth <= 768 && category) {
      setMobileSidebarOpen(false);
    }

    // Track category usage for personalization (only if category exists)
    if (user?.uid && category) {
      trackCategoryUsage(user.uid, category);
    }

    // Visual feedback for category switch (only if category exists)
    if (category) {
      triggerFeedback(FEEDBACK_TYPES.CATEGORY_SWITCH, {
        category: categoryColors[category],
        intensity: 'medium',
      });
    }
  }, [user, categoryColors]);

  const toggleLock = useCallback((category) => {
    setLockedCategories(prev => {
      const isLocked = !prev[category];
      
      // Visual feedback
      triggerFeedback(isLocked ? FEEDBACK_TYPES.LOCK : FEEDBACK_TYPES.UNLOCK, {
        category: categoryColors[category],
        intensity: 'medium',
        message: isLocked ? 'Category locked' : 'Category unlocked',
      });
      
      return {
        ...prev,
        [category]: isLocked
      };
    });
  }, [categoryColors]);

  const toggleInclude = useCallback((category) => {
    setIncludedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const randomizeAll = useCallback(() => {
    setSelections(prev => {
      const newSelections = { ...prev };
      Object.keys(mergedCategories).forEach(category => {
        if (!lockedCategories[category] && mergedCategories[category]?.length > 0) {
          newSelections[category] = Math.floor(Math.random() * mergedCategories[category].length);
        }
      });
      return newSelections;
    });
    
    // Visual feedback
    triggerFeedback(FEEDBACK_TYPES.RANDOMIZE, {
      intensity: 'strong',
      message: 'Randomized all categories',
    });
    
    // Trigger figure spin animation
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 800);
    
    // Track prompt generation for engagement
    if (user?.uid) {
      const categoryCount = Object.keys(mergedCategories).filter(cat => 
        includedCategories[cat] !== false
      ).length;
      trackPromptGenerated(user.uid, categoryCount).then(async (newAchievements) => {
        if (newAchievements && newAchievements.length > 0) {
          // Show first achievement
          setCurrentAchievement(newAchievements[0]);
        }
        // Update streak
        const streakResult = await updateStreak(user.uid);
        const streak = typeof streakResult === 'object' ? streakResult.streak : streakResult;
        const streakAchievements = typeof streakResult === 'object' ? streakResult.achievements : [];
        setUserStreak(streak || 0);
        // Show achievement notification if any were unlocked from streak
        if (streakAchievements && streakAchievements.length > 0 && (!newAchievements || newAchievements.length === 0)) {
          setCurrentAchievement(streakAchievements[0]);
        }
      });
    }
  }, [mergedCategories, lockedCategories, user, includedCategories]);

  // Improved clipboard function with error handling and fallback
  const copyToClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Failed to copy to clipboard. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      }
      
      // Visual feedback
      triggerFeedback(FEEDBACK_TYPES.COPY, {
        intensity: 'strong',
        message: 'Prompt copied!',
      });

      // Record to prompt history
      const selSummary = {};
      Object.entries(selections).forEach(([cat, idx]) => {
        if (includedCategories[cat]) {
          const item = mergedCategories[cat]?.[idx];
          if (item) selSummary[cat] = item.title || item.name || `Option ${idx + 1}`;
        }
      });
      promptHistory.addEntry(generatedPrompt, selSummary);

      // Track engagement - prompt copied
      if (user?.uid) {
        const categoryCount = Object.keys(mergedCategories).filter(cat => 
          includedCategories[cat] !== false
        ).length;
        
        trackPromptCopied(user.uid, categoryCount).then(async (newAchievements) => {
          if (newAchievements && newAchievements.length > 0) {
            setCurrentAchievement(newAchievements[0]);
          }
          
          // Get progress message
          const stats = await getUserEngagementStats(user.uid);
          if (stats?.stats) {
            const progressMsg = getProgressMessage(stats.stats);
            if (progressMsg) {
              setProgressMessage(progressMsg);
              setTimeout(() => setProgressMessage(null), 4000);
            }
            setUserStreak(stats.stats.currentStreak || 0);
          }
        });
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('Failed to copy to clipboard. Please select and copy manually.');
    }
  }, [generatedPrompt, user, mergedCategories, includedCategories]);

  // Save user data to Firestore
  const saveUserData = useCallback(async (updates) => {
    if (!user || !user.uid) {
      console.error('No user logged in');
      alert('Please log in to save your changes.');
      return;
    }
    if (!db) {
      console.error('Firestore database is not initialized');
      alert('Database is not available. Please refresh the page.');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      // Use setDoc with merge to create doc if it doesn't exist
      await setDoc(userDocRef, updates, { merge: true });
      console.log('User data saved successfully:', Object.keys(updates));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }, [user]);

  // Hide selected option
  const hideOption = useCallback(async (category, visibleIndex) => {
    if (!user) return;
    
    // Get the option from the visible (merged) array
    const visibleOption = mergedCategories[category]?.[visibleIndex];
    if (!visibleOption) return;
    
    const currentHidden = userHiddenOptions[category] || [];
    const defaultOptions = categories[category] || [];
    const customOptions = userCustomOptions[category] || [];
    
    // Find the original index/id of this option
    let hiddenValue = null;
    
    // Get the option text/prompt for comparison
    const optionText = typeof visibleOption === 'string' 
      ? visibleOption 
      : (visibleOption.prompt || visibleOption.title || '');
    
    // Check if it's a default option by comparing text
    let foundInDefaults = false;
    for (let i = 0; i < defaultOptions.length; i++) {
      const defaultOpt = defaultOptions[i];
      const defaultText = typeof defaultOpt === 'string' 
        ? defaultOpt 
        : (defaultOpt.prompt || defaultOpt.title || '');
      
      if (defaultText === optionText || (visibleOption?.id && defaultOpt?.id === visibleOption.id)) {
        hiddenValue = i;
        foundInDefaults = true;
        break;
      }
    }
    
    // If not found in defaults, it's a custom option
    if (!foundInDefaults && visibleOption?.id) {
      hiddenValue = visibleOption.id;
    }
    
    if (hiddenValue === null || currentHidden.includes(hiddenValue)) {
      return; // Already hidden or not found
    }
    
    const newHidden = [...currentHidden, hiddenValue];
    const updatedHidden = { ...userHiddenOptions, [category]: newHidden };
    setUserHiddenOptions(updatedHidden);
    
    // Adjust selection if needed
    setSelections(prev => {
      const current = prev[category] || 0;
      const visibleCount = mergedCategories[category]?.length || 0;
      if (current >= visibleCount - 1 && visibleCount > 1) {
        return { ...prev, [category]: Math.max(0, visibleCount - 2) };
      } else if (visibleCount === 1) {
        return { ...prev, [category]: 0 };
      }
      return prev;
    });
    
    try {
      await saveUserData({ hiddenOptions: updatedHidden });
      setManageMenuOpen(null);
    } catch (error) {
      console.error('Error saving hidden options:', error);
      // Revert state on error to prevent data loss
      setUserHiddenOptions(userHiddenOptions);
      alert('Failed to save changes. Please try again.');
    }
  }, [user, userHiddenOptions, userCustomOptions, categories, mergedCategories, saveUserData]);

  // Show hidden options modal
  const handleShowHiddenOptions = useCallback((category) => {
    setShowHiddenOptionsModal(category);
    setManageMenuOpen(null);
  }, []);

  // Unhide an option
  const unhideOption = useCallback(async (category, hiddenValue) => {
    if (!user) return;
    
    const currentHidden = userHiddenOptions[category] || [];
    const newHidden = currentHidden.filter(v => v !== hiddenValue);
    
    const updatedHidden = { ...userHiddenOptions, [category]: newHidden };
    setUserHiddenOptions(updatedHidden);
    
    try {
      await saveUserData({ hiddenOptions: updatedHidden });
    } catch (error) {
      console.error('Error saving unhidden options:', error);
      // Revert state on error to prevent data loss
      setUserHiddenOptions(userHiddenOptions);
      alert('Failed to save changes. Please try again.');
    }
  }, [user, userHiddenOptions, saveUserData]);

  // Trash an option (move to deletedOptions)
  const trashOption = useCallback(async (category, option, filteredIndex, buttonElement) => {
    console.log('[trashOption] Called with:', { category, option, filteredIndex, user: !!user, hasButtonElement: !!buttonElement });

    if (!requireAuth('trash option')) return;
    
    if (!option) {
      console.error('[trashOption] Option is null or undefined');
      return;
    }

    // Get button position for animation BEFORE removing it
    let startX = 0, startY = 0;
    let buttonText = '';
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      // Extract button text
      const textElement = buttonElement.querySelector('span');
      buttonText = textElement ? textElement.textContent : '';
    }

    // Find trash target position - prioritize Packages button/pill
    let endX = window.innerWidth - 100; // Default to top right
    let endY = 60; // Default to header area
    
    // First, try to find the Packages button/modal trigger (this is the packages pill)
    const packagesButton = document.querySelector('[data-packages-button]');
    if (packagesButton) {
      const packagesRect = packagesButton.getBoundingClientRect();
      endX = packagesRect.left + packagesRect.width / 2;
      endY = packagesRect.top + packagesRect.height / 2;
      console.log('[trashOption] Found Packages button/pill at:', endX, endY);
    } else {
      // Fallback: Try to find "Trashed Options" tab in packages modal (if modal is open)
      const trashTab = document.querySelector('[data-trash-tab="trashed-options"]');
      if (trashTab) {
        const trashRect = trashTab.getBoundingClientRect();
        endX = trashRect.left + trashRect.width / 2;
        endY = trashRect.top + trashRect.height / 2;
        console.log('[trashOption] Found Trashed Options tab at:', endX, endY);
      } else {
        // Last fallback: Try to find any button with "Packages" text
        const allButtons = Array.from(document.querySelectorAll('button'));
        const packagesTextButton = allButtons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('package') && btn.offsetParent !== null; // visible
        });
        if (packagesTextButton) {
          const packagesRect = packagesTextButton.getBoundingClientRect();
          endX = packagesRect.left + packagesRect.width / 2;
          endY = packagesRect.top + packagesRect.height / 2;
          console.log('[trashOption] Found Packages button by text at:', endX, endY);
        } else {
          console.log('[trashOption] No packages button found, using default position');
        }
      }
    }
    
    // Determine the identifier to use
    // For custom options (objects with id), use the id
    // For default options (strings), find the original index
    let identifier;
    const defaultOptions = categories[category] || [];
    
    if (typeof option === 'object' && option.id) {
      // Custom option - use id
      identifier = option.id;
      console.log('[trashOption] Custom option, using id:', identifier);
    } else {
      // Default option - need to find original index
      // The option could be a string or an object without id
      let optionText;
      if (typeof option === 'string') {
        optionText = option;
      } else if (option && typeof option === 'object') {
        optionText = option.text || option.prompt || option.title || String(option);
      } else {
        optionText = String(option);
      }
      
      console.log('[trashOption] Looking for default option:', optionText, 'in category:', category);
      console.log('[trashOption] Default options count:', defaultOptions.length);
      
      const originalIndex = defaultOptions.findIndex(opt => {
        if (typeof opt === 'string') {
          return opt === optionText;
        } else if (opt && typeof opt === 'object') {
          return opt === optionText || opt.text === optionText || opt.prompt === optionText || opt.title === optionText;
        }
        return false;
      });
      
      if (originalIndex === -1) {
        console.error('[trashOption] Could not find original index for option:', optionText);
        console.error('[trashOption] Available default options:', defaultOptions.slice(0, 5));
        return;
      }
      
      identifier = originalIndex;
      console.log('[trashOption] Found original index:', identifier);
    }
    
    // Deselect option from selectedOptions (remove from selectedOptions)
    const currentSelected = userSelectedOptions[category];
    let updatedSelected = { ...userSelectedOptions };
    
    // If categorySelected is undefined, initialize with all options except this one
    if (currentSelected === undefined) {
      // Get all options for this category to initialize selectedOptions
      const allOptions = mergedCategories[category] || [];
      const allIdentifiers = allOptions.map((opt, idx) => {
        if (typeof opt === 'object' && opt.id) {
          return opt.id;
        }
        return idx;
      });
      // Remove the deselected one
      updatedSelected[category] = allIdentifiers.filter(id => id !== identifier);
    } else if (Array.isArray(currentSelected) && currentSelected.includes(identifier)) {
      // Remove the deselected option
      updatedSelected[category] = currentSelected.filter(id => id !== identifier);
    } else {
      // Option already deselected, nothing to do
      console.log('[trashOption] Option already deselected');
      return;
    }
    
    // Check if the trashed option is the currently selected one and calculate next option
    const currentStoredIndex = selections[category] || 0;
    const originalOptions = mergedCategories[category] || [];
    const currentlySelectedOption = originalOptions[currentStoredIndex];
    
    // Get current filtered options before trashing (to find the trashed option's position)
    const sortedOptions = sortedCategoryOptions[category] || mergedCategories[category] || [];
    const favorites = userFavorites[category] || [];
    const currentSelectedOptions = userSelectedOptions[category];
    
    // Calculate current filtered options (before removing the trashed one)
    let currentFilteredOptions = sortedOptions;
    if (currentSelectedOptions !== undefined && Array.isArray(currentSelectedOptions) && currentSelectedOptions.length > 0) {
      currentFilteredOptions = sortedOptions.filter((opt) => {
        const originalIndex = mergedCategories[category]?.findIndex(o => {
          if (typeof o === 'object' && typeof opt === 'object') {
            return (o.id && opt.id && o.id === opt.id) || 
                   (o.title && opt.title && o.title === opt.title) ||
                   (o.prompt && opt.prompt && o.prompt === opt.prompt) ||
                   (o.text && opt.text && o.text === opt.text);
          }
          return o === opt;
        });
        if (originalIndex === -1) {
          if (typeof opt === 'object' && opt.id) {
            return currentSelectedOptions.includes(opt.id);
          }
          return false;
        }
        const originalOption = mergedCategories[category][originalIndex];
        const optionId = (typeof originalOption === 'object' && originalOption?.id) 
          ? originalOption.id 
          : originalIndex;
        return currentSelectedOptions.includes(optionId);
      });
    }
    
    // Find the trashed option's index in the current filtered list
    const trashedIndexInFiltered = currentFilteredOptions.findIndex(opt => {
      if (typeof opt === 'object' && typeof option === 'object') {
        return (opt.id && option.id && opt.id === option.id) ||
               (opt.title && option.title && opt.title === option.title) ||
               (opt.prompt && option.prompt && opt.prompt === option.prompt) ||
               (opt.text && option.text && opt.text === option.text);
      }
      return opt === option;
    });
    
    // Check if the trashed option matches the currently selected option
    let isCurrentlySelected = false;
    if (typeof option === 'object' && option.id && typeof currentlySelectedOption === 'object' && currentlySelectedOption?.id) {
      isCurrentlySelected = option.id === currentlySelectedOption.id;
    } else if (typeof option === 'string' && typeof currentlySelectedOption === 'string') {
      isCurrentlySelected = option === currentlySelectedOption;
    } else if (typeof option === 'object' && typeof currentlySelectedOption === 'object') {
      isCurrentlySelected = (option.title && currentlySelectedOption.title && option.title === currentlySelectedOption.title) ||
                           (option.prompt && currentlySelectedOption.prompt && option.prompt === currentlySelectedOption.prompt) ||
                           (option.text && currentlySelectedOption.text && option.text === currentlySelectedOption.text);
    }
    
    // Calculate the next option before updating state
    let nextOriginalIndex = null;
    if (isCurrentlySelected || (trashedIndexInFiltered !== -1 && category === activeCategory)) {
      // Calculate filtered options after removing the trashed one
      const filteredAfterTrash = currentFilteredOptions.filter(opt => {
        if (typeof opt === 'object' && typeof option === 'object') {
          return !((opt.id && option.id && opt.id === option.id) ||
                   (opt.title && option.title && opt.title === option.title) ||
                   (opt.prompt && option.prompt && opt.prompt === option.prompt) ||
                   (opt.text && option.text && opt.text === option.text));
        }
        return opt !== option;
      });
      
      if (filteredAfterTrash.length > 0) {
        // Use the same index position, or the last available if it was the last one
        const nextIndex = Math.min(trashedIndexInFiltered, filteredAfterTrash.length - 1);
        const nextOption = filteredAfterTrash[nextIndex];
        
        if (nextOption) {
          // Find the original index of this option
          const foundIndex = originalOptions.findIndex(opt => {
            if (typeof opt === 'object' && typeof nextOption === 'object') {
              return (opt.id && nextOption.id && opt.id === nextOption.id) ||
                     (opt.title && nextOption.title && opt.title === nextOption.title) ||
                     (opt.prompt && nextOption.prompt && opt.prompt === nextOption.prompt) ||
                     (opt.text && nextOption.text && opt.text === nextOption.text);
            }
            return opt === nextOption;
          });
          
          if (foundIndex !== -1) {
            nextOriginalIndex = foundIndex;
          }
        }
      }
    }
    
    // Check if all options are trashed (empty array) - if so, uncheck the category
    const categorySelectedOptions = updatedSelected[category];
    if (Array.isArray(categorySelectedOptions) && categorySelectedOptions.length === 0) {
      // All options trashed - uncheck the category checkbox
      // Map category to its category group
      const categoryToGroupMap = {
        'Background': { group: 'backgroundEnvironment', setter: setEnabledBackgroundEnvironmentCategories, updater: updateEnabledBackgroundEnvironmentCategories },
        'Props': { group: 'backgroundEnvironment', setter: setEnabledBackgroundEnvironmentCategories, updater: updateEnabledBackgroundEnvironmentCategories },
        'Framing': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'Perspective': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'CameraAngle': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'CameraType': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'Aesthetic': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'Lighting': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'ColorPalette': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'Texture': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'Mood': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'PhotoStyle': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'HeadPosition': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'Eyes': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'Mouth': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'Hair': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'BodyPose': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Torso': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Arms': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Hands': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Legs': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Feet': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'BodySize': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
      };
      
      const categoryGroup = categoryToGroupMap[category];
      if (categoryGroup) {
        // Get current enabled categories for this group
        const getCurrentEnabled = async () => {
          try {
            if (categoryGroup.group === 'backgroundEnvironment') {
              return await getEnabledBackgroundEnvironmentCategories(user.uid);
            } else if (categoryGroup.group === 'framingComposition') {
              return await getEnabledFramingCompositionCategories(user.uid);
            } else if (categoryGroup.group === 'aestheticStyle') {
              return await getEnabledAestheticStyleCategories(user.uid);
            } else if (categoryGroup.group === 'faceHead') {
              return await getEnabledFaceHeadCategories(user.uid);
            } else if (categoryGroup.group === 'bodyPose') {
              return await getEnabledBodyPoseCategories(user.uid);
            }
            return [];
          } catch (error) {
            console.error('[trashOption] Error getting enabled categories:', error);
            return [];
          }
        };
        
        getCurrentEnabled().then(currentEnabled => {
          // Remove the category from enabled list
          const updatedEnabled = currentEnabled.filter(cat => cat !== category);
          
          // Update state
          categoryGroup.setter(updatedEnabled);
          
          // Save to Firestore
          if (user?.uid) {
            categoryGroup.updater(user.uid, updatedEnabled).catch(error => {
              console.error('[trashOption] Error updating enabled categories:', error);
            });
          }
        });
      }
    }
    
    // Update state immediately - remove the option from the list so layout can shift
    // The trashed option will be rendered as an overlay that flies away
    setUserSelectedOptions(updatedSelected);
    
    // If we calculated a next option, update the selection
    if (nextOriginalIndex !== null) {
      setSelections(prev => ({
        ...prev,
        [category]: nextOriginalIndex
      }));
    } else if (isCurrentlySelected) {
      // No options left, set to 0
      setSelections(prev => ({
        ...prev,
        [category]: 0
      }));
    }
    
    // Start animation - the button will be removed from list but rendered as overlay that flies away
    setTrashAnimation({
      startX,
      startY,
      endX,
      endY,
      buttonElement: buttonElement,
      buttonText: buttonText,
    });

    // Wait for animation to complete (1.2 seconds for the fly animation)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Clear animation
    setTrashAnimation(null);

    // Save to Firestore in the background
    try {
      await saveUserData({ 
        selectedOptions: updatedSelected
      });
      console.log('[trashOption] Successfully saved selectedOptions to Firestore');
      // Don't reload data - we already have the correct state
    } catch (error) {
      console.error('[trashOption] Error saving to Firestore:', error);
      // On error, revert the state change
      setUserSelectedOptions(userSelectedOptions);
      alert('Failed to deselect option. Please try again.');
      return;
    }
  }, [user, userSelectedOptions, mergedCategories, categories, saveUserData, selections, activeCategory, sortedCategoryOptions, userFavorites, setEnabledBackgroundEnvironmentCategories, setEnabledFramingCompositionCategories, setEnabledAestheticStyleCategories, setEnabledFaceHeadCategories, setEnabledBodyPoseCategories]);

  // Helper function to check auth before premium actions
  // Must be defined before functions that use it
  const requireAuth = useCallback((action) => {
    if (!user || !user.uid) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [user]);

  // Add custom option
  const handleAddCustomOption = useCallback((category) => {
    setAddOptionModalOpen(category);
    setManageMenuOpen(null);
  }, []);

  const saveCustomOption = useCallback(async (category) => {
    if (!requireAuth('save custom option')) return;
    if (!newOptionText.trim()) return;
    
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOption = {
      id: customId,
      title: newOptionTitle.trim() || newOptionText.trim().substring(0, 50) || 'Custom Option',
      prompt: newOptionText.trim()
    };
    
    const currentCustom = userCustomOptions[category] || [];
    const updatedCustom = {
      ...userCustomOptions,
      [category]: [...currentCustom, newOption]
    };
    
    setUserCustomOptions(updatedCustom);
    setNewOptionText('');
    setNewOptionTitle('');
    setAddOptionModalOpen(null);
    
    try {
      await saveUserData({ customOptions: updatedCustom });
    } catch (error) {
      console.error('Error saving custom option:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(userCustomOptions);
      setNewOptionText(newOptionText);
      setNewOptionTitle(newOptionTitle);
      setAddOptionModalOpen(category);
      alert('Failed to save custom option. Please try again.');
    }
  }, [requireAuth, user, newOptionText, newOptionTitle, userCustomOptions, saveUserData]);

  // Save option from Photo-to-Prompt analysis
  const savePhotoToPromptOption = useCallback(async (category, { title, prompt }) => {
    if (!requireAuth('save analyzed prompt')) return;

    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOption = { id: customId, title, prompt };

    const currentCustom = userCustomOptions[category] || [];
    const updatedCustom = {
      ...userCustomOptions,
      [category]: [...currentCustom, newOption],
    };

    setUserCustomOptions(updatedCustom);

    try {
      await saveUserData({ customOptions: updatedCustom });
    } catch (error) {
      console.error('Error saving analyzed prompt:', error);
      setUserCustomOptions(userCustomOptions);
      alert('Failed to save. Please try again.');
    }
  }, [requireAuth, userCustomOptions, saveUserData]);

  // Save Create Set (custom prompt to category)
  const saveCreateSet = useCallback(async () => {
    if (!requireAuth('create set')) return;
    
    if (!createSetFormData.name.trim() || !createSetFormData.promptText.trim() || !createSetFormData.category) {
      alert('Please fill in all fields: name, prompt text, and category.');
      return;
    }
    
    const setName = createSetFormData.name.trim();
    const setPromptText = createSetFormData.promptText.trim();
    const setCategory = createSetFormData.category;
    
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOption = {
      id: customId,
      title: setName,
      prompt: setPromptText
    };
    
    const currentCustom = userCustomOptions[setCategory] || [];
    const updatedCustom = {
      ...userCustomOptions,
      [setCategory]: [...currentCustom, newOption]
    };
    
    const previousCustom = userCustomOptions;
    setUserCustomOptions(updatedCustom);
    setCreateSetFormData({ name: '', promptText: '', category: '' });
    setCreateSetModalOpen(false);
    
    try {
      await saveUserData({ customOptions: updatedCustom });
      alert(`"${setName}" has been added to ${categoryDisplayNames[setCategory] || setCategory}!`);
    } catch (error) {
      console.error('Error saving create set:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(previousCustom);
      setCreateSetFormData({ name: setName, promptText: setPromptText, category: setCategory });
      setCreateSetModalOpen(true);
      alert('Failed to save. Please try again.');
    }
  }, [requireAuth, user, createSetFormData, userCustomOptions, saveUserData, categoryDisplayNames]);

  // Delete a custom option
  const deleteCustomOption = useCallback(async (category, optionId) => {
    if (!user) {
      alert('Please log in to delete options.');
      return;
    }
    
    const currentCustom = userCustomOptions[category] || [];
    const updatedCategoryOptions = currentCustom.filter(opt => opt.id !== optionId);
    
    const updatedCustom = {
      ...userCustomOptions,
      [category]: updatedCategoryOptions
    };
    
    // If no custom options left in category, remove the category key
    if (updatedCategoryOptions.length === 0) {
      delete updatedCustom[category];
    }
    
    const previousCustom = userCustomOptions;
    setUserCustomOptions(updatedCustom);
    
    // Adjust selection if needed
    setSelections(prev => {
      const current = prev[category] || 0;
      const newLength = mergedCategories[category]?.length - 1 || 0;
      if (current >= newLength && newLength > 0) {
        return { ...prev, [category]: newLength - 1 };
      }
      return prev;
    });
    
    try {
      await saveUserData({ customOptions: updatedCustom });
    } catch (error) {
      console.error('Error deleting custom option:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(previousCustom);
      alert('Failed to delete option. Please try again.');
    }
  }, [user, userCustomOptions, mergedCategories, saveUserData]);

  // Toggle favorite option
  const toggleFavorite = useCallback(async (category, optionId) => {
    if (!requireAuth('favorite')) return;
    
    const currentFavorites = userFavorites[category] || [];
    const isFavorite = currentFavorites.includes(optionId);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = currentFavorites.filter(id => id !== optionId);
    } else {
      newFavorites = [...currentFavorites, optionId];
    }
    
    const updatedFavorites = {
      ...userFavorites,
      [category]: newFavorites
    };
    
    setUserFavorites(updatedFavorites);
    try {
      await saveUserData({ favorites: updatedFavorites });
    } catch (error) {
      console.error('Error saving favorites:', error);
      // Revert state on error to prevent data loss
      setUserFavorites(userFavorites);
      alert('Failed to save favorite. Please try again.');
    }
  }, [requireAuth, user, userFavorites, saveUserData]);

  // Reset category to defaults
  const resetCategoryToDefaults = useCallback(async (category) => {
    if (!user) {
      alert('Please log in to reset options.');
      return;
    }
    
    const updatedCustom = { ...userCustomOptions };
    delete updatedCustom[category];
    
    const updatedHidden = { ...userHiddenOptions };
    delete updatedHidden[category];
    
    const previousCustom = userCustomOptions;
    const previousHidden = userHiddenOptions;
    setUserCustomOptions(updatedCustom);
    setUserHiddenOptions(updatedHidden);
    setManageMenuOpen(null);
    
    // Reset selection to 0
    setSelections(prev => ({ ...prev, [category]: 0 }));
    
    try {
      await saveUserData({
        customOptions: updatedCustom,
        hiddenOptions: updatedHidden
      });
      alert(`${categoryDisplayNames[category]} has been reset to defaults.`);
    } catch (error) {
      console.error('Error resetting category:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(previousCustom);
      setUserHiddenOptions(previousHidden);
      alert('Failed to reset category. Please try again.');
    }
  }, [user, userCustomOptions, userHiddenOptions, saveUserData, categoryDisplayNames]);

  // Load saved sets
  const loadSavedSets = useCallback(async () => {
    if (!user || !user.uid) return;
    if (!db) {
      console.error('Firestore database is not initialized');
      return;
    }
    
    setLoadingSavedSets(true);
    try {
      const setsRef = collection(db, 'promptSets');
      const q = query(setsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const sets = [];
      querySnapshot.forEach((doc) => {
        sets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date created (newest first)
      sets.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setSavedSets(sets);
    } catch (error) {
      console.error('Error loading saved sets:', error);
    } finally {
      setLoadingSavedSets(false);
    }
  }, [user]);

  // Load saved sets when sidebar opens
  useEffect(() => {
    if (savedSetsSidebarOpen && user) {
      loadSavedSets();
    }
  }, [savedSetsSidebarOpen, user, loadSavedSets]);

  // Save current setup
  const saveCurrentSetup = useCallback(async () => {
    if (!requireAuth('save')) return;
    if (!saveFormData.name.trim()) return;
    if (!db) {
      console.error('Firestore database is not initialized');
      alert('Database is not available. Please refresh the page.');
      return;
    }
    
    try {
      const setId = editingSet?.id || `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const setData = {
        userId: user.uid,
        name: saveFormData.name.trim(),
        description: saveFormData.description.trim() || '',
        tags: saveFormData.tags.split(',').map(t => t.trim()).filter(t => t),
        isPublic: saveFormData.isPublic,
        selections: { ...selections },
        lockedCategories: { ...lockedCategories },
        includedCategories: { ...includedCategories },
        createdAt: editingSet?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const setRef = doc(db, 'promptSets', setId);
      await setDoc(setRef, setData);
      
      setSaveModalOpen(false);
      setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
      setEditingSet(null);
      
      // Reload saved sets if sidebar is open
      if (savedSetsSidebarOpen) {
        await loadSavedSets();
      }
    } catch (error) {
      console.error('Error saving setup:', error);
      alert('Failed to save setup. Please try again.');
    }
  }, [requireAuth, user, saveFormData, selections, lockedCategories, includedCategories, editingSet, savedSetsSidebarOpen, loadSavedSets]);

  // Load a saved setup
  const loadSavedSetup = useCallback((savedSet) => {
    if (savedSet.selections) {
      setSelections(savedSet.selections);
    }
    if (savedSet.lockedCategories) {
      setLockedCategories(savedSet.lockedCategories);
    }
    if (savedSet.includedCategories) {
      setIncludedCategories(savedSet.includedCategories);
    }
    setSavedSetsSidebarOpen(false);
  }, []);

  // Load a preset combination by resolving entry IDs to array indices
  const loadPreset = useCallback((presetIndex) => {
    const preset = presets[presetIndex];
    if (!preset) return;

    const newSelections = {};
    for (const [category, entryId] of Object.entries(preset.entries)) {
      const options = mergedCategories[category];
      if (!options) continue;
      const idx = options.findIndex(opt => opt.id === entryId);
      if (idx !== -1) {
        newSelections[category] = idx;
      }
    }
    setSelections(prev => ({ ...prev, ...newSelections }));
    setActivePresetIndex(presetIndex);
  }, [mergedCategories, setSelections]);

  // Cycle to next/previous preset
  const cyclePreset = useCallback((direction = 1) => {
    const nextIndex = activePresetIndex < 0
      ? 0
      : (activePresetIndex + direction + presets.length) % presets.length;
    loadPreset(nextIndex);
  }, [activePresetIndex, loadPreset]);

  // Which categories the active preset sets (for UX: show "Sets: Aesthetic, ..." and category indicators)
  const activePresetCategoryKeys = useMemo(() => {
    if (activePresetIndex < 0) return [];
    const preset = presets[activePresetIndex];
    return preset ? Object.keys(preset.entries) : [];
  }, [activePresetIndex]);
  const activePresetSetsLabel = useMemo(() => {
    return activePresetCategoryKeys
      .map((k) => categoryDisplayNames[k] || k)
      .join(', ');
  }, [activePresetCategoryKeys, categoryDisplayNames]);

  // Edit a saved set
  const handleEditSet = useCallback((savedSet) => {
    setEditingSet(savedSet);
    setSaveFormData({
      name: savedSet.name || '',
      description: savedSet.description || '',
      tags: savedSet.tags?.join(', ') || '',
      isPublic: savedSet.isPublic || false
    });
    setSaveModalOpen(true);
    setSavedSetsSidebarOpen(false);
  }, []);

  // Delete a saved set
  const handleDeleteSet = useCallback(async (setId) => {
    if (!user || !user.uid) return;
    if (!db) {
      console.error('Firestore database is not initialized');
      alert('Database is not available. Please refresh the page.');
      return;
    }
    
    try {
      const setRef = doc(db, 'promptSets', setId);
      await deleteDoc(setRef);
      await loadSavedSets();
      setDeleteConfirmOpen(null);
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Failed to delete set. Please try again.');
    }
  }, [user, loadSavedSets]);

  // Get all favorite prompts grouped by category
  const getAllFavoritePrompts = useCallback(() => {
    const favoritesByCategory = {};
    
    Object.keys(userFavorites).forEach(category => {
      const favoriteIds = userFavorites[category] || [];
      if (favoriteIds.length === 0) return;
      
      const categoryOptions = mergedCategories[category] || [];
      const favoriteOptions = [];
      
      categoryOptions.forEach((option, index) => {
        const optionId = (typeof option === 'object' && option?.id) ? option.id : index;
        if (favoriteIds.includes(optionId)) {
          favoriteOptions.push({
            id: optionId,
            index: index,
            option: option,
            category: category
          });
        }
      });
      
      if (favoriteOptions.length > 0) {
        favoritesByCategory[category] = favoriteOptions;
      }
    });
    
    return favoritesByCategory;
  }, [userFavorites, mergedCategories]);

  // Create a set from selected favorites
  const createSetFromFavorites = useCallback(() => {
    if (selectedFavorites.size === 0) {
      alert('Please select at least one favorite prompt.');
      return;
    }
    
    // Build selections object from selected favorites
    const newSelections = { ...selections };
    const newIncludedCategories = { ...includedCategories };
    
    // Reset all categories first
    Object.keys(categoryDisplayNames).forEach(cat => {
      newIncludedCategories[cat] = false;
    });
    
    // Set selections for selected favorites
    selectedFavorites.forEach(favoriteKey => {
      const [category, optionIdStr] = favoriteKey.split(':');
      
      // Find the index of this option in the category
      const categoryOptions = mergedCategories[category] || [];
      let foundIndex = -1;
      
      categoryOptions.forEach((option, index) => {
        const id = (typeof option === 'object' && option?.id) ? option.id : index;
        // Compare as strings to handle both numeric and string IDs
        const idStr = String(id);
        if (idStr === optionIdStr) {
          foundIndex = index;
        }
      });
      
      if (foundIndex >= 0) {
        newSelections[category] = foundIndex;
        newIncludedCategories[category] = true;
      }
    });
    
    // Apply the new selections
    setSelections(newSelections);
    setIncludedCategories(newIncludedCategories);
    setFavoritesSidebarOpen(false);
    setSelectedFavorites(new Set());
    setUnfavoritedInSession(new Set());
    favoritesSnapshotRef.current = null;
    
    alert(`Set created from ${selectedFavorites.size} favorite prompt(s)!`);
  }, [selectedFavorites, selections, includedCategories, mergedCategories, categoryDisplayNames]);

  // Load shared set from URL parameter
  useEffect(() => {
    const loadSharedSet = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedSetId = urlParams.get('set');
      
      if (!sharedSetId || !db) return;
      
      try {
        const setRef = doc(db, 'promptSets', sharedSetId);
        const setDoc = await getDoc(setRef);
        
        if (setDoc.exists()) {
          const setData = setDoc.data();
          
          // Check if set is public
          if (!setData.isPublic) {
            alert('This setup is private and cannot be loaded.');
            // Clear the URL parameter
            window.history.replaceState({}, '', window.location.pathname);
            return;
          }
          
          // Load the setup
          if (setData.selections) {
            setSelections(setData.selections);
          }
          if (setData.lockedCategories) {
            setLockedCategories(setData.lockedCategories);
          }
          if (setData.includedCategories) {
            setIncludedCategories(setData.includedCategories);
          }
          
          alert(`Loaded shared setup: "${setData.name}"`);
          
          // Clear the URL parameter after loading
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          alert('Shared setup not found. It may have been deleted.');
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch (error) {
        console.error('Error loading shared set:', error);
        alert('Failed to load shared setup.');
      }
    };
    
    loadSharedSet();
  }, []);

  // Share a saved set
  const handleShareSet = useCallback(async (savedSet) => {
    if (!savedSet.isPublic) {
      alert('This set is private. Make it public to share.');
      return;
    }
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?set=${savedSet.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    }
  }, []);

  // Sort options to put favorites first when category is not active
  // This happens after user clicks away from a category to avoid disrupting their browsing
  // NOTE: Selection indices are now always stored as original (unsorted) indices,
  // so we don't need to restore/convert when switching categories.
  useEffect(() => {
    const previousActive = previousActiveCategoryRef.current;
    previousActiveCategoryRef.current = activeCategory;
    
    // Sort ALL categories (including active) to move favorites to the front
    const sorted = { ...sortedCategoryOptions };
    let hasChanges = false;
    
    Object.keys(mergedCategories).forEach(categoryKey => {
      const options = mergedCategories[categoryKey] || [];
      const favorites = userFavorites[categoryKey] || [];
      
      // Check if we need to sort (has favorites)
      if (favorites.length > 0) {
        // Create a map to track original indices
        const optionMap = new Map();
        options.forEach((option, index) => {
          const optionId = (typeof option === 'object' && option?.id) ? option.id : index;
          optionMap.set(option, { originalIndex: index, id: optionId });
        });
        
        const sortedOptions = [...options].sort((a, b) => {
          const aData = optionMap.get(a);
          const bData = optionMap.get(b);
          const aIsFavorite = favorites.includes(aData.id);
          const bIsFavorite = favorites.includes(bData.id);
          
          // Favorites come first
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          // Maintain original order for items with same favorite status
          return aData.originalIndex - bData.originalIndex;
        });
        
        // Only update if order actually changed
        const currentSorted = sorted[categoryKey];
        if (!currentSorted || JSON.stringify(currentSorted) !== JSON.stringify(sortedOptions)) {
          sorted[categoryKey] = sortedOptions;
          hasChanges = true;
        }
      } else {
        // No favorites, use original order
        if (sorted[categoryKey]) {
          delete sorted[categoryKey];
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setSortedCategoryOptions(sorted);
      // NOTE: Do NOT update selections here - selections must always store the ORIGINAL
      // index in mergedCategories, not the sorted index. The conversion between original
      // and sorted indices happens in currentCategoryIndex (for display) and selectOption
      // (for user clicks). FigureCanvas uses selections directly with mergedCategories.
    }
  }, [activeCategory, mergedCategories, userFavorites, sortedCategoryOptions]);

  // Get current category options - use sorted version if available, otherwise original
  // Also filter to show only favorites if showFavoritesOnly is true
  const getCategoryOptions = (category) => {
    const sortedOptions = sortedCategoryOptions[category] || mergedCategories[category] || [];
    const favorites = userFavorites[category] || [];
    const selectedOptions = userSelectedOptions[category];
    
    // First filter by selectedOptions if they exist (from CategorySelectionModal)
    let filteredOptions = sortedOptions;
    if (selectedOptions !== undefined && Array.isArray(selectedOptions)) {
      if (selectedOptions.length === 0) {
        // Empty array means all options are deselected - return empty array
        filteredOptions = [];
      } else {
        // Filter to only show selected options
        filteredOptions = sortedOptions.filter((option) => {
          // Find this option in the original mergedCategories to get its identifier
          const originalIndex = mergedCategories[category]?.findIndex(opt => {
            if (typeof opt === 'object' && typeof option === 'object') {
              return (opt.id && option.id && opt.id === option.id) || 
                     (opt.title && option.title && opt.title === option.title) ||
                     (opt.prompt && option.prompt && opt.prompt === option.prompt) ||
                     (opt.text && option.text && opt.text === option.text);
            }
            return opt === option;
          });
          
          if (originalIndex === -1) {
            // Option not found in original - might be custom, check by id
            if (typeof option === 'object' && option.id) {
              return selectedOptions.includes(option.id);
            }
            return false;
          }
          
          // Get the identifier for this option (id for custom, index for default)
          const originalOption = mergedCategories[category][originalIndex];
          const optionId = (typeof originalOption === 'object' && originalOption?.id) 
            ? originalOption.id 
            : originalIndex;
          
          return selectedOptions.includes(optionId);
        });
      }
    }
    
    // If showing favorites only, filter the options
    if (showFavoritesOnly && favorites.length > 0) {
      return filteredOptions.filter((option, index) => {
        const optionId = (typeof option === 'object' && option?.id) ? option.id : index;
        // For sorted options, we need to find the original index to get the correct ID
        const originalIndex = mergedCategories[category]?.findIndex(opt => {
          if (typeof opt === 'object' && typeof option === 'object') {
            return (opt.id && option.id && opt.id === option.id) || 
                   (opt.title && option.title && opt.title === option.title) ||
                   (opt.prompt && option.prompt && opt.prompt === option.prompt);
          }
          return opt === option;
        });
        const correctId = originalIndex !== -1 ? 
          ((typeof mergedCategories[category][originalIndex] === 'object' && mergedCategories[category][originalIndex]?.id) 
            ? mergedCategories[category][originalIndex].id 
            : originalIndex) 
          : optionId;
        return favorites.includes(correctId);
      });
    }
    
    return filteredOptions;
  };

  // Helper function to get filtered count for a category (for sidebar display)
  const getCategoryFilteredCount = useCallback((category) => {
    const filtered = getCategoryOptions(category);
    return filtered.length;
  }, [mergedCategories, userSelectedOptions, sortedCategoryOptions, userFavorites, showFavoritesOnly]);

  const currentCategoryOptions = getCategoryOptions(activeCategory);
  
  // Map from original index (stored in selections) to sorted display index
  const currentCategoryIndex = useMemo(() => {
    const storedIndex = selections[activeCategory] || 0;
    const originalOptions = mergedCategories[activeCategory] || [];
    const sortedOptions = sortedCategoryOptions[activeCategory] || originalOptions;
    const displayedOptions = currentCategoryOptions;
    
    if (storedIndex >= originalOptions.length) {
      return 0;
    }
    
    const selectedOption = originalOptions[storedIndex];
    
    // Find the selected option in the displayed (sorted/filtered) options
    let displayIndex = displayedOptions.findIndex(opt => {
      if (typeof opt === 'object' && typeof selectedOption === 'object') {
        return (opt.id && selectedOption.id && opt.id === selectedOption.id) ||
               (opt.title && selectedOption.title && opt.title === selectedOption.title) ||
               (opt.prompt && selectedOption.prompt && opt.prompt === selectedOption.prompt);
      }
      return opt === selectedOption;
    });
    
    // If not found in displayed options (e.g., filtered out), return 0
    if (displayIndex === -1) {
      return 0;
    }
    
    return displayIndex;
  }, [selections, activeCategory, mergedCategories, sortedCategoryOptions, currentCategoryOptions]);

  // Allow guest access - users can try the product without signing in
  // Auth is only required for saving prompts, custom options, and premium features

  // Show polaroid only when viewing Framing & Composition (index 1) or Aesthetic & Style (index 2) groups
  const shouldShowPolaroid = expandedGroup === 1 || expandedGroup === 2;
  
  // Show nature frame when viewing Background & Environment (index 0)
  const shouldShowNature = expandedGroup === 0;
  
  // Show closet frame when viewing Clothes & Styling (index 3)
  const shouldShowCloset = expandedGroup === 3;
  
  // Show zoom for Face & Head (index 4)
  const isFaceAndHead = expandedGroup === 4;

  // ─── Mobile: render iOS-style layout ───
  if (isMobileView) {
    return (
      <MobileView
        selections={selections}
        lockedCategories={lockedCategories}
        mergedCategories={mergedCategories}
        onSelectOption={(catKey, index) => selectOption(catKey, index)}
        onRandomizeAll={randomizeAll}
        onRandomizeCategory={(catKey) => {
          const options = mergedCategories[catKey];
          if (options?.length) selectOption(catKey, Math.floor(Math.random() * options.length));
        }}
        onToggleLock={toggleLock}
        onClearAll={() => { setSelections({}); setLockedCategories({}); }}
        onClearCategory={(catKey) => selectOption(catKey, null)}
        activePresetIndex={activePresetIndex}
        presetCount={presets.length}
        activePresetTitle={activePresetIndex >= 0 ? presets[activePresetIndex]?.title : null}
        onCyclePreset={cyclePreset}
      />
    );
  }

  return (
    <>
      <ShortcutHandler
        onNextCategory={navigateNextCategory}
        onPrevCategory={navigatePrevCategory}
        onNextOption={navigateNextOption}
        onPrevOption={navigatePrevOption}
        onRandomize={handleRandomizeCurrent}
        onRandomizeAll={randomizeAll}
        onSave={() => {
          if (requireAuth('save')) {
            setSaveModalOpen(true);
          }
        }}
        onToggleLock={() => toggleLock(activeCategory)}
        onToggleInclude={() => toggleInclude(activeCategory)}
        onToggleFavorite={() => {
          // Toggle favorite for current option
          const currentIndex = selections[activeCategory] || 0;
          const currentOption = mergedCategories[activeCategory]?.[currentIndex];
          if (currentOption) {
            const optionId = currentOption.id || currentIndex;
            toggleFavorite(activeCategory, optionId);
            triggerFeedback(FEEDBACK_TYPES.FAVORITE, {
              category: categoryColors[activeCategory],
              intensity: 'medium',
            });
          }
        }}
        onUndo={undoSelection}
        onRedo={redoSelection}
        onEscape={() => {
          setManageMenuOpen(null);
          setAddOptionModalOpen(null);
          setShowHiddenOptionsModal(null);
        }}
        enabled={!loadingUserData}
      />
      <div className="layout-container">
        <Header
          onOpenVisibilitySettings={() => setVisibilitySettingsModalOpen(true)}
          onCyclePreset={cyclePreset}
          activePresetIndex={activePresetIndex}
          presetCount={presets.length}
          activePresetTitle={activePresetIndex >= 0 ? presets[activePresetIndex]?.title : null}
          activePresetSetsLabel={activePresetSetsLabel || null}
        />

        {/* Main app area – replicates three-column generator layout:
            - Left: vertical navigation rail
            - Center: hero canvas
            - Right: tight actions column
            Existing controls and buttons keep their relative positions. */}
        <div className="app-main">
          {/* Left navigation rail (non-functional for now, layout only) */}
          {/* Mobile sidebar backdrop */}
          {mobileSidebarOpen && (
            <div
              className={`mobile-sidebar-backdrop ${mobileSidebarOpen ? 'visible' : ''}`}
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
          <aside className={`app-sidebar ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
            <div className="app-sidebar-logo">
              <span className="app-sidebar-logo-mark" />
              <span className="app-sidebar-logo-text">Studio</span>
            </div>

            {/* Navigation menu */}
            {__ENABLE_PACKAGES__ && (
              <nav className="app-sidebar-nav">
                <button 
                  type="button"
                  className={`app-sidebar-item ${currentRoute === '#ai-image-generator' ? 'app-sidebar-item-active' : ''}`}
                  onClick={() => {
                    window.location.hash = '#ai-image-generator';
                  }}
                >
                  <span className="app-sidebar-item-dot" />
                  <span className="app-sidebar-item-label">AI Image Generator</span>
                </button>
                <button 
                  type="button"
                  className={`app-sidebar-item ${currentRoute === '#face-photos' ? 'app-sidebar-item-active' : ''}`}
                  onClick={() => {
                    window.location.hash = '#face-photos';
                  }}
                >
                  <span className="app-sidebar-item-dot" />
                  <span className="app-sidebar-item-label">Upload Face Photo</span>
                </button>
              </nav>
            )}

            {/* Category Tabs - moved to sidebar */}
            <CategoryTabs
              categoryGroups={categoryGroups}
              categoryDisplayNames={categoryDisplayNames}
              categoryColors={categoryColors}
              categories={mergedCategories}
              selections={selections}
              lockedCategories={lockedCategories}
              includedCategories={includedCategories}
              autoExcludedCategories={autoExcludedCategories}
              activeCategory={activeCategory}
              onCategorySelect={handleCategorySelect}
              onToggleLock={toggleLock}
              onToggleInclude={toggleInclude}
              isLoggedIn={!!user}
              onAddCustomOption={handleAddCustomOption}
              presetCategoryKeys={activePresetCategoryKeys}
              onExpandedGroupChange={(groupIndex) => {
                setExpandedGroup(groupIndex);
                // Auto-show modal when Clothes & Styling group (index 3) is expanded for first time
                if (groupIndex === 3 && user && hasCheckedClothingPreferences && !hasShownClothingModalRef.current) {
                  const hasSetPreferences = userPreferences?.preferences?.enabledClothingCategories !== undefined;
                  if (!hasSetPreferences) {
                    setClothingCategoriesModalOpen(true);
                    hasShownClothingModalRef.current = true;
                  }
                }
              }}
              expandedGroup={expandedGroup}
              getCategoryFilteredCount={getCategoryFilteredCount}
            />
          </aside>

          {/* Center workspace column */}
          <div className="workspace-stacked">
            {/* Preview and Actions Area */}
            <div className="preview-actions-area">
              {/* Preview Area */}
              <div
                className="preview-area-new"
                style={{
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '700px',
                    /* Maintain a predictable canvas shape so frames never get cut off */
                    aspectRatio: '16 / 10',
                    maxHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isFaceAndHead ? 'scale(1.6) translateY(2%)' : 'scale(0.9)',
                    transformOrigin: 'center 30%',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                  }}
                >
                  <FigureCanvas
                    selections={selections}
                    categoryColors={categoryColors}
                    categories={mergedCategories}
                    categoryDisplayNames={categoryDisplayNames}
                    onPartClick={(category) => setActiveCategory(category)}
                    showAestheticFilter={expandedGroup === 2}
                  />
                </div>
                {/* Polaroid Frame - overlays the FigureCanvas */}
                <PolaroidFrame isVisible={shouldShowPolaroid} showFilter={expandedGroup === 2} isFraming={expandedGroup === 1} />
                {/* Nature Frame - overlays the FigureCanvas for Background & Environment */}
                <NatureFrame isVisible={shouldShowNature} />
                {/* Closet Frame - overlays the FigureCanvas for Clothes & Styling */}
                <ClosetFrame isVisible={shouldShowCloset} />
              </div>

              <ActionsSidebar
                onRandomizeAll={randomizeAll}
                onSaveSetup={() => {
                  if (requireAuth('save')) {
                    setEditingSet(null);
                    setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
                    setSaveModalOpen(true);
                  }
                }}
                onOpenSavedSets={() => {
                  if (requireAuth('view saved sets')) {
                    setSavedSetsSidebarOpen(true);
                  }
                }}
                onOpenFavorites={() => {
                  if (requireAuth('view favorites')) {
                    setSelectedFavorites(new Set());
                    setUnfavoritedInSession(new Set());
                    favoritesSnapshotRef.current = getAllFavoritePrompts();
                    setFavoritesSidebarOpen(true);
                  }
                }}
                onOpenHistory={() => setHistoryPanelOpen(true)}
                onUndo={undoSelection}
                onRedo={redoSelection}
                canUndo={canUndo}
                canRedo={canRedo}
                onCreateSet={() => {
                  if (requireAuth('create set')) {
                    setCreateSetFormData({ name: '', promptText: '', category: '' });
                    setCreateSetModalOpen(true);
                  }
                }}
                onPhotoToPrompt={() => {
                  if (requireAuth('analyze photo')) {
                    setPhotoToPromptOpen(true);
                  }
                }}
                onOpenPackages={() => {
                  if (requireAuth('view packages')) {
                    setInstalledPackagesModalOpen(true);
                  }
                }}
                onOpenStats={() => {
                  if (requireAuth('view stats')) {
                    setStatsModalOpen(true);
                  }
                }}
                showPackages={!!__ENABLE_PACKAGES__}
              />
        </div>

            {/* Desktop Prompt Preview — shows generated prompt with copy button */}
            {!isMobileView && (
              <div style={{
                margin: '12px 0 0',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa', letterSpacing: '-0.01em' }}>
                    Generated Prompt
                  </span>
                  <span style={{ flex: 1 }} />
                  {generatedPrompt && (
                    <>
                      <span style={{ fontSize: 11, color: '#52525b', marginRight: 12 }}>
                        {generatedPrompt.split(' ').length} words
                      </span>
                      <button
                        onClick={copyToClipboard}
                        style={{
                          background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                          fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
                          color: copied ? '#22c55e' : '#a1a1aa',
                          transition: 'all 0.15s',
                        }}
                      >
                        {copied ? '✓ Copied' : '⎘ Copy'}
                      </button>
                    </>
                  )}
                </div>
                {generatedPrompt ? (
                  <p style={{
                    fontSize: 13, lineHeight: 1.6, color: '#d4d4d8', margin: 0,
                    maxHeight: 80, overflowY: 'auto',
                  }}>
                    {generatedPrompt}
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: '#52525b', fontStyle: 'italic', margin: 0 }}>
                    Select categories or hit Randomize to build your prompt...
                  </p>
                )}
              </div>
            )}

            {/* Mobile Prompt Preview — visible only on mobile (hidden on desktop via CSS) */}
            <div className="mobile-prompt-preview">
              <LivePromptPreview
                generatedPrompt={generatedPrompt}
                onCopy={copyToClipboard}
                copied={copied}
              />
            </div>

            {/* Mobile Category Chips — horizontal scrollable, visible only on mobile */}
            <div className="mobile-category-chips">
              <CategoryChips
                categoryDisplayNames={categoryDisplayNames}
                categoryColors={categoryColors}
                categories={mergedCategories}
                selections={selections}
                lockedCategories={lockedCategories}
                includedCategories={includedCategories}
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
                onToggleLock={toggleLock}
                onToggleInclude={toggleInclude}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint — desktop only */}
      {!isMobileView && (
        <div
          style={{
            position: 'fixed', bottom: 60, left: 16, zIndex: 150,
          }}
          onMouseEnter={(e) => {
            const tip = e.currentTarget.querySelector('[data-tip]');
            if (tip) tip.style.opacity = '1';
            if (tip) tip.style.transform = 'translateY(0)';
          }}
          onMouseLeave={(e) => {
            const tip = e.currentTarget.querySelector('[data-tip]');
            if (tip) tip.style.opacity = '0';
            if (tip) tip.style.transform = 'translateY(8px)';
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'default', fontSize: 13, fontWeight: 600, color: '#71717a',
          }}>?</div>
          <div data-tip style={{
            position: 'absolute', bottom: 36, left: 0,
            background: '#18181c', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '12px 14px', minWidth: 200,
            opacity: 0, transform: 'translateY(8px)',
            transition: 'all 0.2s ease', pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Shortcuts
            </div>
            {[
              ['← →', 'Navigate categories'],
              ['↑ ↓', 'Navigate options'],
              ['R', 'Randomize current'],
              ['⇧R', 'Randomize all'],
              ['C', 'Copy prompt'],
              ['⌘Z', 'Undo'],
              ['⌘⇧Z', 'Redo'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#f4f4f5',
                  background: 'rgba(255,255,255,0.06)', padding: '2px 6px',
                  borderRadius: 4, fontFamily: 'monospace', minWidth: 28, textAlign: 'center',
                }}>{key}</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />

      {/* Clothing Categories Selection Modal */}
      <ClothingCategoriesModal
        isOpen={clothingCategoriesModalOpen}
        onClose={() => setClothingCategoriesModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledClothingCategories(selectedCategories);
          // Reload preferences to ensure consistency
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
      />

      {/* Visibility Settings Modal */}
      <VisibilitySettingsModal
        isOpen={visibilitySettingsModalOpen}
        onClose={() => setVisibilitySettingsModalOpen(false)}
        categoryGroups={[
          {
            title: 'Part 1: Background & Environment',
            description: 'Most static elements - set once for photo bursts',
            categories: ['Background', 'Props']
          },
          {
            title: 'Part 2: Framing & Composition',
            description: 'Camera framing and composition settings',
            categories: ['Framing', 'Perspective', 'CameraAngle', 'CameraType']
          },
          {
            title: 'Part 3: Aesthetic & Style',
            description: 'Overall aesthetic, lighting, and mood',
            categories: ['Aesthetic', 'Lighting', 'ColorPalette', 'Texture', 'Mood', 'PhotoStyle']
          },
          {
            title: 'Part 4: Clothes & Styling',
            description: 'Outfits and styling accessories',
            categories: ['Outfit']
          },
          {
            title: 'Part 5: Face & Head',
            description: 'Facial features, expressions, and hair',
            categories: ['HeadPosition', 'FacialExpression', 'Eyes', 'Mouth', 'Hair']
          },
          {
            title: 'Part 6: Body & Pose',
            description: 'Body positioning and pose - most dynamic',
            categories: ['BodyPose', 'Torso', 'Arms', 'Hands', 'Legs', 'Feet', 'BodySize']
          }
        ]}
        onUpdate={(hiddenGroups) => {
          setHiddenCategoryGroups(hiddenGroups);
          // Reload preferences to ensure consistency
          if (user?.uid) {
            getHiddenCategoryGroups(user.uid).then(groups => {
              setHiddenCategoryGroups(groups || []);
            });
          }
        }}
      />

      {/* Face & Head Category Selection Modal */}
      <CategorySelectionModal
        isOpen={faceHeadModalOpen}
        onClose={() => setFaceHeadModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledFaceHeadCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="faceHead"
        optionalCategories={[
          { key: 'HeadPosition', displayName: 'Head Position', count: categories.HeadPosition?.length || 0 },
          { key: 'Eyes', displayName: 'Eyes', count: categories.Eyes?.length || 0 },
          { key: 'Mouth', displayName: 'Mouth', count: categories.Mouth?.length || 0 },
          { key: 'Hair', displayName: 'Hair', count: categories.Hair?.length || 0 },
        ]}
        defaultCategory="FacialExpression"
        defaultCategoryCount={categories.FacialExpression?.length || 0}
        title="Select Face & Head Categories"
        description="Choose which face & head categories to include in your setup."
      />

      {/* Aesthetic & Style Category Selection Modal */}
      <CategorySelectionModal
        isOpen={aestheticStyleModalOpen}
        onClose={() => setAestheticStyleModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledAestheticStyleCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="aestheticStyle"
        optionalCategories={[
          { key: 'Lighting', displayName: 'Lighting', count: categories.Lighting?.length || 0 },
          { key: 'ColorPalette', displayName: 'Color Palette', count: categories.ColorPalette?.length || 0 },
          { key: 'Texture', displayName: 'Texture', count: categories.Texture?.length || 0 },
          { key: 'Mood', displayName: 'Mood', count: categories.Mood?.length || 0 },
          { key: 'PhotoStyle', displayName: 'Photo Style', count: categories.PhotoStyle?.length || 0 },
        ]}
        defaultCategory="Aesthetic"
        defaultCategoryCount={categories.Aesthetic?.length || 0}
        title="Select Aesthetic & Style Categories"
        description="Choose which aesthetic & style categories to include in your setup."
      />

      {/* Framing & Composition Category Selection Modal */}
      <CategorySelectionModal
        isOpen={framingCompositionModalOpen}
        onClose={() => setFramingCompositionModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledFramingCompositionCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="framingComposition"
        optionalCategories={[
          { key: 'Perspective', displayName: 'Perspective', count: categories.Perspective?.length || 0 },
          { key: 'CameraAngle', displayName: 'Camera Angle', count: categories.CameraAngle?.length || 0 },
          { key: 'CameraType', displayName: 'Camera Type', count: categories.CameraType?.length || 0 },
        ]}
        defaultCategory="Framing"
        defaultCategoryCount={categories.Framing?.length || 0}
        title="Select Framing & Composition Categories"
        description="Choose which framing & composition categories to include in your setup."
      />

      {/* Background & Environment Category Selection Modal */}
      <CategorySelectionModal
        isOpen={backgroundEnvironmentModalOpen}
        onClose={() => setBackgroundEnvironmentModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledBackgroundEnvironmentCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="backgroundEnvironment"
        optionalCategories={[
          { key: 'Props', displayName: 'Props', count: categories.Props?.length || 0 },
        ]}
        defaultCategory="Background"
        defaultCategoryCount={categories.Background?.length || 0}
        title="Select Background & Environment Categories"
        description="Choose which background & environment categories to include in your setup."
      />

      {/* Body & Pose Category Selection Modal */}
      <CategorySelectionModal
        isOpen={bodyPoseModalOpen}
        onClose={() => setBodyPoseModalOpen(false)}
        onSave={async (selectedCategories) => {
          setEnabledBodyPoseCategories(selectedCategories);
          // Immediately update state to reflect changes
          setHasCheckedBodyPosePreferences(true);
          if (user?.uid) {
            // Reload preferences to ensure consistency
            const prefs = await getUserPreferences(user.uid);
            if (prefs) {
              setUserPreferences(prefs);
            }
            // Reload Body & Pose categories to ensure we have the latest
            const enabled = await getEnabledBodyPoseCategories(user.uid);
            setEnabledBodyPoseCategories(enabled || []);
          }
        }}
        categoryGroup="bodyPose"
        optionalCategories={[
          { key: 'Torso', displayName: 'Torso', count: categories.Torso?.length || 0 },
          { key: 'Arms', displayName: 'Arms', count: categories.Arms?.length || 0 },
          { key: 'Hands', displayName: 'Hands', count: categories.Hands?.length || 0 },
          { key: 'Legs', displayName: 'Legs', count: categories.Legs?.length || 0 },
          { key: 'Feet', displayName: 'Feet', count: categories.Feet?.length || 0 },
          { key: 'BodySize', displayName: 'Body Size', count: categories.BodySize?.length || 0 },
        ]}
        defaultCategory="BodyPose"
        defaultCategoryCount={categories.BodyPose?.length || 0}
        title="Select Body & Pose Categories"
        description="Choose which body & pose categories to include in your setup. All categories are enabled by default."
      />

      {/* Installed Packages Modal */}
      {__ENABLE_PACKAGES__ && installedPackagesModalOpen && (
        <InstalledPackagesModal
          isOpen={installedPackagesModalOpen}
          onClose={() => setInstalledPackagesModalOpen(false)}
          categories={categories}
          userCustomOptions={userCustomOptions}
          userDeletedOptions={userDeletedOptions}
          onTrashOption={trashOption}
          onUninstall={(packageId) => {
            // Reload user data to refresh options
            const loadUserData = async () => {
              if (!user) return;
              try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  const data = userDoc.data();
                  setUserCustomOptions(data.customOptions || {});
                }
              } catch (error) {
                console.error('Error reloading user data:', error);
              }
            };
            loadUserData();
          }}
          onClothingCategoriesUpdate={async () => {
            // Reload preferences to ensure consistency
            if (user?.uid) {
              const prefs = await getUserPreferences(user.uid);
              if (prefs) {
                setUserPreferences(prefs);
              }
              // Refresh ALL category preferences to ensure sidebar matches selections
              const enabledClothing = await getEnabledClothingCategories(user.uid);
              setEnabledClothingCategories(enabledClothing || []);
              
              const enabledBodyPose = await getEnabledBodyPoseCategories(user.uid);
              setEnabledBodyPoseCategories(enabledBodyPose || []);
              setHasCheckedBodyPosePreferences(true);
              
              const enabledFaceHead = await getEnabledFaceHeadCategories(user.uid);
              setEnabledFaceHeadCategories(enabledFaceHead || []);
              setHasCheckedFaceHeadPreferences(true);
              
              const enabledAestheticStyle = await getEnabledAestheticStyleCategories(user.uid);
              setEnabledAestheticStyleCategories(enabledAestheticStyle || []);
              setHasCheckedAestheticStylePreferences(true);
              
              const enabledFramingComposition = await getEnabledFramingCompositionCategories(user.uid);
              setEnabledFramingCompositionCategories(enabledFramingComposition || []);
              setHasCheckedFramingCompositionPreferences(true);
              
              const enabledBackgroundEnvironment = await getEnabledBackgroundEnvironmentCategories(user.uid);
              setEnabledBackgroundEnvironmentCategories(enabledBackgroundEnvironment || []);
              setHasCheckedBackgroundEnvironmentPreferences(true);
              
              // Reload selectedOptions and refresh deleted options (but preserve local state if it's more recent)
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const data = userDoc.data();
                const firestoreDeleted = data.deletedOptions || {};
                // Use functional update to preserve local state if it has more items
                setUserDeletedOptions(prev => {
                  // Count total deleted items in each
                  const prevCount = Object.values(prev).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                  const firestoreCount = Object.values(firestoreDeleted).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                  // If local has more or equal, keep it (might have unsaved changes)
                  if (prevCount >= firestoreCount) {
                    return prev;
                  }
                  return firestoreDeleted;
                });
                
                // Reload selectedOptions to match modal selections
                setUserSelectedOptions(data.selectedOptions || {});
              }
            }
          }}
        />
      )}

      {/* Enhanced Copy Success Overlay */}
      <CopySuccessOverlay 
        show={copied} 
        progressMessage={progressMessage}
        streak={userStreak}
      />
      
      {/* Achievement Notification */}
      <AchievementNotification 
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
      
      {/* Engagement Stats Modal - Visible to all, auth required to use */}
      {statsModalOpen && user && (
        <EngagementStats 
          userId={user.uid}
          isOpen={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
        />
      )}
      
      {/* First Time Experience Onboarding */}
      {showFirstTimeExperience && (
        <FirstTimeExperience 
          onComplete={() => setShowFirstTimeExperience(false)}
          onSkip={() => setShowFirstTimeExperience(false)}
        />
      )}

      {/* Photo to Prompt Modal */}
      {photoToPromptOpen && (
        <ImageToPromptModal
          isOpen={photoToPromptOpen}
          onClose={() => setPhotoToPromptOpen(false)}
          onSaveOption={savePhotoToPromptOption}
          categories={mergedCategories}
        />
      )}

      {/* Add Custom Option Modal */}
      {addOptionModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => {
            setAddOptionModalOpen(null);
            setNewOptionText('');
            setNewOptionTitle('');
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 24px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Add Custom Option - {categoryDisplayNames[addOptionModalOpen]}
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff'
                }}
              >
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={newOptionTitle}
                onChange={(e) => setNewOptionTitle(e.target.value)}
                placeholder="Enter a title for this option"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff'
                }}
              >
                Prompt Text <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                placeholder="Enter your custom prompt text here..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setAddOptionModalOpen(null);
                  setNewOptionText('');
                  setNewOptionTitle('');
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => saveCustomOption(addOptionModalOpen)}
                disabled={!newOptionText.trim() || !newOptionTitle.trim()}
                style={{
                  padding: '12px 24px',
                  background: (newOptionText.trim() && newOptionTitle.trim())
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                    : 'rgba(139, 92, 246, 0.3)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: (newOptionText.trim() && newOptionTitle.trim()) ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  boxShadow: (newOptionText.trim() && newOptionTitle.trim()) 
                    ? '0 4px 12px rgba(139, 92, 246, 0.4)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newOptionText.trim() && newOptionTitle.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newOptionText.trim() && newOptionTitle.trim()) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Hidden Options Modal */}
      {showHiddenOptionsModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setShowHiddenOptionsModal(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c2c2c'
              }}
            >
              Hidden Options - {categoryDisplayNames[showHiddenOptionsModal]}
            </h3>
            {(() => {
              const hidden = userHiddenOptions[showHiddenOptionsModal] || [];
              const defaultOptions = categories[showHiddenOptionsModal] || [];
              const customOptions = userCustomOptions[showHiddenOptionsModal] || [];
              
              if (hidden.length === 0) {
                return (
                  <p style={{ color: '#6b6b6b', margin: 0 }}>
                    No hidden options for this category.
                  </p>
                );
              }
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {hidden.map((hiddenValue, idx) => {
                    let optionText = '';
                    if (typeof hiddenValue === 'number') {
                      // Default option hidden by index
                      const option = defaultOptions[hiddenValue];
                      optionText = typeof option === 'string' ? option : option?.prompt || `Option ${hiddenValue + 1}`;
                    } else {
                      // Custom option hidden by id
                      const option = customOptions.find(opt => opt.id === hiddenValue);
                      optionText = option?.prompt || 'Custom Option';
                    }
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          background: '#f5f5f5',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#2c2c2c',
                            flex: 1,
                            wordBreak: 'break-word'
                          }}
                        >
                          {optionText.substring(0, 200)}{optionText.length > 200 ? '...' : ''}
                        </p>
                        <button
                          onClick={() => unhideOption(showHiddenOptionsModal, hiddenValue)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'white',
                            flexShrink: 0
                          }}
                        >
                          Show
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHiddenOptionsModal(null)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c2c2c'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Setup Modal */}
      {saveModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setSaveModalOpen(false);
            setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
            setEditingSet(null);
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}
              >
                {editingSet ? 'Edit Saved Setup' : 'Save Current Setup'}
              </h3>
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
                  setEditingSet(null);
                }}
                style={{
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
                  transition: 'all 0.2s ease'
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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={saveFormData.name}
                  onChange={(e) => setSaveFormData({ ...saveFormData, name: e.target.value })}
                  placeholder="Enter a name for this setup"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Description
                </label>
                <textarea
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData({ ...saveFormData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={saveFormData.tags}
                  onChange={(e) => setSaveFormData({ ...saveFormData, tags: e.target.value })}
                  placeholder="e.g., portrait, fashion, studio"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={saveFormData.isPublic}
                    onChange={(e) => setSaveFormData({ ...saveFormData, isPublic: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Make this setup public (shareable)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setSaveModalOpen(false);
                    setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
                    setEditingSet(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentSetup}
                  disabled={!saveFormData.name.trim()}
                  style={{
                    padding: '10px 20px',
                    background: saveFormData.name.trim()
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saveFormData.name.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (saveFormData.name.trim()) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {editingSet ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Set Modal */}
      {createSetModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setCreateSetModalOpen(false);
            setCreateSetFormData({ name: '', promptText: '', category: '' });
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}
              >
                Create Set
              </h3>
              <button
                onClick={() => {
                  setCreateSetModalOpen(false);
                  setCreateSetFormData({ name: '', promptText: '', category: '' });
                }}
                style={{
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
                  transition: 'all 0.2s ease'
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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                Enter your custom prompt and assign it to a category. This will be saved to your account so you can easily access it later by clicking buttons.
              </p>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={createSetFormData.name}
                  onChange={(e) => setCreateSetFormData({ ...createSetFormData, name: e.target.value })}
                  placeholder="Enter a name for this prompt (e.g., 'My Portrait Style')"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={createSetFormData.category}
                  onChange={(e) => setCreateSetFormData({ ...createSetFormData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a category...</option>
                  {Object.keys(categories).map((categoryKey) => (
                    <option key={categoryKey} value={categoryKey} style={{ background: '#1a1a2e', color: '#ffffff' }}>
                      {categoryDisplayNames[categoryKey] || categoryKey}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Prompt Text <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={createSetFormData.promptText}
                  onChange={(e) => setCreateSetFormData({ ...createSetFormData, promptText: e.target.value })}
                  placeholder="Enter your full prompt text here. This can be a long, detailed prompt that you want to save for easy access..."
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  You can paste a long prompt from ChatGPT or write your own. This will be saved to the selected category and appear as a button you can click.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setCreateSetModalOpen(false);
                    setCreateSetFormData({ name: '', promptText: '', category: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCreateSet}
                  disabled={!createSetFormData.name.trim() || !createSetFormData.promptText.trim() || !createSetFormData.category}
                  style={{
                    padding: '10px 20px',
                    background: (createSetFormData.name.trim() && createSetFormData.promptText.trim() && createSetFormData.category)
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (createSetFormData.name.trim() && createSetFormData.promptText.trim() && createSetFormData.category) ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (createSetFormData.name.trim() && createSetFormData.promptText.trim() && createSetFormData.category) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Save to Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Sets Sidebar */}
      {savedSetsSidebarOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => setSavedSetsSidebarOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              My Saved Sets
            </h3>
            <button
              onClick={() => setSavedSetsSidebarOpen(false)}
              style={{
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
                transition: 'all 0.2s ease'
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
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px'
            }}
          >
            {loadingSavedSets ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                <Loader2 size={32} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : savedSets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <p style={{ margin: 0 }}>No saved sets yet.</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Save your first setup to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedSets.map((set) => {
                  const createdDate = set.createdAt?.toDate?.() || new Date();
                  const dateStr = createdDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  // Get preview of selections (first 3 categories)
                  const previewCategories = Object.keys(set.selections || {}).slice(0, 3);
                  const previewText = previewCategories
                    .map(cat => {
                      const index = set.selections[cat];
                      const option = mergedCategories[cat]?.[index];
                      if (!option) return null;
                      const text = typeof option === 'string' ? option : (option.title || option.prompt?.substring(0, 30));
                      return `${categoryDisplayNames[cat]}: ${text}`;
                    })
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <div
                      key={set.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '12px',
                        padding: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#ffffff'
                            }}
                          >
                            {set.name}
                          </h4>
                          {set.isPublic && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: '#a78bfa',
                                borderRadius: '10px',
                                fontWeight: '500'
                              }}
                            >
                              Public
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: '4px 0',
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          {dateStr}
                        </p>
                        {set.description && (
                          <p
                            style={{
                              margin: '8px 0 0 0',
                              fontSize: '13px',
                              color: 'rgba(255, 255, 255, 0.7)',
                              lineHeight: '1.4'
                            }}
                          >
                            {set.description}
                          </p>
                        )}
                        {previewText && (
                          <p
                            style={{
                              margin: '8px 0 0 0',
                              fontSize: '11px',
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontStyle: 'italic'
                            }}
                          >
                            {previewText}...
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => loadSavedSetup(set)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <Download size={14} />
                          Load
                        </button>
                        <button
                          onClick={() => handleEditSet(set)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(139, 92, 246, 0.3)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#a78bfa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                          }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        {set.isPublic && (
                          <button
                            onClick={() => handleShareSet(set)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(139, 92, 246, 0.3)',
                              border: '1px solid rgba(139, 92, 246, 0.5)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#a78bfa',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(139, 92, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                            }}
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmOpen(set.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Favorites Sidebar */}
      {favoritesSidebarOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => {
              setFavoritesSidebarOpen(false);
              setSelectedFavorites(new Set());
              setUnfavoritedInSession(new Set());
              favoritesSnapshotRef.current = null;
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
              maxWidth: '90vw',
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={20} style={{ color: '#fbbf24' }} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}
                >
                  My Favorite Prompts
                </h3>
              </div>
              <button
                onClick={() => {
                  setFavoritesSidebarOpen(false);
                  setSelectedFavorites(new Set());
                  setUnfavoritedInSession(new Set());
                  favoritesSnapshotRef.current = null;
                }}
                style={{
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
                  transition: 'all 0.2s ease'
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
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px'
              }}
            >
              {(() => {
                const favoritesByCategory = getAllFavoritePrompts();
                
                // Merge with unfavorited items from snapshot to keep them visible
                if (favoritesSnapshotRef.current) {
                  Object.keys(favoritesSnapshotRef.current).forEach(category => {
                    const snapshotFavorites = favoritesSnapshotRef.current[category] || [];
                    const currentFavorites = favoritesByCategory[category] || [];
                    const currentFavoriteIds = new Set(currentFavorites.map(f => `${category}:${f.id}`));
                    
                    // Add unfavorited items from snapshot that aren't in current favorites
                    snapshotFavorites.forEach(({ id, index, option }) => {
                      const favoriteKey = `${category}:${id}`;
                      if (unfavoritedInSession.has(favoriteKey) && !currentFavoriteIds.has(favoriteKey)) {
                        if (!favoritesByCategory[category]) {
                          favoritesByCategory[category] = [];
                        }
                        favoritesByCategory[category].push({ id, index, option });
                      }
                    });
                  });
                }
                
                const categoryKeys = Object.keys(favoritesByCategory);
                
                if (categoryKeys.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      <Star size={48} style={{ color: 'rgba(251, 191, 36, 0.3)', margin: '0 auto 16px' }} />
                      <p style={{ margin: 0, fontSize: '16px' }}>No favorite prompts yet.</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Star prompts you like to add them here!</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {categoryKeys.map(category => {
                      const favorites = favoritesByCategory[category];
                      return (
                        <div key={category}>
                          <h4
                            style={{
                              margin: '0 0 12px 0',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#fbbf24',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {categoryDisplayNames[category] || category}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {favorites.map(({ id, index, option }) => {
                              const favoriteKey = `${category}:${id}`;
                              const isSelected = selectedFavorites.has(favoriteKey);
                              const isUnfavorited = unfavoritedInSession.has(favoriteKey);
                              const optionText = typeof option === 'string' ? option : (option.title || option.prompt?.substring(0, 50) || '');
                              const fullPrompt = typeof option === 'string' ? option : (option.prompt || '');
                              
                              return (
                                <div
                                  key={favoriteKey}
                                  style={{
                                    background: isSelected 
                                      ? 'rgba(251, 191, 36, 0.15)' 
                                      : 'rgba(255, 255, 255, 0.05)',
                                    border: isSelected
                                      ? '1px solid rgba(251, 191, 36, 0.4)'
                                      : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                  }}
                                  onClick={(e) => {
                                    // Don't toggle selection if clicking the heart button
                                    if (e.target.closest('.favorite-heart-button')) {
                                      return;
                                    }
                                    const newSelected = new Set(selectedFavorites);
                                    if (isSelected) {
                                      newSelected.delete(favoriteKey);
                                    } else {
                                      newSelected.add(favoriteKey);
                                    }
                                    setSelectedFavorites(newSelected);
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      style={{
                                        marginTop: '2px',
                                        cursor: 'pointer',
                                        accentColor: '#fbbf24'
                                      }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div
                                        style={{
                                          fontSize: '13px',
                                          fontWeight: '500',
                                          color: '#ffffff',
                                          marginBottom: '4px',
                                          wordBreak: 'break-word'
                                        }}
                                      >
                                        {typeof option === 'string' ? option : (option.title || 'Untitled')}
                                      </div>
                                      {fullPrompt && (
                                        <div
                                          style={{
                                            fontSize: '11px',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            lineHeight: '1.4',
                                            wordBreak: 'break-word',
                                            maxHeight: '60px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                          title={fullPrompt}
                                        >
                                          {fullPrompt.length > 150 ? fullPrompt.substring(0, 150) + '...' : fullPrompt}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      className="favorite-heart-button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        // Mark as unfavorited in session
                                        setUnfavoritedInSession(prev => new Set(prev).add(favoriteKey));
                                        // Remove from selected if selected
                                        if (isSelected) {
                                          setSelectedFavorites(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(favoriteKey);
                                            return newSet;
                                          });
                                        }
                                        // Actually unfavorite it
                                        toggleFavorite(category, id);
                                        triggerFeedback(FEEDBACK_TYPES.FAVORITE, {
                                          category: categoryColors[category],
                                          intensity: 'medium',
                                        });
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isUnfavorited ? '#52525b' : '#f43f5e',
                                        transition: 'color 200ms',
                                        flexShrink: 0,
                                        outline: 'none'
                                      }}
                                      title="Remove from favorites"
                                    >
                                      <Heart 
                                        size={16} 
                                        fill={isUnfavorited ? 'transparent' : '#f43f5e'} 
                                        strokeWidth={2}
                                      />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer with Create Set Button */}
            {selectedFavorites.size > 0 && (
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgba(251, 191, 36, 0.2)',
                  background: 'rgba(251, 191, 36, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {selectedFavorites.size} prompt{selectedFavorites.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={createSetFromFavorites}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                  }}
                >
                  <Plus size={16} />
                  Create Set from Selected
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setDeleteConfirmOpen(null)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Delete Saved Set?
            </h3>
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5'
              }}
            >
              This action cannot be undone. Are you sure you want to delete this saved setup?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmOpen(null)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSet(deleteConfirmOpen)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive — handled in styles.css */
      `}</style>

      {/* Mobile Categories FAB - opens sidebar on mobile */}
      <button
        className="mobile-categories-fab"
        onClick={() => setMobileSidebarOpen(prev => !prev)}
        aria-label="Open categories"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>

      {/* Word Buttons Bar - Fixed at bottom of page (outside layout-container) */}
      {currentCategoryOptions.length > 0 && !statsModalOpen && !saveModalOpen && !addOptionModalOpen && !installedPackagesModalOpen && !createSetModalOpen && !showFirstTimeExperience && !buyCreditsModalOpen && (
        <WordButtonBar
          category={activeCategory}
          options={currentCategoryOptions}
          currentIndex={currentCategoryIndex}
          categoryColor={categoryColors[activeCategory] || '#b39ddb'}
          isIncluded={includedCategories[activeCategory] !== false}
          onSelect={(index) => selectOption(activeCategory, index)}
          categoryDisplayName={categoryDisplayNames[activeCategory]}
          favorites={userFavorites}
          onToggleFavorite={toggleFavorite}
          isLoggedIn={!!user}
          onTrash={(option, optionIndex, buttonElement) => trashOption(activeCategory, option, optionIndex, buttonElement)}
        />
      )}

      {/* Trash Animation */}
      {trashAnimation && (
        <TrashAnimation
          startX={trashAnimation.startX}
          startY={trashAnimation.startY}
          endX={trashAnimation.endX}
          endY={trashAnimation.endY}
          onComplete={() => setTrashAnimation(null)}
        />
      )}

      {/* Prompt History Panel */}
      <PromptHistory
        history={promptHistory.history}
        onSelect={(entry) => {
          // Copy the prompt text from the history entry
          if (entry.prompt) {
            navigator.clipboard.writeText(entry.prompt).catch(() => {});
            triggerFeedback(FEEDBACK_TYPES.COPY, {
              intensity: 'standard',
              message: 'Prompt copied from history!',
            });
          }
          setHistoryPanelOpen(false);
        }}
        onRemove={promptHistory.removeEntry}
        onClear={promptHistory.clearHistory}
        isOpen={historyPanelOpen}
        onClose={() => setHistoryPanelOpen(false)}
      />

      {/* Auth Modal - shown when guest users try to use premium features */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default PhotoElementRandomizer;

