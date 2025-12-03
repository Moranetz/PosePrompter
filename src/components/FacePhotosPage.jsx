import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../firebase-config';
import { useAuth } from '../contexts/UserContext';
import Header from './Header';

const FacePhotosPage = () => {
  const { user } = useAuth();
  const [facePhotos, setFacePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Fetch all face photos for the current user
  const fetchFacePhotos = useCallback(async () => {
    if (!user || !storage) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const folderRef = ref(storage, `face-photos/${user.uid}`);
      const result = await listAll(folderRef);
      
      // Get download URLs for all photos
      const photoPromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          url,
          name: itemRef.name,
          fullPath: itemRef.fullPath
        };
      });
      
      const photos = await Promise.all(photoPromises);
      setFacePhotos(photos);
    } catch (err) {
      console.error('Error fetching face photos:', err);
      // Don't show error if folder doesn't exist yet
      if (err.code !== 'storage/object-not-found') {
        setError('Failed to load face photos. Please try again.');
      }
      setFacePhotos([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load photos on mount and when user changes
  useEffect(() => {
    fetchFacePhotos();
  }, [fetchFacePhotos]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    if (uploading) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    if (!storage) {
      setError('Storage is not initialized. Please check your configuration.');
      setUploading(false);
      return;
    }

    try {
      // Create a unique filename
      const fileName = `face-photos/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Add to local state
      setFacePhotos(prev => [{
        url: downloadURL,
        name: file.name,
        fullPath: fileName
      }, ...prev]);

      setSuccessMessage('Face photo uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading face photo:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [user, uploading]);

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
      setFacePhotos(prev => prev.filter(p => p.fullPath !== photo.fullPath));
      setSuccessMessage('Photo deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo. Please try again.');
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#09090b',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Please log in to view your face photos.</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      color: '#ffffff',
      position: 'relative'
    }}>
      <Header />
      
      <main style={{
        padding: '40px 32px',
        maxWidth: '1400px',
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
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header Section */}
        <div style={{ marginBottom: '48px' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#ffffff',
              letterSpacing: '-1px'
            }}
          >
            Your Face Photos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}
          >
            Upload photos of your face to create AI versions of yourself. These photos will be used to train and generate personalized AI images.
          </motion.p>

          {/* Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
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
                  Upload Face Photo
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
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '14px'
              }}
            >
              {error}
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
              No face photos yet
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '24px'
            }}>
              Upload your first face photo to get started
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
              Upload Photo
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

