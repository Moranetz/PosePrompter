import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Copy, Download, RefreshCw } from 'lucide-react';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase-config';
import { useAuth } from '../contexts/UserContext';
import Header from './Header';
import { generateAIImage } from '../utils/aiImageService';

const PoseStudioPage = () => {
  const { user } = useAuth();
  const [facePhotos, setFacePhotos] = useState([]);
  const [selectedFacePhoto, setSelectedFacePhoto] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // Load current prompt from localStorage
  useEffect(() => {
    const savedPrompt = localStorage.getItem('currentPrompt');
    if (savedPrompt) {
      setCurrentPrompt(savedPrompt);
    }
  }, []);

  // Load photos on mount and when user changes
  useEffect(() => {
    fetchFacePhotos();
  }, [fetchFacePhotos]);

  // Handle AI image generation
  const handleGenerate = useCallback(async () => {
    if (!selectedFacePhoto) {
      setError('Please select a face photo first');
      return;
    }

    if (!currentPrompt || currentPrompt.trim() === '') {
      setError('Please set a prompt in the AI Image Generator first');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccessMessage('');
    setGeneratedImage(null);

    try {
      const result = await generateAIImage({
        facePhotoUrl: selectedFacePhoto.url,
        prompt: currentPrompt
      });

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setSuccessMessage('Image generated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to generate image. Please try again.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [selectedFacePhoto, currentPrompt]);

  // Copy prompt to clipboard
  const handleCopyPrompt = useCallback(async () => {
    if (!currentPrompt) return;
    
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setSuccessMessage('Prompt copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error copying prompt:', err);
      setError('Failed to copy prompt');
    }
  }, [currentPrompt]);

  // Download generated image
  const handleDownloadImage = useCallback(async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pose-studio-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Image downloaded!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  }, [generatedImage]);

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
        <p>Please log in to use Pose Studio.</p>
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
            Pose Studio
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
            Select your uploaded face photo and use your current prompt to generate an AI image of yourself.
          </motion.p>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '24px',
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
              marginBottom: '24px',
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Left Column: Face Photo Selection */}
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              Select Face Photo
            </h2>

            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                flexDirection: 'column',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
                <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading photos...</p>
              </div>
            ) : facePhotos.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <ImageIcon size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '16px'
                }}>
                  No face photos uploaded yet.
                </p>
                <button
                  onClick={() => {
                    window.location.hash = '#face-photos';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                  style={{
                    padding: '8px 16px',
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
                  Upload Face Photo
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '16px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '8px'
              }}>
                {facePhotos.map((photo) => (
                  <motion.button
                    key={photo.fullPath}
                    onClick={() => setSelectedFacePhoto(photo)}
                    style={{
                      position: 'relative',
                      background: selectedFacePhoto?.fullPath === photo.fullPath 
                        ? 'rgba(139, 92, 246, 0.2)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: selectedFacePhoto?.fullPath === photo.fullPath
                        ? '2px solid rgba(139, 92, 246, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFacePhoto?.fullPath !== photo.fullPath) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFacePhoto?.fullPath !== photo.fullPath) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    <img
                      src={photo.url}
                      alt="Face photo"
                      style={{
                        width: '100%',
                        height: '140px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    {selectedFacePhoto?.fullPath === photo.fullPath && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        background: 'rgba(139, 92, 246, 0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        ✓
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Prompt and Generate */}
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              Current Prompt
            </h2>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              minHeight: '200px'
            }}>
              {currentPrompt ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      margin: 0
                    }}>
                      Prompt from AI Image Generator
                    </p>
                    <button
                      onClick={handleCopyPrompt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    margin: 0,
                    wordBreak: 'break-word'
                  }}>
                    {currentPrompt}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  <p style={{ marginBottom: '12px' }}>No prompt set yet.</p>
                  <button
                    onClick={() => {
                      window.location.hash = '';
                    }}
                    style={{
                      padding: '8px 16px',
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
                    Go to AI Image Generator
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedFacePhoto || !currentPrompt || generating}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 24px',
                background: (!selectedFacePhoto || !currentPrompt || generating)
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!selectedFacePhoto || !currentPrompt || generating) ? 'not-allowed' : 'pointer',
                opacity: (!selectedFacePhoto || !currentPrompt || generating) ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedFacePhoto && currentPrompt && !generating) {
                  e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFacePhoto && currentPrompt && !generating) {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Image Display */}
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '32px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0
              }}>
                Generated Image
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDownloadImage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!generating) {
                      e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!generating) {
                      e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                    }
                  }}
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>
              </div>
            </div>
            <img
              src={generatedImage}
              alt="Generated AI image"
              style={{
                maxWidth: '100%',
                maxHeight: '600px',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PoseStudioPage;

