import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../firebase-config';
import { useAuth } from '../contexts/UserContext';
import { getErrorMessage } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import Header from './Header';

const FacePhotosPage = () => {
  const { user } = useAuth();
  const [facePhotos, setFacePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Cache key for localStorage
  const getCacheKey = useCallback(() => {
    return user ? `face-photos-cache-${user.uid}` : null;
  }, [user]);

  // Load cached photos immediately
  const loadCachedPhotos = useCallback(() => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return [];
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { photos, timestamp } = JSON.parse(cached);
        // Cache valid for 1 hour
        const CACHE_DURATION = 60 * 60 * 1000;
        if (Date.now() - timestamp < CACHE_DURATION) {
          return photos;
        }
      }
    } catch (err) {
      logger.warn('Error loading cached photos:', err);
    }
    return [];
  }, [getCacheKey]);

  // Save photos to cache
  const saveToCache = useCallback((photos) => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        photos,
        timestamp: Date.now()
      }));
    } catch (err) {
      logger.warn('Error saving photos to cache:', err);
    }
  }, [getCacheKey]);

  // Fetch all face photos for the current user - optimized version
  const fetchFacePhotos = useCallback(async () => {
    if (!user || !storage) {
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      logger.log('[FacePhotosPage] Fetch already in progress, skipping...');
      return;
    }

    isFetchingRef.current = true;

    // Load cached photos immediately for instant display
    const cachedPhotos = loadCachedPhotos();
    const hasCachedPhotos = cachedPhotos.length > 0;
    
    if (hasCachedPhotos) {
      setFacePhotos(cachedPhotos);
      setLoading(false); // Show cached photos immediately - don't show loading spinner
    } else {
      setLoading(true);
    }
    
    setError('');

    try {
      logger.log('[FacePhotosPage] Fetching photos from Firebase...');
      const folderRef = ref(storage, `face-photos/${user.uid}`);
      const result = await listAll(folderRef);
      
      logger.log('[FacePhotosPage] Found', result.items.length, 'photos');
      
      // If no photos, clear and return
      if (result.items.length === 0) {
        setFacePhotos([]);
        saveToCache([]);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      // Fetch all URLs in parallel - no progressive updates to avoid re-renders
      logger.log('[FacePhotosPage] Fetching download URLs...');
      const photoPromises = result.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          return {
            url,
            name: itemRef.name,
            fullPath: itemRef.fullPath
          };
        } catch (err) {
          logger.error(`Error fetching URL for ${itemRef.name}:`, err);
          return null;
        }
      });
      
      // Wait for all photos to load at once
      const photos = (await Promise.all(photoPromises)).filter(Boolean);
      logger.log('[FacePhotosPage] Loaded', photos.length, 'photos successfully');
      
      // Update state once with all photos
      setFacePhotos(photos);
      saveToCache(photos);
      setLoading(false);
    } catch (err) {
      logger.error('[FacePhotosPage] Error fetching face photos:', err);
      // Don't show error for expected cases
      if (err.code === 'storage/object-not-found' || err.code === 'storage/unauthorized') {
        // These are expected - folder might not exist yet or permission issue
        setFacePhotos([]);
        saveToCache([]);
      } else if (err.code !== 'storage/canceled') {
        // Only show error for unexpected errors
        setError('Failed to load face photos. Please try again.');
        // Keep cached photos if available
        const cachedPhotos = loadCachedPhotos();
        if (cachedPhotos.length > 0) {
          setFacePhotos(cachedPhotos);
        }
      }
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user, loadCachedPhotos, saveToCache]);

  // Load photos on mount and when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchFacePhotos();
    }
  }, [user?.uid, fetchFacePhotos]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      logger.warn('[FacePhotosPage] No file selected');
      return;
    }
    
    if (!user) {
      logger.warn('[FacePhotosPage] No user authenticated');
      setError('Please log in to upload photos.');
      return;
    }

    if (uploading) {
      logger.warn('[FacePhotosPage] Upload already in progress');
      return;
    }
    
    logger.log('[FacePhotosPage] File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Clear any previous messages
    setError('');
    setSuccessMessage('');

    // Validate file type - check if it's an image
    if (!file.type || !file.type.startsWith('image/')) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
      const isSupportedExtension = fileExtension && supportedFormats.includes(fileExtension);
      
      if (isSupportedExtension) {
        setError(`The file "${file.name}" appears to be an image but has an unsupported format. Please try converting it to JPG or PNG.`);
      } else {
        setError(`"${file.name}" is not a valid image file. Please select a JPG, PNG, GIF, or WebP image.`);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB) with helpful message
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      setError(`"${file.name}" is too large (${fileSizeMB} MB). Maximum file size is ${maxSizeMB} MB. Please compress or resize your image.`);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check for empty file
    if (file.size === 0) {
      setError(`"${file.name}" is empty. Please select a valid image file.`);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);

    if (!storage) {
      setError('Storage is not initialized. Please check your configuration.');
      setUploading(false);
      return;
    }

    try {
      // Create a unique filename to prevent collisions and duplicates
      const uniqueId = Math.random().toString(36).substring(2, 9);
      const fileName = `face-photos/${user.uid}/${Date.now()}_${uniqueId}_${file.name}`;
      const storageRef = ref(storage, fileName);

      logger.log('[FacePhotosPage] Starting upload:', { 
        fileName, 
        fileSize: file.size, 
        fileType: file.type,
        userId: user.uid 
      });

      // Upload file with metadata
      await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg'
      });
      logger.log('[FacePhotosPage] Upload completed, getting download URL...');
      
      // Get download URL with retry logic
      let downloadURL;
      let retries = 3;
      while (retries > 0) {
        try {
          downloadURL = await getDownloadURL(storageRef);
          logger.log('[FacePhotosPage] Download URL obtained:', downloadURL);
          break;
        } catch (urlError) {
          retries--;
          if (retries === 0) {
            throw urlError;
          }
          logger.warn('[FacePhotosPage] Retrying getDownloadURL, attempts left:', retries);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Add to local state and update cache
      const newPhoto = {
        url: downloadURL,
        name: file.name,
        fullPath: fileName
      };
      
      logger.log('[FacePhotosPage] Adding photo to state:', newPhoto);
      
      setFacePhotos(prev => {
        // Check if photo already exists to avoid duplicates
        const exists = prev.some(p => p.fullPath === newPhoto.fullPath);
        if (exists) {
          logger.warn('[FacePhotosPage] Photo already exists, skipping duplicate');
          return prev;
        }
        const updated = [newPhoto, ...prev];
        saveToCache(updated);
        logger.log('[FacePhotosPage] State updated, total photos:', updated.length);
        return updated;
      });

      setSuccessMessage('Face photo uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      logger.log('[FacePhotosPage] Upload process completed successfully');
    } catch (err) {
      logger.error('[FacePhotosPage] Error uploading face photo:', err);
      logger.error('[FacePhotosPage] Error details:', {
        code: err.code,
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      let errorMessage = 'Failed to upload image. Please try again.';
      
      // Check error message for common issues
      const errorMsg = err.message?.toLowerCase() || '';
      const errorCode = err.code || '';
      
      // Handle Firebase Storage rule violations
      if (errorMsg.includes('size') || errorMsg.includes('5mb') || errorMsg.includes('file size')) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errorMessage = `File size error: "${file.name}" is ${fileSizeMB} MB, which exceeds the 5 MB limit. Please compress or resize your image before uploading.`;
      } else if (errorMsg.includes('image') || errorMsg.includes('content type') || errorMsg.includes('file type')) {
        errorMessage = `File type error: "${file.name}" is not a valid image file. Please select a JPG, PNG, GIF, or WebP image.`;
      } else if (errorCode) {
        switch (errorCode) {
          case 'storage/unauthorized':
            errorMessage = 'Permission denied: You do not have permission to upload. Please make sure you are logged in and try again.';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload was canceled. Please try again.';
            break;
          case 'storage/unknown':
            errorMessage = 'Connection error: An unknown error occurred. Please check your internet connection and try again.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Storage quota exceeded: Your storage limit has been reached. Please contact support or delete some photos.';
            break;
          case 'storage/unauthenticated':
            errorMessage = 'Authentication required: Please log in to upload photos.';
            break;
          case 'storage/invalid-argument':
            errorMessage = `Invalid file: "${file.name}" cannot be uploaded. Please check the file and try again.`;
            break;
          default:
            // Try to extract meaningful error from message
            if (err.message) {
              errorMessage = `Upload failed: ${err.message}`;
            } else {
              errorMessage = getErrorMessage(err) || `Upload failed: ${errorCode || 'Unknown error'}. Please try again.`;
            }
        }
      } else if (err.message) {
        errorMessage = `Upload failed: ${err.message}`;
      } else {
        errorMessage = getErrorMessage(err) || 'Upload failed due to an unknown error. Please try again.';
      }
      
      setError(errorMessage);
      
      // Reset input on error so user can try again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
      logger.log('[FacePhotosPage] Upload handler finished, uploading set to false');
    }
  }, [user, uploading, saveToCache]);

  // Handle photo deletion
  const handleDeletePhoto = useCallback(async (photo) => {
    if (!user || !storage) return;
    
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const photoRef = ref(storage, photo.fullPath);
      await deleteObject(photoRef);
      
      // Remove from local state
      setFacePhotos(prev => {
        const updated = prev.filter(p => p.fullPath !== photo.fullPath);
        saveToCache(updated);
        return updated;
      });
      setSuccessMessage('Photo deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      logger.error('Error deleting photo:', err);
      setError('Failed to delete photo. Please try again.');
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              maxWidth: '420px',
            }}
          >
            <button
              onClick={() => window.location.hash = ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '450',
                cursor: 'pointer',
                marginBottom: '32px',
                transition: 'all 120ms ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                e.currentTarget.style.color = '#e4dbfa';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <ImageIcon size={28} style={{ color: 'rgba(139, 92, 246, 0.7)' }} />
            </div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              color: 'var(--text-primary)',
            }}>
              Your Face Photos
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '28px',
            }}>
              Sign in to upload photos and generate AI images that preserve your face in any pose, outfit, or scene.
            </p>
            <button
              onClick={() => window.location.hash = ''}
              style={{
                padding: '10px 24px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                color: '#e4dbfa',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Sign In to Get Started
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: '#ffffff',
      position: 'relative'
    }}>
      <Header />

      <main style={{
        padding: '32px 32px 80px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Back button */}
        <button
          onClick={() => {
            window.location.hash = '';
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '450',
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'all 120ms ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
            e.currentTarget.style.color = '#e4dbfa';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: '650',
              marginBottom: '10px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: '1.2',
            }}
          >
            Your Face Photos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '0',
              lineHeight: '1.6',
              maxWidth: '560px',
            }}
          >
            Upload clear, well-lit photos of your face. The AI uses these as a reference to preserve your identity across generated images.
          </motion.p>

          {/* Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginTop: '24px' }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 22px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                color: '#e4dbfa',
                fontSize: '13px',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.5 : 1,
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {uploading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Your Best Photos
                </>
              )}
            </label>
          </motion.div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative'
              }}
            >
              <div style={{ flex: 1, lineHeight: '1.5' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: '#ef4444' }}>
                  Upload Error
                </strong>
                {error}
              </div>
              <button
                onClick={() => setError('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
                aria-label="Dismiss error"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#86efac',
                fontSize: '14px'
              }}
            >
              {successMessage}
            </motion.div>
          )}
        </div>

        {/* Photos Gallery */}
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading your photos...</p>
          </div>
        ) : facePhotos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textAlign: 'center'
            }}
          >
            <ImageIcon size={64} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
            <p style={{
              fontSize: '18px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}>
              Create your perfect face base
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '24px'
            }}>
              Upload your best, most flattering photos. These will be your base for all transformations—ensuring you always look attractive and recognizable, no matter what scene or style you choose.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 20px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.1)';
              }}
            >
              Upload Your Best Photos
            </button>
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {facePhotos.map((photo, index) => (
              <motion.div
                key={photo.fullPath}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDeletePhoto(photo)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                  }}
                >
                  <X size={18} />
                </button>

                {/* Photo */}
                <img
                  src={photo.url}
                  alt="Face photo"
                  style={{
                    width: '100%',
                    height: '280px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                {/* Photo info */}
                <div style={{
                  padding: '16px'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {photo.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FacePhotosPage;

