import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, Trash2, Loader2, AlertCircle, RefreshCw, Star, Download, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/UserContext';
import { getUserProfile, uninstallPackage } from '../firestoreService';
import { getPackage, getTopStarredPackages, starPackage, unstarPackage, getUserStarredPackages, installPackage } from '../packageService';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmationDialog from './ConfirmationDialog';

const InstalledPackagesModal = ({ isOpen, onClose, onUninstall }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('top'); // 'installed' or 'top'
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

  // Load installed packages
  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'installed') {
        loadInstalledPackages();
      } else {
        loadTopPackages();
      }
      loadStarredPackages();
    }
  }, [isOpen, user, activeTab]);

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
      setInstalledPackageIds(installedIds);

      if (installedIds.length === 0) {
        setInstalledPackages([]);
        setLoading(false);
        return;
      }

      // Load package details
      const packages = await Promise.all(
        installedIds.map(async (packageId) => {
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

      const validPackages = packages.filter(pkg => pkg !== null);
      console.log('[InstalledPackagesModal] Loaded', validPackages.length, 'installed packages');
      setInstalledPackages(validPackages);
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
        setInstalledPackageIds(installedIds);
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

  const currentPackages = activeTab === 'installed' ? installedPackages : topPackages;

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
            Packages
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
            Discover popular packages or manage your installed ones
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
              My Installed ({installedPackageIds.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px', overflow: 'auto', flex: 1 }}>
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
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#ec4899' }} />
            </div>
          ) : currentPackages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.5)' }}>
              <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                {activeTab === 'installed' ? 'No installed packages' : 'No packages yet'}
              </p>
              <p style={{ fontSize: '14px' }}>
                {activeTab === 'installed' 
                  ? 'Check out the top packages to find something to install'
                  : 'Be the first to create and share a package!'}
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
                  const hasUpdate = activeTab === 'installed' && checkVersionUpdate(pkg);
                  const isUninstalling = uninstalling === packageId;
                  const showConfirm = confirmUninstall === packageId;
                  const isStarred = starredPackageIds.includes(packageId);
                  const isStarring = starringPackage === packageId;
                  const isInstalled = installedPackageIds.includes(packageId);
                  const isInstalling = installingPackage === packageId;
                  const stars = pkg.stats?.stars || 0;
                  const downloads = pkg.stats?.downloads || 0;

                  return (
                    <motion.div
                      key={packageId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      style={{
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(236, 72, 153, 0.2)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
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
                            {isInstalled && activeTab === 'top' && (
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

                          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Star count */}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                              <Star size={14} fill={stars > 0 ? '#fbbf24' : 'transparent'} />
                              {stars} {stars === 1 ? 'star' : 'stars'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Download size={14} />
                              {downloads} downloads
                            </span>
                            <span>•</span>
                            <span>Version: {pkg.version || '1.0.0'}</span>
                            {packageVersions[packageId] && packageVersions[packageId] !== (pkg.version || '1.0.0') && (
                              <span>Installed: {packageVersions[packageId]}</span>
                            )}
                            <span>•</span>
                            <span>{Object.keys(pkg.options || {}).length} categories</span>
                          </div>

                          {pkg.author && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              marginTop: '8px',
                              fontSize: '13px',
                              color: 'rgba(255, 255, 255, 0.6)'
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
                              <span>by {pkg.author.displayName || 'Anonymous'}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Star Button */}
                          {user && (
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

                          {/* Install/Uninstall Button */}
                          {activeTab === 'installed' ? (
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
                          ) : (
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
    </div>
  );
};

export default InstalledPackagesModal;
