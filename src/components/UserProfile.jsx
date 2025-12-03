import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Edit2, Save, X, Upload, Calendar, Package, Download, 
  FolderOpen, Settings, Moon, Sun, Sidebar, LayoutHorizontal, 
  Save as SaveIcon, Bell, Trash2, Loader2, AlertCircle, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  getSavedPromptSets,
  deletePromptSet,
  createUserProfile
} from '../firestoreService';
import { getUserPackages, getPackage } from '../packageService';
import { storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase-config';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedSets, setSavedSets] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [installedPackages, setInstalledPackages] = useState([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  // Edit states
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  // Settings
  const [settings, setSettings] = useState({
    defaultView: 'sidebar',
    theme: 'light',
    autoSave: true,
    emailNotifications: true
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Load profile and set up real-time listener
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        let userProfile = await getUserProfile(user.uid);
        
        if (!userProfile) {
          // Create profile if it doesn't exist
          await createUserProfile(user.uid, {
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            avatar: user.photoURL || '',
            bio: ''
          });
          userProfile = await getUserProfile(user.uid);
        }

        setProfile(userProfile);
        setDisplayName(userProfile.displayName || '');
        setBio(userProfile.bio || '');
        
        // Load settings from profile
        if (userProfile.settings) {
          setSettings({ ...settings, ...userProfile.settings });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Set up real-time listener for profile updates
    // CRITICAL FIX: Check if db is available before setting up listener
    if (!db) {
      console.warn('[UserProfile] Firestore db is not initialized, skipping real-time listener');
      return;
    }
    
    let unsubscribe = () => {};
    try {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({ id: docSnap.id, ...data });
          setDisplayName(data.displayName || '');
          setBio(data.bio || '');
          if (data.settings) {
            setSettings({ ...settings, ...data.settings });
          }
        }
      }, (error) => {
        console.error('[UserProfile] Real-time listener error:', error);
      });
    } catch (error) {
      console.error('[UserProfile] Error setting up real-time listener:', error);
    }

    return () => unsubscribe();
  }, [user]);

  // Load saved sets
  useEffect(() => {
    if (!user) return;
    
    const loadSets = async () => {
      setLoadingSets(true);
      try {
        const sets = await getSavedPromptSets(user.uid);
        setSavedSets(sets);
      } catch (err) {
        console.error('Error loading saved sets:', err);
      } finally {
        setLoadingSets(false);
      }
    };

    loadSets();
  }, [user]);

  // Load my packages
  useEffect(() => {
    if (!user) return;
    
    const loadMyPackages = async () => {
      setLoadingPackages(true);
      try {
        const packages = await getUserPackages(user.uid);
        setMyPackages(packages);
      } catch (err) {
        console.error('Error loading my packages:', err);
      } finally {
        setLoadingPackages(false);
      }
    };

    loadMyPackages();
  }, [user]);

  // Load installed packages
  useEffect(() => {
    if (!user || !profile) return;
    
    const loadInstalledPackages = async () => {
      if (!profile.installedPackages || profile.installedPackages.length === 0) {
        setInstalledPackages([]);
        return;
      }

      try {
        const packages = await Promise.all(
          profile.installedPackages.map(async (packageId) => {
            try {
              return await getPackage(packageId);
            } catch (err) {
              console.error(`Error loading package ${packageId}:`, err);
              return null;
            }
          })
        );
        setInstalledPackages(packages.filter(pkg => pkg !== null));
      } catch (err) {
        console.error('Error loading installed packages:', err);
      }
    };

    loadInstalledPackages();
  }, [user, profile]);

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setError('');

    if (!storage) {
      setError('Firebase storage is not initialized. Please check your Firebase configuration.');
      setUploadingAvatar(false);
      return;
    }

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile
      await updateUserProfile(user.uid, { avatar: downloadURL });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle display name update
  const handleDisplayNameSave = async () => {
    if (!user || !displayName.trim()) return;
    
    try {
      await updateUserProfile(user.uid, { displayName: displayName.trim() });
      setEditingDisplayName(false);
    } catch (err) {
      console.error('Error updating display name:', err);
      setError('Failed to update display name');
    }
  };

  // Handle bio update
  const handleBioSave = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.uid, { bio: bio.trim() });
      setEditingBio(false);
    } catch (err) {
      console.error('Error updating bio:', err);
      setError('Failed to update bio');
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async (newSettings) => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      await updateUserProfile(user.uid, { 
        settings: { ...settings, ...newSettings }
      });
      setSettings({ ...settings, ...newSettings });
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // TODO: Implement account deletion
      // This would require:
      // 1. Delete user data from Firestore
      // 2. Delete user files from Storage
      // 3. Delete user account from Firebase Auth
      alert('Account deletion is not yet implemented. Please contact support.');
      setDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account');
    }
  };

  // Calculate stats
  const stats = {
    packagesCreated: myPackages.length,
    downloadsReceived: myPackages.reduce((sum, pkg) => sum + (pkg.stats?.downloads || 0), 0),
    setsSaved: savedSets.length
  };

  // Format join date
  const joinDate = profile?.createdAt?.toDate 
    ? profile.createdAt.toDate().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <p>Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      padding: '24px',
      color: '#ffffff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Error Message */}
        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            color: '#fca5a5',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Profile Section */}
        <ProfileCard
          profile={profile}
          displayName={displayName}
          setDisplayName={setDisplayName}
          bio={bio}
          setBio={setBio}
          editingDisplayName={editingDisplayName}
          setEditingDisplayName={setEditingDisplayName}
          editingBio={editingBio}
          setEditingBio={setEditingBio}
          onDisplayNameSave={handleDisplayNameSave}
          onBioSave={handleBioSave}
          onAvatarUpload={handleAvatarUpload}
          uploadingAvatar={uploadingAvatar}
          fileInputRef={fileInputRef}
          stats={stats}
          joinDate={joinDate}
        />

        {/* My Saved Sets Section */}
        <SavedSetsCard
          sets={savedSets}
          loading={loadingSets}
          onDelete={async (setId) => {
            try {
              await deletePromptSet(user.uid, setId);
              setSavedSets(savedSets.filter(s => s.id !== setId));
            } catch (err) {
              console.error('Error deleting set:', err);
              setError('Failed to delete set');
            }
          }}
        />

        {/* My Packages Section */}
        <MyPackagesCard
          packages={myPackages}
          loading={loadingPackages}
        />

        {/* Installed Packages Section */}
        <InstalledPackagesCard
          packages={installedPackages}
        />

        {/* Settings Section */}
        <SettingsCard
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
          savingSettings={savingSettings}
          onDeleteAccount={() => setDeleteConfirm(true)}
        />

        {/* Delete Account Confirmation */}
        {deleteConfirm && (
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
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setDeleteConfirm(false)}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px'
              }}>
                Delete Account?
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
                This action cannot be undone. All your data, packages, and saved sets will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({
  profile,
  displayName,
  setDisplayName,
  bio,
  setBio,
  editingDisplayName,
  setEditingDisplayName,
  editingBio,
  setEditingBio,
  onDisplayNameSave,
  onBioSave,
  onAvatarUpload,
  uploadingAvatar,
  fileInputRef,
  stats,
  joinDate
}) => {
  return (
    <div style={cardStyle}>
      <h2 style={sectionTitleStyle}>Profile</h2>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: profile?.avatar
                ? `url(${profile.avatar})`
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '3px solid rgba(139, 92, 246, 0.3)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingAvatar && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#ffffff' }} />
              </div>
            )}
            {!uploadingAvatar && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0a0a0f',
                cursor: 'pointer'
              }}>
                <Upload size={16} color="#ffffff" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Profile Info */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {/* Display Name */}
          <div style={{ marginBottom: '16px' }}>
            {editingDisplayName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                  autoFocus
                />
                <button
                  onClick={onDisplayNameSave}
                  style={iconButtonStyle}
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditingDisplayName(false);
                    setDisplayName(profile?.displayName || '');
                  }}
                  style={iconButtonStyle}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                  {profile?.displayName || 'User'}
                </h3>
                <button
                  onClick={() => setEditingDisplayName(true)}
                  style={iconButtonStyle}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '16px' }}>
            {editingBio ? (
              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={onBioSave}
                    style={iconButtonStyle}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false);
                      setBio(profile?.bio || '');
                    }}
                    style={iconButtonStyle}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  margin: 0,
                  flex: 1,
                  minHeight: '24px'
                }}>
                  {profile?.bio || 'No bio yet. Click edit to add one.'}
                </p>
                <button
                  onClick={() => setEditingBio(true)}
                  style={iconButtonStyle}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Join Date */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <Calendar size={16} />
            <span>Joined {joinDate}</span>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'flex', 
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <StatItem icon={<Package size={20} />} label="Packages Created" value={stats.packagesCreated} />
            <StatItem icon={<Download size={20} />} label="Downloads Received" value={stats.downloadsReceived} />
            <StatItem icon={<FolderOpen size={20} />} label="Sets Saved" value={stats.setsSaved} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ icon, label, value }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      color: 'rgba(255, 255, 255, 0.7)'
    }}>
      {icon}
      <span style={{ fontSize: '14px' }}>{label}</span>
    </div>
    <span style={{ 
      fontSize: '24px', 
      fontWeight: '700',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      {value}
    </span>
  </div>
);

// Saved Sets Card Component
const SavedSetsCard = ({ sets, loading, onDelete }) => (
  <div style={cardStyle}>
    <h2 style={sectionTitleStyle}>My Saved Sets</h2>
    {loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
      </div>
    ) : sets.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
        <FolderOpen size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <p>No saved sets yet</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sets.map((set) => (
          <div
            key={set.id}
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
          >
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                {set.name}
              </h4>
              {set.description && (
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {set.description}
                </p>
              )}
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.4)'
              }}>
                {set.createdAt?.toDate 
                  ? set.createdAt.toDate().toLocaleDateString()
                  : 'Unknown date'}
              </p>
            </div>
            <button
              onClick={() => onDelete(set.id)}
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                color: '#fca5a5',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// My Packages Card Component
const MyPackagesCard = ({ packages, loading }) => (
  <div style={cardStyle}>
    <h2 style={sectionTitleStyle}>My Packages</h2>
    {loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
      </div>
    ) : packages.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
        <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <p>No packages created yet</p>
      </div>
    ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {packages.map((pkg) => (
          <PackageCard key={pkg.packageId || pkg.id} pkg={pkg} />
        ))}
      </div>
    )}
  </div>
);

// Installed Packages Card Component
const InstalledPackagesCard = ({ packages }) => (
  <div style={cardStyle}>
    <h2 style={sectionTitleStyle}>Installed Packages</h2>
    {packages.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
        <Download size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <p>No installed packages yet</p>
      </div>
    ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {packages.map((pkg) => (
          <PackageCard key={pkg.packageId || pkg.id} pkg={pkg} />
        ))}
      </div>
    )}
  </div>
);

// Package Card Component
const PackageCard = ({ pkg }) => (
  <div
    style={{
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = '#8b5cf6';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
      {pkg.name}
    </h4>
    {pkg.description && (
      <p style={{
        margin: '0 0 8px 0',
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.6)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {pkg.description}
      </p>
    )}
    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
      <span>{pkg.stats?.downloads || 0} downloads</span>
      <span>{Object.keys(pkg.options || {}).length} categories</span>
    </div>
  </div>
);

// Settings Card Component
const SettingsCard = ({ settings, onSettingsUpdate, savingSettings, onDeleteAccount }) => (
  <div style={cardStyle}>
    <h2 style={sectionTitleStyle}>Settings</h2>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Default View Preference */}
      <SettingItem
        label="Default View Preference"
        description="Choose your preferred layout style"
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onSettingsUpdate({ defaultView: 'sidebar' })}
            style={{
              ...settingButtonStyle,
              background: settings.defaultView === 'sidebar'
                ? 'rgba(139, 92, 246, 0.3)'
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: settings.defaultView === 'sidebar'
                ? '#8b5cf6'
                : 'rgba(139, 92, 246, 0.3)'
            }}
          >
            <Sidebar size={20} />
            <span>Sidebar</span>
          </button>
          <button
            onClick={() => onSettingsUpdate({ defaultView: 'horizontal' })}
            style={{
              ...settingButtonStyle,
              background: settings.defaultView === 'horizontal'
                ? 'rgba(139, 92, 246, 0.3)'
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: settings.defaultView === 'horizontal'
                ? '#8b5cf6'
                : 'rgba(139, 92, 246, 0.3)'
            }}
          >
            <LayoutHorizontal size={20} />
            <span>Horizontal</span>
          </button>
        </div>
      </SettingItem>

      {/* Theme Toggle */}
      <SettingItem
        label="Theme"
        description="Choose light or dark theme"
      >
        <button
          onClick={() => onSettingsUpdate({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
          style={{
            ...settingButtonStyle,
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(139, 92, 246, 0.3)'
          }}
        >
          {settings.theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{settings.theme === 'light' ? 'Light' : 'Dark'}</span>
        </button>
      </SettingItem>

      {/* Auto-save Toggle */}
      <SettingItem
        label="Auto-save"
        description="Automatically save your work"
      >
        <button
          onClick={() => onSettingsUpdate({ autoSave: !settings.autoSave })}
          style={{
            ...settingButtonStyle,
            background: settings.autoSave
              ? 'rgba(34, 197, 94, 0.2)'
              : 'rgba(255, 255, 255, 0.05)',
            borderColor: settings.autoSave
              ? '#22c55e'
              : 'rgba(139, 92, 246, 0.3)'
          }}
        >
          <SaveIcon size={20} />
          <span>{settings.autoSave ? 'Enabled' : 'Disabled'}</span>
        </button>
      </SettingItem>

      {/* Email Notifications */}
      <SettingItem
        label="Email Notifications"
        description="Receive email updates about your packages"
      >
        <button
          onClick={() => onSettingsUpdate({ emailNotifications: !settings.emailNotifications })}
          style={{
            ...settingButtonStyle,
            background: settings.emailNotifications
              ? 'rgba(34, 197, 94, 0.2)'
              : 'rgba(255, 255, 255, 0.05)',
            borderColor: settings.emailNotifications
              ? '#22c55e'
              : 'rgba(139, 92, 246, 0.3)'
          }}
        >
          <Bell size={20} />
          <span>{settings.emailNotifications ? 'Enabled' : 'Disabled'}</span>
        </button>
      </SettingItem>

      {/* Danger Zone */}
      <div style={{
        padding: '24px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        marginTop: '8px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Danger Zone
        </h3>
        <p style={{ 
          fontSize: '14px', 
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '16px'
        }}>
          Permanently delete your account and all associated data
        </p>
        <button
          onClick={onDeleteAccount}
          style={{
            padding: '12px 24px',
            background: 'rgba(239, 68, 68, 0.8)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.8)';
          }}
        >
          <Trash2 size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
          Delete Account
        </button>
      </div>
    </div>

    {savingSettings && (
      <div style={{ 
        marginTop: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Saving settings...</span>
      </div>
    )}
  </div>
);

// Setting Item Component
const SettingItem = ({ label, description, children }) => (
  <div>
    <div style={{ marginBottom: '8px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
        {label}
      </h4>
      <p style={{ 
        fontSize: '13px', 
        color: 'rgba(255, 255, 255, 0.5)',
        margin: 0
      }}>
        {description}
      </p>
    </div>
    {children}
  </div>
);

// Styles
const cardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(139, 92, 246, 0.3)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px'
};

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  marginBottom: '20px',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const iconButtonStyle = {
  padding: '6px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(139, 92, 246, 0.3)',
  borderRadius: '6px',
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const settingButtonStyle = {
  padding: '12px 20px',
  border: '1px solid',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

export default UserProfile;

