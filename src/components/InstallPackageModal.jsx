import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, Plus, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/UserContext';
import { getUserProfile, installPackageWithMerge } from '../firestoreService';
import { getPackage, incrementDownloads } from '../packageService';
import { categoryDisplayNames } from './CreatePackageModal';
import Confetti from './Animations/Confetti';
import CheckmarkAnimation from './Animations/CheckmarkAnimation';
import ProgressBar from './Progress/ProgressBar';
import { getErrorMessage } from '../utils/errorHandler';

const InstallPackageModal = ({ package: pkg, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [error, setError] = useState('');
  const [installMode, setInstallMode] = useState('add'); // 'add', 'replace', 'new'
  const [userCustomOptions, setUserCustomOptions] = useState({});
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  // Load user data
  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    if (!user) return;
    setLoadingUserData(true);
    try {
      console.log('[InstallPackageModal] Loading user data');
      const profile = await getUserProfile(user.uid);
      if (profile && profile.customOptions) {
        setUserCustomOptions(profile.customOptions);
        console.log('[InstallPackageModal] User data loaded');
      }
    } catch (err) {
      console.error('[InstallPackageModal] Error loading user data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingUserData(false);
    }
  };

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setInstallMode('add');
      setConfirmationStep(false);
      setError('');
    }
  }, [isOpen]);

  // Calculate what will change
  const getChangesPreview = () => {
    if (!pkg || !pkg.options) return { newCategories: [], updatedCategories: [], conflicts: [] };

    const newCategories = [];
    const updatedCategories = [];
    const conflicts = [];

    Object.keys(pkg.options).forEach(category => {
      const packageOptions = pkg.options[category] || [];
      const userOptions = userCustomOptions[category] || [];

      if (userOptions.length === 0) {
        newCategories.push(category);
      } else {
        updatedCategories.push(category);
        if (installMode === 'replace') {
          conflicts.push({
            category,
            currentCount: userOptions.length,
            newCount: packageOptions.length,
          });
        } else if (installMode === 'add') {
          conflicts.push({
            category,
            currentCount: userOptions.length,
            addedCount: packageOptions.length,
            newTotal: userOptions.length + packageOptions.length,
          });
        }
      }
    });

    return { newCategories, updatedCategories, conflicts };
  };

  const changes = getChangesPreview();

  // Handle install
  const handleInstall = async () => {
    if (!user || !pkg) {
      setError('Please sign in to do that');
      return;
    }

    if (loading) return; // Prevent double-clicks

    setLoading(true);
    setError('');
    setInstallProgress(0);

    try {
      console.log('[InstallPackageModal] Starting package installation:', pkg.packageId || pkg.id, installMode);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Install package with merge mode
      const result = await installPackageWithMerge(
        user.uid,
        {
          packageId: pkg.packageId || pkg.id,
          name: pkg.name,
          version: pkg.version || '1.0.0',
          options: pkg.options || {},
        },
        installMode
      );

      clearInterval(progressInterval);
      setInstallProgress(100);
      console.log('[InstallPackageModal] Package installed successfully');

      // Increment download count
      if (result.installed) {
        try {
          await incrementDownloads(pkg.packageId || pkg.id);
          console.log('[InstallPackageModal] Download count incremented');
        } catch (err) {
          console.error('[InstallPackageModal] Error incrementing downloads:', err);
          // Don't fail the installation if download count fails
        }
      }

      // Show success animation
      setShowSuccess(true);
      
      // Wait for animation, then close
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 2000);
    } catch (err) {
      console.error('[InstallPackageModal] Error installing package:', err);
      setError(getErrorMessage(err));
      setInstallProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !pkg) return null;

  return (
    <>
      {showSuccess && (
        <>
          <Confetti />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10002,
              pointerEvents: 'none',
            }}
          >
            <CheckmarkAnimation size={80} />
          </motion.div>
        </>
      )}
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
          maxWidth: '700px',
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
            Install Package
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            {pkg.name}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px' }}>
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
                marginBottom: '24px',
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {loadingUserData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
            </div>
          ) : !confirmationStep ? (
            <>
              {/* Install Mode Selection */}
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '16px',
                  }}
                >
                  Choose Installation Mode
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Add to Existing */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: installMode === 'add' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${installMode === 'add' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (installMode !== 'add') {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (installMode !== 'add') {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="installMode"
                      value="add"
                      checked={installMode === 'add'}
                      onChange={(e) => setInstallMode(e.target.value)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#8b5cf6',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Plus size={18} style={{ color: '#8b5cf6' }} />
                        <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>
                          Add to Existing
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
                        Add package options to your existing custom options. Your current options will be preserved.
                      </p>
                    </div>
                  </label>

                  {/* Replace Existing */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: installMode === 'replace' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${installMode === 'replace' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (installMode !== 'replace') {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (installMode !== 'replace') {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="installMode"
                      value="replace"
                      checked={installMode === 'replace'}
                      onChange={(e) => setInstallMode(e.target.value)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#8b5cf6',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <RefreshCw size={18} style={{ color: '#8b5cf6' }} />
                        <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>
                          Replace Existing
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
                        Replace your existing options in matching categories with package options.
                      </p>
                    </div>
                  </label>

                  {/* Create New Profile */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: installMode === 'new' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${installMode === 'new' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (installMode !== 'new') {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (installMode !== 'new') {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="installMode"
                      value="new"
                      checked={installMode === 'new'}
                      onChange={(e) => setInstallMode(e.target.value)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#8b5cf6',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <UserPlus size={18} style={{ color: '#8b5cf6' }} />
                        <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>
                          Create New Profile
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
                        Install package options as a new separate profile. Your current options remain unchanged.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Changes Preview */}
              <div
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '24px',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '16px',
                  }}
                >
                  What Will Change
                </h3>
                {changes.newCategories.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      New Categories ({changes.newCategories.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {changes.newCategories.map(cat => (
                        <span
                          key={cat}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            color: '#86efac',
                            fontSize: '12px',
                          }}
                        >
                          {categoryDisplayNames[cat] || cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {changes.updatedCategories.length > 0 && (
                  <div>
                    <div style={{ color: '#8b5cf6', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Updated Categories ({changes.updatedCategories.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {changes.conflicts.map((conflict, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '6px',
                            fontSize: '13px',
                          }}
                        >
                          <div style={{ color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                            {categoryDisplayNames[conflict.category] || conflict.category}
                          </div>
                          {installMode === 'replace' ? (
                            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {conflict.currentCount} options → {conflict.newCount} options
                            </div>
                          ) : (
                            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {conflict.currentCount} options → {conflict.newTotal} options (+{conflict.addedCount})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {changes.newCategories.length === 0 && changes.updatedCategories.length === 0 && (
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    No changes will be made. All categories already exist.
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setConfirmationStep(true)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div
                style={{
                  padding: '24px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                <Check size={48} style={{ color: '#8b5cf6', marginBottom: '16px' }} />
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '8px',
                  }}
                >
                  Ready to Install
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
                  {installMode === 'add' && 'Package options will be added to your existing options.'}
                  {installMode === 'replace' && 'Your existing options will be replaced with package options.'}
                  {installMode === 'new' && 'Package will be installed as a new profile.'}
                </p>
              </div>

              {/* Final Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setConfirmationStep(false)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  Back
                </button>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {loading && installProgress > 0 && (
                    <ProgressBar progress={installProgress} label="Installing package..." />
                  )}
                  <motion.button
                    onClick={handleInstall}
                    disabled={loading}
                    whileHover={!loading ? { y: -2, boxShadow: '0 6px 16px rgba(139, 92, 246, 0.5)' } : {}}
                    whileTap={!loading ? { scale: 0.95 } : {}}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: loading
                        ? 'rgba(139, 92, 246, 0.5)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Confirm Install
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    </>
  );
};

export default InstallPackageModal;

