import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, Trash2, Loader2, AlertCircle, RefreshCw, Star, Download, TrendingUp, Settings, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/UserContext';
import { getUserProfile, uninstallPackage } from '../firestoreService';
import { getPackage, getTopStarredPackages, starPackage, unstarPackage, getUserStarredPackages, installPackage } from '../packageService';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  getEnabledClothingCategories,
  getEnabledFaceHeadCategories,
  getEnabledAestheticStyleCategories,
  getEnabledFramingCompositionCategories,
  getEnabledBackgroundEnvironmentCategories,
  getEnabledBodyPoseCategories
} from '../utils/personalizationService';
import { db } from '../firebase-config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ConfirmationDialog from './ConfirmationDialog';
import ClothingCategoriesModal from './ClothingCategoriesModal';
import CategorySelectionModal from './CategorySelectionModal';

// Official package IDs (from website creator)
const OFFICIAL_CLOTHING_PACKAGE_ID = 'official_clothing_styling_options';
const OFFICIAL_FACE_HEAD_PACKAGE_ID = 'official_face_head_options';
const OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID = 'official_aesthetic_style_options';
const OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID = 'official_framing_composition_options';
const OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID = 'official_background_environment_options';
const OFFICIAL_BODY_POSE_PACKAGE_ID = 'official_body_pose_options';

// Create virtual official package objects
const createOfficialClothingPackage = (enabledCount) => ({
  packageId: OFFICIAL_CLOTHING_PACKAGE_ID,
  id: OFFICIAL_CLOTHING_PACKAGE_ID,
  name: 'Clothing & Styling Options',
  description: 'Choose which clothing categories appear in "Clothes & Styling". Select from Outfit Top, Outfit Bottom, Shoes, Jewelry, Hair Accessories, Bags, and Brand/Designer.',
  author: {
    userId: 'official',
    displayName: 'Pose Prompter',
    avatar: null,
  },
  version: '1.0.0',
  stats: {
    downloads: 0,
    stars: 0,
  },
  isOfficial: true,
  enabledCategoriesCount: enabledCount,
});

const createOfficialFaceHeadPackage = (enabledCount) => ({
  packageId: OFFICIAL_FACE_HEAD_PACKAGE_ID,
  id: OFFICIAL_FACE_HEAD_PACKAGE_ID,
  name: 'Face & Head Options',
  description: 'Choose which face & head categories appear in "Face & Head". Select from Head Position, Eyes, Mouth, and Hair. Facial Expression is always included.',
  author: {
    userId: 'official',
    displayName: 'Pose Prompter',
    avatar: null,
  },
  version: '1.0.0',
  stats: {
    downloads: 0,
    stars: 0,
  },
  isOfficial: true,
  enabledCategoriesCount: enabledCount,
});

const createOfficialAestheticStylePackage = (enabledCount) => ({
  packageId: OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID,
  id: OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID,
  name: 'Aesthetic & Style Options',
  description: 'Choose which aesthetic & style categories appear in "Aesthetic & Style". Select from Lighting, Color Palette, Texture, Mood, and Photo Style. Aesthetic is always included.',
  author: {
    userId: 'official',
    displayName: 'Pose Prompter',
    avatar: null,
  },
  version: '1.0.0',
  stats: {
    downloads: 0,
    stars: 0,
  },
  isOfficial: true,
  enabledCategoriesCount: enabledCount,
});

const createOfficialFramingCompositionPackage = (enabledCount) => ({
  packageId: OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID,
  id: OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID,
  name: 'Framing & Composition Options',
  description: 'Choose which framing & composition categories appear in "Framing & Composition". Select from Perspective, Camera Angle, and Camera Type. Framing is always included.',
  author: {
    userId: 'official',
    displayName: 'Pose Prompter',
    avatar: null,
  },
  version: '1.0.0',
  stats: {
    downloads: 0,
    stars: 0,
  },
  isOfficial: true,
  enabledCategoriesCount: enabledCount,
});

const createOfficialBackgroundEnvironmentPackage = (enabledCount) => ({
  packageId: OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID,
  id: OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID,
  name: 'Background & Environment Options',
  description: 'Choose which background & environment categories appear in "Background & Environment". Select from Props. Background is always included.',
  author: {
    userId: 'official',
    displayName: 'Pose Prompter',
    avatar: null,
  },
  version: '1.0.0',
  stats: {
    downloads: 0,
    stars: 0,
  },
  isOfficial: true,
  enabledCategoriesCount: enabledCount,
});

const createOfficialBodyPosePackage = (enabledCount) => ({
  packageId: OFFICIAL_BODY_POSE_PACKAGE_ID,
  id: OFFICIAL_BODY_POSE_PACKAGE_ID,
  name: 'Body & Pose Options',
  description: 'Choose which body & pose categories appear in "Body & Pose". All categories are enabled by default. You can remove any you don\'t need.',
  author: {
    userId: 'official',
    displayName: 'Pose Prompter',
    avatar: null,
  },
  version: '1.0.0',
  stats: {
    downloads: 0,
    stars: 0,
  },
  isOfficial: true,
  enabledCategoriesCount: enabledCount,
});

const InstalledPackagesModal = ({ isOpen, onClose, onUninstall, onClothingCategoriesUpdate, categories, userCustomOptions, userDeletedOptions = {}, onTrashOption }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('top'); // 'installed', 'top', or 'trashed'
  const [installedPackages, setInstalledPackages] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [starredPackageIds, setStarredPackageIds] = useState([]);
  const [installedPackageIds, setInstalledPackageIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uninstalling, setUninstalling] = useState(null);
  const [confirmUninstall, setConfirmUninstall] = useState(null);
  const [packageVersions, setPackageVersions] = useState({});
  const [starringPackage, setStarringPackage] = useState(null);
  const [installingPackage, setInstallingPackage] = useState(null);
  const [clothingCategoriesModalOpen, setClothingCategoriesModalOpen] = useState(false);
  const [enabledClothingCategoriesCount, setEnabledClothingCategoriesCount] = useState(0);
  const [enabledFaceHeadCategoriesCount, setEnabledFaceHeadCategoriesCount] = useState(0);
  const [enabledAestheticStyleCategoriesCount, setEnabledAestheticStyleCategoriesCount] = useState(0);
  const [enabledFramingCompositionCategoriesCount, setEnabledFramingCompositionCategoriesCount] = useState(0);
  const [enabledBackgroundEnvironmentCategoriesCount, setEnabledBackgroundEnvironmentCategoriesCount] = useState(0);
  const [enabledBodyPoseCategoriesCount, setEnabledBodyPoseCategoriesCount] = useState(0);
  const [faceHeadModalOpen, setFaceHeadModalOpen] = useState(false);
  const [aestheticStyleModalOpen, setAestheticStyleModalOpen] = useState(false);
  const [framingCompositionModalOpen, setFramingCompositionModalOpen] = useState(false);
  const [backgroundEnvironmentModalOpen, setBackgroundEnvironmentModalOpen] = useState(false);
  const [bodyPoseModalOpen, setBodyPoseModalOpen] = useState(false);
  const [trashedOptions, setTrashedOptions] = useState({});
  const [restoringOption, setRestoringOption] = useState(null);

  // Load installed packages
  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'installed') {
        loadInstalledPackages();
      } else if (activeTab === 'trashed') {
        loadTrashedOptions();
      } else {
        loadTopPackages();
      }
      loadStarredPackages();
      loadClothingCategoriesStatus();
      loadFaceHeadCategoriesStatus();
      loadAestheticStyleCategoriesStatus();
      loadFramingCompositionCategoriesStatus();
      loadBackgroundEnvironmentCategoriesStatus();
      loadBodyPoseCategoriesStatus();
    }
  }, [isOpen, user, activeTab]);

  // Load trashed options
  const loadTrashedOptions = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const profile = await getUserProfile(user.uid);
      const deletedOptions = profile?.deletedOptions || {};
      setTrashedOptions(deletedOptions);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading trashed options:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Restore a trashed option
  const restoreOption = async (category, optionId) => {
    if (!user) return;
    
    setRestoringOption(`${category}-${optionId}`);
    setError('');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const profile = await getUserProfile(user.uid);
      const deletedOptions = profile?.deletedOptions || {};
      const categoryDeleted = deletedOptions[category] || [];
      
      // Remove from deleted options
      const updatedDeleted = {
        ...deletedOptions,
        [category]: categoryDeleted.filter(id => id !== optionId)
      };
      
      // If category is empty, remove it
      if (updatedDeleted[category].length === 0) {
        delete updatedDeleted[category];
      }
      
      await updateDoc(userRef, {
        deletedOptions: updatedDeleted,
        updatedAt: serverTimestamp(),
      });
      
      // Reload trashed options
      await loadTrashedOptions();
      
      // Notify parent to refresh
      if (onClothingCategoriesUpdate) {
        onClothingCategoriesUpdate();
      }
      
      // Also refresh user data in parent
      if (user?.uid) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          // Trigger a refresh by updating state
          setTrashedOptions(profile.deletedOptions || {});
        }
      }
    } catch (err) {
      console.error('[InstalledPackagesModal] Error restoring option:', err);
      setError(getErrorMessage(err));
    } finally {
      setRestoringOption(null);
    }
  };

  // Load clothing categories status
  const loadClothingCategoriesStatus = async () => {
    if (!user) return;
    try {
      const enabled = await getEnabledClothingCategories(user.uid);
      setEnabledClothingCategoriesCount(enabled?.length || 0);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading clothing categories status:', err);
    }
  };

  // Load Face & Head categories status
  const loadFaceHeadCategoriesStatus = async () => {
    if (!user) return;
    try {
      const enabled = await getEnabledFaceHeadCategories(user.uid);
      setEnabledFaceHeadCategoriesCount(enabled?.length || 0);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading Face & Head categories status:', err);
    }
  };

  // Load Aesthetic & Style categories status
  const loadAestheticStyleCategoriesStatus = async () => {
    if (!user) return;
    try {
      const enabled = await getEnabledAestheticStyleCategories(user.uid);
      setEnabledAestheticStyleCategoriesCount(enabled?.length || 0);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading Aesthetic & Style categories status:', err);
    }
  };

  // Load Framing & Composition categories status
  const loadFramingCompositionCategoriesStatus = async () => {
    if (!user) return;
    try {
      const enabled = await getEnabledFramingCompositionCategories(user.uid);
      setEnabledFramingCompositionCategoriesCount(enabled?.length || 0);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading Framing & Composition categories status:', err);
    }
  };

  // Load Background & Environment categories status
  const loadBackgroundEnvironmentCategoriesStatus = async () => {
    if (!user) return;
    try {
      const enabled = await getEnabledBackgroundEnvironmentCategories(user.uid);
      setEnabledBackgroundEnvironmentCategoriesCount(enabled?.length || 0);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading Background & Environment categories status:', err);
    }
  };

  // Load Body & Pose categories status
  const loadBodyPoseCategoriesStatus = async () => {
    if (!user) return;
    try {
      const enabled = await getEnabledBodyPoseCategories(user.uid);
      setEnabledBodyPoseCategoriesCount(enabled?.length || 0);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading Body & Pose categories status:', err);
    }
  };

  const loadStarredPackages = async () => {
    if (!user) return;
    try {
      const starred = await getUserStarredPackages(user.uid);
      setStarredPackageIds(starred);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading starred packages:', err);
    }
  };

  const loadInstalledPackages = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const profile = await getUserProfile(user.uid);
      const installedIds = profile?.installedPackages || [];
      const versions = profile?.installedPackageVersions || {};
      
      // Always include all official packages in installed list
      const officialPackageIds = [
        OFFICIAL_CLOTHING_PACKAGE_ID,
        OFFICIAL_FACE_HEAD_PACKAGE_ID,
        OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID,
        OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID,
        OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID,
      ];
      const allInstalledIds = [
        ...officialPackageIds,
        ...installedIds.filter(id => !officialPackageIds.includes(id))
      ];
      setInstalledPackageIds(allInstalledIds);

      // Create all official packages in sidebar order:
      // 1. Background & Environment
      // 2. Framing & Composition
      // 3. Aesthetic & Style
      // 4. Clothes & Styling
      // 5. Face & Head
      // 6. Body & Pose
      const officialPackages = [
        createOfficialBackgroundEnvironmentPackage(enabledBackgroundEnvironmentCategoriesCount),
        createOfficialFramingCompositionPackage(enabledFramingCompositionCategoriesCount),
        createOfficialAestheticStylePackage(enabledAestheticStyleCategoriesCount),
        createOfficialClothingPackage(enabledClothingCategoriesCount),
        createOfficialFaceHeadPackage(enabledFaceHeadCategoriesCount),
        createOfficialBodyPosePackage(enabledBodyPoseCategoriesCount),
      ];

      if (installedIds.length === 0) {
        // Only official packages
        setInstalledPackages(officialPackages);
        setLoading(false);
        return;
      }

      // Load package details for community packages
      const communityPackages = await Promise.all(
        installedIds
          .filter(id => !officialPackageIds.includes(id))
          .map(async (packageId) => {
            try {
              console.log('[InstalledPackagesModal] Loading package:', packageId);
              const pkg = await getPackage(packageId);
              return pkg;
            } catch (err) {
              console.error(`[InstalledPackagesModal] Error loading package ${packageId}:`, err);
              return null;
            }
          })
      );

      const validPackages = communityPackages.filter(pkg => pkg !== null);
      // User-installed packages appear first, then official packages
      const allPackages = [...validPackages, ...officialPackages];
      console.log('[InstalledPackagesModal] Loaded', allPackages.length, 'installed packages (including official)');
      setInstalledPackages(allPackages);
      setPackageVersions(versions);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading installed packages:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadTopPackages = async () => {
    setLoading(true);
    setError('');

    try {
      const packages = await getTopStarredPackages({ limit: 20 });
      console.log('[InstalledPackagesModal] Loaded', packages.length, 'top packages');
      setTopPackages(packages);

      // Also refresh installed packages list for checking status
      if (user) {
        const profile = await getUserProfile(user.uid);
        const installedIds = profile?.installedPackages || [];
        // Always include all official packages (in sidebar order)
      const officialPackageIds = [
        OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID,
        OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID,
        OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID,
        OFFICIAL_CLOTHING_PACKAGE_ID,
        OFFICIAL_FACE_HEAD_PACKAGE_ID,
        OFFICIAL_BODY_POSE_PACKAGE_ID,
      ];
        const allInstalledIds = [
          ...officialPackageIds,
          ...installedIds.filter(id => !officialPackageIds.includes(id))
        ];
        setInstalledPackageIds(allInstalledIds);
      }
    } catch (err) {
      console.error('[InstalledPackagesModal] Error loading top packages:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle star/unstar
  const handleToggleStar = async (packageId) => {
    if (!user) {
      setError('Please sign in to star packages');
      return;
    }

    if (starringPackage) return;
    setStarringPackage(packageId);
    setError('');

    try {
      const isStarred = starredPackageIds.includes(packageId);
      
      if (isStarred) {
        await unstarPackage(user.uid, packageId);
        setStarredPackageIds(prev => prev.filter(id => id !== packageId));
        // Update star count in local state
        setTopPackages(prev => prev.map(pkg => {
          const pkgId = pkg.packageId || pkg.id;
          if (pkgId === packageId) {
            return {
              ...pkg,
              stats: {
                ...pkg.stats,
                stars: Math.max(0, (pkg.stats?.stars || 0) - 1)
              }
            };
          }
          return pkg;
        }));
        setInstalledPackages(prev => prev.map(pkg => {
          const pkgId = pkg.packageId || pkg.id;
          if (pkgId === packageId) {
            return {
              ...pkg,
              stats: {
                ...pkg.stats,
                stars: Math.max(0, (pkg.stats?.stars || 0) - 1)
              }
            };
          }
          return pkg;
        }));
      } else {
        await starPackage(user.uid, packageId);
        setStarredPackageIds(prev => [...prev, packageId]);
        // Update star count in local state
        setTopPackages(prev => prev.map(pkg => {
          const pkgId = pkg.packageId || pkg.id;
          if (pkgId === packageId) {
            return {
              ...pkg,
              stats: {
                ...pkg.stats,
                stars: (pkg.stats?.stars || 0) + 1
              }
            };
          }
          return pkg;
        }));
        setInstalledPackages(prev => prev.map(pkg => {
          const pkgId = pkg.packageId || pkg.id;
          if (pkgId === packageId) {
            return {
              ...pkg,
              stats: {
                ...pkg.stats,
                stars: (pkg.stats?.stars || 0) + 1
              }
            };
          }
          return pkg;
        }));
      }
    } catch (err) {
      console.error('[InstalledPackagesModal] Error toggling star:', err);
      setError(getErrorMessage(err));
    } finally {
      setStarringPackage(null);
    }
  };

  // Handle install from top packages
  const handleInstall = async (pkg) => {
    if (!user) {
      setError('Please sign in to install packages');
      return;
    }

    const packageId = pkg.packageId || pkg.id;
    if (installingPackage) return;
    setInstallingPackage(packageId);
    setError('');

    try {
      await installPackage(user.uid, packageId);
      setInstalledPackageIds(prev => [...prev, packageId]);
      console.log('[InstalledPackagesModal] Package installed:', packageId);
    } catch (err) {
      console.error('[InstalledPackagesModal] Error installing package:', err);
      setError(getErrorMessage(err));
    } finally {
      setInstallingPackage(null);
    }
  };

  // Handle uninstall
  const handleUninstall = async (packageId) => {
    if (!user) {
      setError('Please sign in to do that');
      return;
    }

    if (uninstalling) return;

    setUninstalling(packageId);
    setError('');

    try {
      console.log('[InstalledPackagesModal] Uninstalling package:', packageId);
      await uninstallPackage(user.uid, packageId);
      console.log('[InstalledPackagesModal] Package uninstalled successfully');
      
      // Remove from local state
      setInstalledPackages(installedPackages.filter(pkg => (pkg.packageId || pkg.id) !== packageId));
      setInstalledPackageIds(prev => prev.filter(id => id !== packageId));
      setConfirmUninstall(null);
      
      if (onUninstall) {
        onUninstall(packageId);
      }
    } catch (err) {
      console.error('[InstalledPackagesModal] Error uninstalling package:', err);
      setError(getErrorMessage(err));
    } finally {
      setUninstalling(null);
    }
  };

  // Check for version updates
  const checkVersionUpdate = (pkg) => {
    const installedVersion = packageVersions[pkg.packageId || pkg.id];
    const currentVersion = pkg.version || '1.0.0';
    return installedVersion && installedVersion !== currentVersion;
  };

  if (!isOpen) return null;

  const currentPackages = activeTab === 'installed' ? installedPackages : activeTab === 'trashed' ? [] : topPackages;

  // Helper to get option name from ID
  const getOptionName = (category, optionId) => {
    if (!categories || !categories[category]) return `Option ${optionId}`;
    
    const defaultOptions = categories[category] || [];
    const customOptions = (userCustomOptions && userCustomOptions[category]) || [];
    
    // Check if it's an index (default option)
    if (typeof optionId === 'number' || (typeof optionId === 'string' && /^\d+$/.test(optionId))) {
      const index = parseInt(optionId);
      if (index < defaultOptions.length) {
        return defaultOptions[index] || `Option ${index}`;
      }
    }
    
    // Check custom options by ID
    const customOption = customOptions.find(opt => opt.id === optionId);
    if (customOption) {
      return customOption.text || customOption.title || `Custom Option`;
    }
    
    return `Option ${optionId}`;
  };

  return (
    <div
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(236, 72, 153, 0.2)',
          position: 'relative',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          display: 'flex',
          flexDirection: 'column',
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
        <div style={{ padding: '32px 32px 0' }}>
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
            Features & Packages
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            Configure built-in features or discover and install community packages
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('top')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: activeTab === 'top' 
                  ? 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: activeTab === 'top' 
                  ? 'none' 
                  : '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'top') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'top') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <TrendingUp size={16} />
              Top Packages
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: activeTab === 'installed' 
                  ? 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: activeTab === 'installed' 
                  ? 'none' 
                  : '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'installed') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'installed') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <Package size={16} />
              Installed Packages
              <span style={{ 
                marginLeft: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {installedPackageIds.length}
              </span>
            </button>
            <button
              data-modal-trash-icon
              onClick={() => setActiveTab('trashed')}
              data-trash-tab="trashed-options"
              style={{
                flex: 1,
                padding: '12px 20px',
                background: activeTab === 'trashed' 
                  ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: activeTab === 'trashed' 
                  ? 'none' 
                  : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'trashed') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'trashed') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <Trash2 size={16} />
              Trashed Options
              {(() => {
                const totalTrashed = Object.values(trashedOptions).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                return totalTrashed > 0 ? (
                  <span style={{ 
                    marginLeft: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    {totalTrashed}
                  </span>
                ) : null;
              })()}
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px', overflow: 'auto', flex: 1 }}>
          {/* Creator Benefits Info - Only on Top Packages tab */}
          {activeTab === 'top' && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                minWidth: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}>💎</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                  Become a Creator
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.5'
                }}>
                  Create and publish your own packages! When users who install your package purchase gems, you automatically earn <strong style={{ color: '#fbbf24' }}>5% of their purchase</strong> as complimentary gems. View your earnings in your profile.
                </p>
              </div>
            </div>
          )}

          {/* Community Packages Section Header - Only on Top Packages tab */}
          {activeTab === 'top' && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                Community Packages
              </h3>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && activeTab !== 'trashed' ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#ec4899' }} />
            </div>
          ) : activeTab === 'trashed' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={24} className="spinning" style={{ color: '#ec4899' }} />
                </div>
              ) : Object.keys(trashedOptions).length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  <Trash2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px', margin: 0 }}>No trashed options</p>
                  <p style={{ fontSize: '14px', margin: '8px 0 0', opacity: 0.7 }}>
                    Trash options from the word buttons to see them here
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {Object.entries(trashedOptions).map(([category, optionIds], categoryIndex) => {
                    if (!optionIds || optionIds.length === 0) return null;
                    
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: categoryIndex * 0.05 }}
                        style={{
                          padding: '20px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '12px',
                        }}
                      >
                        <h3 style={{
                          margin: '0 0 16px 0',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Trash2 size={18} style={{ color: '#ef4444' }} />
                          {category}
                          <span style={{
                            marginLeft: '8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: '#fca5a5'
                          }}>
                            {optionIds.length} {optionIds.length === 1 ? 'option' : 'options'}
                          </span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {optionIds.map((optionId, optionIndex) => {
                            const optionName = getOptionName(category, optionId);
                            const isRestoring = restoringOption === `${category}-${optionId}`;
                            
                            return (
                              <div
                                key={`${category}-${optionId}-${optionIndex}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 16px',
                                  background: 'rgba(0, 0, 0, 0.2)',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                }}
                              >
                                <span style={{
                                  fontSize: '14px',
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  flex: 1
                                }}>
                                  {optionName}
                                </span>
                                <button
                                  onClick={() => restoreOption(category, optionId)}
                                  disabled={isRestoring}
                                  style={{
                                    padding: '6px 12px',
                                    background: isRestoring 
                                      ? 'rgba(34, 197, 94, 0.3)' 
                                      : 'rgba(34, 197, 94, 0.2)',
                                    border: '1px solid rgba(34, 197, 94, 0.4)',
                                    borderRadius: '6px',
                                    color: '#22c55e',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: isRestoring ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                    opacity: isRestoring ? 0.6 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isRestoring) {
                                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
                                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isRestoring) {
                                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                                    }
                                  }}
                                >
                                  {isRestoring ? (
                                    <>
                                      <Loader2 size={14} className="spinning" />
                                      Restoring...
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw size={14} />
                                      Restore
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          ) : currentPackages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.5)' }}>
              <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                {activeTab === 'installed' ? 'No community packages installed yet' : 'No community packages yet'}
              </p>
              <p style={{ fontSize: '14px' }}>
                {activeTab === 'installed' 
                  ? 'Browse the Top Packages tab to discover and install community-created packages'
                  : 'Be the first to create and share a package with the community!'}
              </p>
              {activeTab === 'installed' && (
                <button
                  onClick={() => setActiveTab('top')}
                  style={{
                    marginTop: '16px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Browse Top Packages
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AnimatePresence mode="popLayout">
                {currentPackages.map((pkg, index) => {
                  const packageId = pkg.packageId || pkg.id;
                  const officialPackageIds = [
                    OFFICIAL_CLOTHING_PACKAGE_ID,
                    OFFICIAL_FACE_HEAD_PACKAGE_ID,
                    OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID,
                    OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID,
                    OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID,
                  ];
                  const isOfficial = pkg.isOfficial || officialPackageIds.includes(packageId);
                  const hasUpdate = activeTab === 'installed' && checkVersionUpdate(pkg) && !isOfficial;
                  const isUninstalling = uninstalling === packageId;
                  const showConfirm = confirmUninstall === packageId;
                  const isStarred = starredPackageIds.includes(packageId);
                  const isStarring = starringPackage === packageId;
                  const isInstalled = installedPackageIds.includes(packageId) || isOfficial;
                  const isInstalling = installingPackage === packageId;
                  const stars = pkg.stats?.stars || 0;
                  const downloads = pkg.stats?.downloads || 0;
                  // Get enabled count based on package type
                  let enabledCount = 0;
                  if (packageId === OFFICIAL_CLOTHING_PACKAGE_ID) {
                    enabledCount = pkg.enabledCategoriesCount || enabledClothingCategoriesCount;
                  } else if (packageId === OFFICIAL_FACE_HEAD_PACKAGE_ID) {
                    enabledCount = pkg.enabledCategoriesCount || enabledFaceHeadCategoriesCount;
                  } else if (packageId === OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID) {
                    enabledCount = pkg.enabledCategoriesCount || enabledAestheticStyleCategoriesCount;
                  } else if (packageId === OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID) {
                    enabledCount = pkg.enabledCategoriesCount || enabledFramingCompositionCategoriesCount;
                  } else if (packageId === OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID) {
                    enabledCount = pkg.enabledCategoriesCount || enabledBackgroundEnvironmentCategoriesCount;
                  } else if (packageId === OFFICIAL_BODY_POSE_PACKAGE_ID) {
                    enabledCount = pkg.enabledCategoriesCount || enabledBodyPoseCategoriesCount;
                  } else {
                    enabledCount = pkg.enabledCategoriesCount || 0;
                  }

                  return (
                    <motion.div
                      key={packageId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      style={{
                        padding: '20px',
                        background: isOfficial 
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isOfficial
                          ? '1px solid rgba(139, 92, 246, 0.3)'
                          : '1px solid rgba(236, 72, 153, 0.2)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (isOfficial) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                        } else {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isOfficial) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        } else {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {/* Rank badge for top packages */}
                            {activeTab === 'top' && (
                              <span
                                style={{
                                  padding: '4px 10px',
                                  background: index < 3 
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: '6px',
                                  color: index < 3 ? '#000' : '#fff',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                }}
                              >
                                #{index + 1}
                              </span>
                            )}
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#ffffff' }}>
                              {pkg.name}
                            </h3>
                            {hasUpdate && (
                              <span
                                style={{
                                  padding: '4px 10px',
                                  background: 'rgba(251, 191, 36, 0.2)',
                                  border: '1px solid rgba(251, 191, 36, 0.4)',
                                  borderRadius: '6px',
                                  color: '#fbbf24',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <RefreshCw size={12} />
                                Update Available
                              </span>
                            )}
                            {isInstalled && activeTab === 'top' && !isOfficial && (
                              <span
                                style={{
                                  padding: '4px 10px',
                                  background: 'rgba(34, 197, 94, 0.2)',
                                  border: '1px solid rgba(34, 197, 94, 0.4)',
                                  borderRadius: '6px',
                                  color: '#22c55e',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Installed
                              </span>
                            )}
                            {isOfficial && enabledCount > 0 && (
                              <span
                                style={{
                                  padding: '4px 10px',
                                  background: 'rgba(34, 197, 94, 0.2)',
                                  border: '1px solid rgba(34, 197, 94, 0.4)',
                                  borderRadius: '6px',
                                  color: '#22c55e',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <CheckCircle2 size={12} />
                                {enabledCount} enabled
                              </span>
                            )}
                          </div>
                          
                          {pkg.description && (
                            <p style={{ 
                              fontSize: '14px', 
                              color: 'rgba(255, 255, 255, 0.6)',
                              margin: '0 0 8px 0',
                              lineHeight: '1.5'
                            }}>
                              {pkg.description}
                            </p>
                          )}

                          {pkg.author && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              marginTop: '8px',
                              fontSize: '13px',
                              color: isOfficial ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.6)'
                            }}>
                              {pkg.author.avatar && (
                                <img
                                  src={pkg.author.avatar}
                                  alt={pkg.author.displayName}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                              )}
                              <span>
                                {isOfficial ? 'Official package from ' : 'by '}
                                {pkg.author.displayName || (isOfficial ? 'Pose Prompter' : 'Anonymous')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Star Button - Hide for official packages */}
                          {user && !isOfficial && (
                            <motion.button
                              onClick={() => handleToggleStar(packageId)}
                              disabled={isStarring}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                padding: '10px 16px',
                                background: isStarred 
                                  ? 'rgba(251, 191, 36, 0.2)' 
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${isStarred ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                                borderRadius: '8px',
                                color: isStarred ? '#fbbf24' : '#ffffff',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isStarring ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: isStarring ? 0.5 : 1,
                              }}
                            >
                              {isStarring ? (
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <Star size={16} fill={isStarred ? '#fbbf24' : 'transparent'} />
                              )}
                              {isStarred ? 'Starred' : 'Star'}
                            </motion.button>
                          )}

                          {/* Install/Uninstall/Configure Button */}
                          {activeTab === 'installed' ? (
                            isOfficial ? (
                              <button
                                onClick={() => {
                                  if (packageId === OFFICIAL_CLOTHING_PACKAGE_ID) {
                                    setClothingCategoriesModalOpen(true);
                                  } else if (packageId === OFFICIAL_FACE_HEAD_PACKAGE_ID) {
                                    setFaceHeadModalOpen(true);
                                  } else if (packageId === OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID) {
                                    setAestheticStyleModalOpen(true);
                                  } else if (packageId === OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID) {
                                    setFramingCompositionModalOpen(true);
                                  } else if (packageId === OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID) {
                                    setBackgroundEnvironmentModalOpen(true);
                                  } else if (packageId === OFFICIAL_BODY_POSE_PACKAGE_ID) {
                                    setBodyPoseModalOpen(true);
                                  }
                                }}
                                style={{
                                  padding: '10px 16px',
                                  background: 'rgba(139, 92, 246, 0.3)',
                                  border: '1px solid rgba(139, 92, 246, 0.5)',
                                  borderRadius: '8px',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = 'rgba(139, 92, 246, 0.4)';
                                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                }}
                              >
                                <Settings size={16} />
                                Configure
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmUninstall(packageId)}
                                disabled={isUninstalling}
                                style={{
                                  padding: '10px 16px',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  borderRadius: '8px',
                                  color: '#fca5a5',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  cursor: isUninstalling ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  opacity: isUninstalling ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isUninstalling) {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isUninstalling) {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                  }
                                }}
                              >
                                {isUninstalling ? (
                                  <>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={16} />
                                    Uninstall
                                  </>
                                )}
                              </button>
                            )
                          ) : (
                            !isOfficial && (
                              <motion.button
                                onClick={() => handleInstall(pkg)}
                                disabled={isInstalled || isInstalling}
                                whileHover={!isInstalled ? { scale: 1.05 } : {}}
                                whileTap={!isInstalled ? { scale: 0.95 } : {}}
                                style={{
                                  padding: '10px 16px',
                                  background: isInstalled 
                                    ? 'rgba(34, 197, 94, 0.2)' 
                                    : 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                                  border: isInstalled 
                                    ? '1px solid rgba(34, 197, 94, 0.4)' 
                                    : 'none',
                                  borderRadius: '8px',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: isInstalled || isInstalling ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  opacity: isInstalling ? 0.5 : 1,
                                }}
                              >
                                {isInstalling ? (
                                  <>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Installing...
                                  </>
                                ) : isInstalled ? (
                                  <>
                                    <Package size={16} />
                                    Installed
                                  </>
                                ) : (
                                  <>
                                    <Download size={16} />
                                    Install
                                  </>
                                )}
                              </motion.button>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Confirmation Dialog */}
      {confirmUninstall && (
        <ConfirmationDialog
          isOpen={!!confirmUninstall}
          onClose={() => setConfirmUninstall(null)}
          onConfirm={() => handleUninstall(confirmUninstall)}
          title="Uninstall Package"
          message={`Are you sure you want to uninstall "${installedPackages.find(p => (p.packageId || p.id) === confirmUninstall)?.name || 'this package'}"? This will remove all options from this package.`}
          confirmText="Uninstall"
          cancelText="Cancel"
          type="danger"
          loading={uninstalling === confirmUninstall}
        />
      )}

      {/* Clothing Categories Modal */}
      <ClothingCategoriesModal
        isOpen={clothingCategoriesModalOpen}
        onClose={() => {
          setClothingCategoriesModalOpen(false);
          // Reload status after closing
          if (user) {
            loadClothingCategoriesStatus();
            // Refresh installed packages to update the official package display
            if (activeTab === 'installed') {
              loadInstalledPackages();
            }
          }
        }}
        onSave={(selectedCategories) => {
          const count = selectedCategories?.length || 0;
          setEnabledClothingCategoriesCount(count);
          // Update the official package in the installed list if it exists
          setInstalledPackages(prev => prev.map(pkg => {
            if (pkg.isOfficial || (pkg.packageId || pkg.id) === OFFICIAL_CLOTHING_PACKAGE_ID) {
              return { ...pkg, enabledCategoriesCount: count };
            }
            return pkg;
          }));
          if (onClothingCategoriesUpdate) {
            onClothingCategoriesUpdate(selectedCategories);
          }
        }}
      />

      {/* Face & Head Category Selection Modal */}
      <CategorySelectionModal
        isOpen={faceHeadModalOpen}
        onClose={() => {
          setFaceHeadModalOpen(false);
          if (user) {
            loadFaceHeadCategoriesStatus();
            if (activeTab === 'installed') {
              loadInstalledPackages();
            }
          }
        }}
        onSave={(selectedCategories) => {
          const count = selectedCategories?.length || 0;
          setEnabledFaceHeadCategoriesCount(count);
          setInstalledPackages(prev => prev.map(pkg => {
            if ((pkg.packageId || pkg.id) === OFFICIAL_FACE_HEAD_PACKAGE_ID) {
              return { ...pkg, enabledCategoriesCount: count };
            }
            return pkg;
          }));
          if (onClothingCategoriesUpdate) {
            onClothingCategoriesUpdate();
          }
        }}
        categoryGroup="faceHead"
        optionalCategories={[
          { key: 'HeadPosition', displayName: 'Head Position', count: categories?.HeadPosition?.length || 0 },
          { key: 'Eyes', displayName: 'Eyes', count: categories?.Eyes?.length || 0 },
          { key: 'Mouth', displayName: 'Mouth', count: categories?.Mouth?.length || 0 },
          { key: 'Hair', displayName: 'Hair', count: categories?.Hair?.length || 0 },
        ]}
        defaultCategory="FacialExpression"
        defaultCategoryCount={categories?.FacialExpression?.length || 0}
        title="Select Face & Head Categories"
        description="Choose which face & head categories to include in your setup."
        categories={categories}
        userDeletedOptions={userDeletedOptions}
        onTrashOption={onTrashOption}
        userCustomOptions={userCustomOptions}
      />

      {/* Aesthetic & Style Category Selection Modal */}
      <CategorySelectionModal
        isOpen={aestheticStyleModalOpen}
        onClose={() => {
          setAestheticStyleModalOpen(false);
          if (user) {
            loadAestheticStyleCategoriesStatus();
            if (activeTab === 'installed') {
              loadInstalledPackages();
            }
          }
        }}
        onSave={(selectedCategories) => {
          const count = selectedCategories?.length || 0;
          setEnabledAestheticStyleCategoriesCount(count);
          setInstalledPackages(prev => prev.map(pkg => {
            if ((pkg.packageId || pkg.id) === OFFICIAL_AESTHETIC_STYLE_PACKAGE_ID) {
              return { ...pkg, enabledCategoriesCount: count };
            }
            return pkg;
          }));
          if (onClothingCategoriesUpdate) {
            onClothingCategoriesUpdate();
          }
        }}
        categoryGroup="aestheticStyle"
        optionalCategories={[
          { key: 'Lighting', displayName: 'Lighting', count: categories?.Lighting?.length || 0 },
          { key: 'ColorPalette', displayName: 'Color Palette', count: categories?.ColorPalette?.length || 0 },
          { key: 'Texture', displayName: 'Texture', count: categories?.Texture?.length || 0 },
          { key: 'Mood', displayName: 'Mood', count: categories?.Mood?.length || 0 },
          { key: 'PhotoStyle', displayName: 'Photo Style', count: categories?.PhotoStyle?.length || 0 },
        ]}
        defaultCategory="Aesthetic"
        defaultCategoryCount={categories?.Aesthetic?.length || 0}
        title="Select Aesthetic & Style Categories"
        description="Choose which aesthetic & style categories to include in your setup."
        categories={categories}
        userDeletedOptions={userDeletedOptions}
        onTrashOption={onTrashOption}
        userCustomOptions={userCustomOptions}
      />

      {/* Framing & Composition Category Selection Modal */}
      <CategorySelectionModal
        isOpen={framingCompositionModalOpen}
        onClose={() => {
          setFramingCompositionModalOpen(false);
          if (user) {
            loadFramingCompositionCategoriesStatus();
            if (activeTab === 'installed') {
              loadInstalledPackages();
            }
          }
        }}
        onSave={(selectedCategories) => {
          const count = selectedCategories?.length || 0;
          setEnabledFramingCompositionCategoriesCount(count);
          setInstalledPackages(prev => prev.map(pkg => {
            if ((pkg.packageId || pkg.id) === OFFICIAL_FRAMING_COMPOSITION_PACKAGE_ID) {
              return { ...pkg, enabledCategoriesCount: count };
            }
            return pkg;
          }));
          if (onClothingCategoriesUpdate) {
            onClothingCategoriesUpdate();
          }
        }}
        categoryGroup="framingComposition"
        optionalCategories={[
          { key: 'Perspective', displayName: 'Perspective', count: categories?.Perspective?.length || 0 },
          { key: 'CameraAngle', displayName: 'Camera Angle', count: categories?.CameraAngle?.length || 0 },
          { key: 'CameraType', displayName: 'Camera Type', count: categories?.CameraType?.length || 0 },
        ]}
        defaultCategory="Framing"
        defaultCategoryCount={categories?.Framing?.length || 0}
        title="Select Framing & Composition Categories"
        description="Choose which framing & composition categories to include in your setup."
        categories={categories}
        userDeletedOptions={userDeletedOptions}
        onTrashOption={onTrashOption}
        userCustomOptions={userCustomOptions}
      />

      {/* Background & Environment Category Selection Modal */}
      <CategorySelectionModal
        isOpen={backgroundEnvironmentModalOpen}
        onClose={() => {
          setBackgroundEnvironmentModalOpen(false);
          if (user) {
            loadBackgroundEnvironmentCategoriesStatus();
            if (activeTab === 'installed') {
              loadInstalledPackages();
            }
          }
        }}
        onSave={(selectedCategories) => {
          const count = selectedCategories?.length || 0;
          setEnabledBackgroundEnvironmentCategoriesCount(count);
          setInstalledPackages(prev => prev.map(pkg => {
            if ((pkg.packageId || pkg.id) === OFFICIAL_BACKGROUND_ENVIRONMENT_PACKAGE_ID) {
              return { ...pkg, enabledCategoriesCount: count };
            }
            return pkg;
          }));
          if (onClothingCategoriesUpdate) {
            onClothingCategoriesUpdate();
          }
        }}
        categoryGroup="backgroundEnvironment"
        optionalCategories={[
          { key: 'Props', displayName: 'Props', count: categories?.Props?.length || 0 },
        ]}
        defaultCategory="Background"
        defaultCategoryCount={categories?.Background?.length || 0}
        title="Select Background & Environment Categories"
        description="Choose which background & environment categories to include in your setup."
        categories={categories}
        userDeletedOptions={userDeletedOptions}
        onTrashOption={onTrashOption}
        userCustomOptions={userCustomOptions}
      />

      {/* Body & Pose Category Selection Modal */}
      <CategorySelectionModal
        isOpen={bodyPoseModalOpen}
        onClose={() => setBodyPoseModalOpen(false)}
        onSave={async (selectedCategories) => {
          const count = selectedCategories?.length || 0;
          setEnabledBodyPoseCategoriesCount(count);
          setInstalledPackages(prev => prev.map(pkg => {
            if ((pkg.packageId || pkg.id) === OFFICIAL_BODY_POSE_PACKAGE_ID) {
              return { ...pkg, enabledCategoriesCount: count };
            }
            return pkg;
          }));
          // Reload status immediately to update the count
          await loadBodyPoseCategoriesStatus();
          // Refresh the parent component's state
          if (onClothingCategoriesUpdate) {
            await onClothingCategoriesUpdate();
          }
          // Reload installed packages to reflect changes
          if (activeTab === 'installed') {
            await loadInstalledPackages();
          }
        }}
        categoryGroup="bodyPose"
        optionalCategories={[
          { key: 'Torso', displayName: 'Torso', count: categories?.Torso?.length || 0 },
          { key: 'Arms', displayName: 'Arms', count: categories?.Arms?.length || 0 },
          { key: 'Hands', displayName: 'Hands', count: categories?.Hands?.length || 0 },
          { key: 'Legs', displayName: 'Legs', count: categories?.Legs?.length || 0 },
          { key: 'Feet', displayName: 'Feet', count: categories?.Feet?.length || 0 },
          { key: 'BodySize', displayName: 'Body Size', count: categories?.BodySize?.length || 0 },
        ]}
        defaultCategory="BodyPose"
        defaultCategoryCount={categories?.BodyPose?.length || 0}
        title="Select Body & Pose Categories"
        description="Choose which body & pose categories to include in your setup. All categories are enabled by default."
        categories={categories}
        userDeletedOptions={userDeletedOptions}
        onTrashOption={onTrashOption}
        userCustomOptions={userCustomOptions}
      />
    </div>
  );
};

export default InstalledPackagesModal;
