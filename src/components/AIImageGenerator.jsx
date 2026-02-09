import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { generateImage, PROVIDERS, checkCredits, isProviderAvailable } from '../utils/imageGenerationService';
import { getErrorMessage } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import Header from './Header';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase-config';
import { generateAIImage } from '../utils/aiImageService';
import RateAppModal from './RateAppModal';
import { TOUCH_TARGETS, PROGRESS, getProgressPercent, SPACING, TYPOGRAPHY, PATTERNS } from '../config/uxDesignSystem';

// Model configurations
const MODELS = [
  {
    id: PROVIDERS.FLUX,
    name: 'Flux Pro',
    icon: Zap,
    description: 'Highest quality, photorealistic results',
    quality: 5,
    recommended: true,
  },
  {
    id: PROVIDERS.NANOBANANA,
    name: 'Nano Banana Pro',
    icon: Sparkles,
    description: 'Latest AI model with advanced capabilities',
    quality: 5,
    recommended: false,
  },
  {
    id: PROVIDERS.SDXL,
    name: 'SDXL',
    icon: ImageIcon,
    description: 'Fast and reliable generation',
    quality: 4,
    recommended: false,
  },
  {
    id: PROVIDERS.DALLE3,
    name: 'DALL-E 3',
    icon: ImageIcon,
    description: 'OpenAI\'s advanced image model',
    quality: 5,
    recommended: false,
  },
];

const AIImageGenerator = ({ currentPrompt: externalPrompt, onPromptChange }) => {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState(PROVIDERS.FLUX);
  // Initialize prompt from external prop, localStorage, or empty string
  // Don't load from localStorage on initial mount - start fresh
  const [prompt, setPrompt] = useState(() => {
    return externalPrompt || '';
  });
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    size: '1024x1024',
    quality: 'hd',
    numOutputs: 1,
  });
  const [generationHistory, setGenerationHistory] = useState([]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [numVariations, setNumVariations] = useState(1);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatingCount, setGeneratingCount] = useState(0);
  const [facePhotos, setFacePhotos] = useState([]);
  const [selectedFacePhoto, setSelectedFacePhoto] = useState(null);
  const [loadingFacePhotos, setLoadingFacePhotos] = useState(false);
  const [showFaceSelector, setShowFaceSelector] = useState(false);
  const [showRateAppModal, setShowRateAppModal] = useState(false);
  const progressPercent = numVariations > 0
    ? Math.round((generatingCount / numVariations) * 100)
    : 0;

  // Check if model is available
  const isModelAvailable = useCallback((modelId) => {
    return isProviderAvailable(modelId);
  }, []);

  // Ensure selected model is available, fallback to first available
  useEffect(() => {
    if (!isModelAvailable(selectedModel)) {
      const availableModel = MODELS.find(m => isModelAvailable(m.id));
      if (availableModel) {
        setSelectedModel(availableModel.id);
      }
    }
  }, [selectedModel, isModelAvailable]);

  // Load prompt from localStorage on mount if not provided externally
  useEffect(() => {
    if (!externalPrompt) {
      const savedPrompt = localStorage.getItem('currentPrompt');
      if (savedPrompt && savedPrompt.trim() !== '') {
        setPrompt(savedPrompt);
      }
    }
  }, []); // Only run on mount

  // Sync with external prompt
  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
    }
  }, [externalPrompt]);

  // Listen for localStorage changes (when PhotoElementRandomizer updates the prompt)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentPrompt' && e.newValue && !externalPrompt) {
        setPrompt(e.newValue);
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also poll localStorage periodically to catch updates from same tab
    const pollInterval = setInterval(() => {
      const savedPrompt = localStorage.getItem('currentPrompt');
      if (savedPrompt && savedPrompt.trim() !== '' && savedPrompt !== prompt && !externalPrompt) {
        setPrompt(savedPrompt);
      }
    }, 500); // Check every 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [prompt, externalPrompt]);

  // Fetch face photos
  const fetchFacePhotos = useCallback(async () => {
    if (!user || !storage) {
      setLoadingFacePhotos(false);
      return;
    }

    try {
      setLoadingFacePhotos(true);
      const folderRef = ref(storage, `face-photos/${user.uid}`);
      const result = await listAll(folderRef);
      
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
      logger.error('Error fetching face photos:', err);
      if (err.code !== 'storage/object-not-found') {
        setError('Failed to load face photos. Please try again.');
      }
      setFacePhotos([]);
    } finally {
      setLoadingFacePhotos(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFacePhotos();
  }, [fetchFacePhotos]);

  // Save prompt to localStorage
  useEffect(() => {
    if (prompt && onPromptChange) {
      onPromptChange(prompt);
    }
    localStorage.setItem('currentPrompt', prompt);
  }, [prompt, onPromptChange]);

  // Handle model selection
  const handleModelSelect = useCallback((modelId) => {
    if (!isModelAvailable(modelId)) {
      setError('This model is not available. Please check your API configuration.');
      return;
    }
    setSelectedModel(modelId);
    setError('');
  }, [isModelAvailable]);

  // Handle generation with multiple variations
  const handleGenerate = useCallback(async () => {
    if (!user) {
      setError('Please sign in to generate images');
      return;
    }

    if (!prompt || prompt.trim() === '') {
      setError('Please enter a prompt');
      return;
    }

    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    // Check credits for all variations
    const totalCost = numVariations * (advancedOptions.numOutputs || 1);
    try {
      const creditCheck = await checkCredits(user.uid, selectedModel);
      const requiredCredits = creditCheck.requiredCredits * totalCost;
      if (creditCheck.remainingCredits < requiredCredits) {
        setError(`Insufficient credits. Required: ${requiredCredits}, Available: ${creditCheck.remainingCredits}`);
        return;
      }
    } catch (creditError) {
      console.error('Credit check error:', creditError);
    }

    setGenerating(true);
    setGeneratingCount(0);
    setError('');
    setSuccessMessage('');
    setGeneratedImage(null);
    setGeneratedImages([]);

    const newImages = [];
    const errors = [];

    try {
      // If face photo is selected, use face photo generation
      if (selectedFacePhoto) {
        const generationPromises = Array.from({ length: numVariations }, async (_, index) => {
          try {
            const result = await generateAIImage({
              facePhotoUrl: selectedFacePhoto.url,
              prompt: prompt.trim()
            });

            if (result.success && result.imageUrl) {
              setGeneratingCount(prev => prev + 1);
              return {
                id: Date.now() + index,
                imageUrl: result.imageUrl,
                prompt: prompt.trim(),
                model: selectedModel,
                timestamp: new Date(),
                variation: index + 1
              };
            } else {
              throw new Error(result.error || 'Generation failed');
            }
          } catch (err) {
            logger.error(`Generation error for variation ${index + 1}:`, err);
            errors.push(`Variation ${index + 1}: ${getErrorMessage(err)}`);
            setGeneratingCount(prev => prev + 1);
            return null;
          }
        });

        const results = await Promise.all(generationPromises);
        const successfulImages = results.filter(img => img !== null);
        
        newImages.push(...successfulImages);
        setGeneratedImages(newImages);

        if (successfulImages.length > 0) {
          setGeneratedImage(successfulImages[0].imageUrl);
          setSuccessMessage(`Generated ${successfulImages.length} of ${numVariations} variations successfully!`);
          setGenerationHistory(prev => [...successfulImages, ...prev].slice(0, 20));
          setTimeout(() => setSuccessMessage(''), 3000);
        }

        if (errors.length > 0) {
          setError(errors.join('; '));
        }
      } else {
        // Regular AI image generation (no face photo)
        const generationPromises = Array.from({ length: numVariations }, async (_, index) => {
          try {
            const options = {
              ...advancedOptions,
              // Backend limits num_outputs to max 4, enforce same limit in frontend
              num_outputs: selectedModel === PROVIDERS.FLUX || selectedModel === PROVIDERS.SDXL 
                ? Math.min(Math.max(1, advancedOptions.numOutputs || 1), 4) // Clamp between 1-4
                : 1
            };

            const result = await generateImage(
              selectedModel,
              prompt.trim(),
              options,
              user.uid,
              false
            );

            if (result.imageUrl) {
              setGeneratingCount(prev => prev + 1);
              return {
                id: Date.now() + index,
                imageUrl: result.imageUrl,
                prompt: prompt.trim(),
                model: selectedModel,
                timestamp: new Date(),
                variation: index + 1
              };
            }
          } catch (err) {
            logger.error(`Generation error for variation ${index + 1}:`, err);
            errors.push(`Variation ${index + 1}: ${getErrorMessage(err)}`);
            setGeneratingCount(prev => prev + 1);
            return null;
          }
        });

        const results = await Promise.all(generationPromises);
        const successfulImages = results.filter(img => img !== null);
        
        newImages.push(...successfulImages);
        setGeneratedImages(newImages);

        if (successfulImages.length > 0) {
          setGeneratedImage(successfulImages[0].imageUrl);
          setSuccessMessage(`Generated ${successfulImages.length} of ${numVariations} variations successfully!`);
          setGenerationHistory(prev => [...successfulImages, ...prev].slice(0, 20));
          setTimeout(() => setSuccessMessage(''), 3000);
        }

        if (errors.length > 0) {
          setError(errors.join('; '));
        }
      }
    } catch (err) {
      logger.error('Generation error:', err);
      const errorMsg = getErrorMessage(err);
      
      if (errorMsg.includes('Insufficient credits')) {
        setError('Insufficient credits. Please purchase more credits to continue.');
      } else if (errorMsg.includes('Rate limit')) {
        setError('Too many requests. Please wait a moment before generating again.');
      } else if (errorMsg.includes('content policy') || errorMsg.includes('Content policy')) {
        setError('Your prompt violates content policy. Please modify your prompt.');
      } else {
        setError(errorMsg || 'Failed to generate images. Please try again.');
      }
    } finally {
      setGenerating(false);
      setGeneratingCount(0);
    }
  }, [user, prompt, selectedModel, advancedOptions, numVariations]);

  // Handle download (downloads all generated images)
  const handleDownload = useCallback(async () => {
    if (generatedImages.length === 0) return;

    try {
      // Download all images
      for (let i = 0; i < generatedImages.length; i++) {
        const img = generatedImages[i];
        const response = await fetch(img.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-image-v${i + 1}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        // Small delay between downloads
        if (i < generatedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      setSuccessMessage(`${generatedImages.length} image(s) downloaded!`);
      setTimeout(() => setSuccessMessage(''), 2000);

      // Show rate app modal after download (if user hasn't rated yet)
      // Check localStorage to avoid showing repeatedly
      const hasRated = localStorage.getItem('hasRatedApp') === 'true';
      const hasSeenRatingPrompt = localStorage.getItem('hasSeenRatingPrompt') === 'true';
      
      // Show modal if:
      // 1. User is logged in
      // 2. User hasn't rated yet (localStorage check)
      // 3. User hasn't dismissed the prompt recently (or show it anyway after some time)
      if (user && !hasRated) {
        // Show immediately if they haven't seen it, or show again after 7 days
        const lastPromptTime = localStorage.getItem('lastRatingPromptTime');
        const shouldShow = !hasSeenRatingPrompt || 
          (lastPromptTime && Date.now() - parseInt(lastPromptTime) > 7 * 24 * 60 * 60 * 1000);
        
        if (shouldShow) {
          // Small delay to let download complete smoothly
          setTimeout(() => {
            setShowRateAppModal(true);
            localStorage.setItem('hasSeenRatingPrompt', 'true');
            localStorage.setItem('lastRatingPromptTime', Date.now().toString());
          }, 500);
        }
      }
    } catch (err) {
      logger.error('Download error:', err);
      setError('Failed to download images');
    }
  }, [generatedImages, user]);

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    setGeneratedImage(null);
    // Call handleGenerate directly with current state
    if (!user || !prompt || prompt.trim() === '' || !selectedModel) {
      return;
    }

    // Check credits silently
    try {
      const creditCheck = await checkCredits(user.uid, selectedModel);
      if (!creditCheck.hasCredits) {
        setError('Insufficient credits. Please purchase more credits to continue.');
        return;
      }
    } catch (creditError) {
      console.error('Credit check error:', creditError);
    }

    setGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await generateImage(
        selectedModel,
        prompt.trim(),
        advancedOptions,
        user.uid,
        false
      );

      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setSuccessMessage('Image regenerated successfully!');
        setGenerationHistory(prev => [{
          id: Date.now(),
          imageUrl: result.imageUrl,
          prompt: prompt.trim(),
          model: selectedModel,
          timestamp: new Date(),
        }, ...prev].slice(0, 10));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      const errorMsg = getErrorMessage(err);
      if (errorMsg.includes('Insufficient credits')) {
        setError('Insufficient credits. Please purchase more credits to continue.');
      } else if (errorMsg.includes('Rate limit')) {
        setError('Too many requests. Please wait a moment before generating again.');
      } else if (errorMsg.includes('content policy')) {
        setError('Your prompt violates content policy. Please modify your prompt.');
      } else {
        setError(errorMsg || 'Failed to regenerate image. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [user, prompt, selectedModel, advancedOptions]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!generatedImage) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Check out this AI-generated image: ${prompt}`,
          url: generatedImage,
        });
      } else {
        await navigator.clipboard.writeText(generatedImage);
        setSuccessMessage('Image link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        logger.error('Share error:', err);
        // Fallback to copy
        try {
          await navigator.clipboard.writeText(generatedImage);
          setSuccessMessage('Image link copied to clipboard!');
          setTimeout(() => setSuccessMessage(''), 2000);
        } catch (copyErr) {
          setError('Failed to share image');
        }
      }
    }
  }, [generatedImage, prompt]);

  // Show message if not authenticated
  if (!user) {
    return (
      <div>
        <Header />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 20px',
          textAlign: 'center'
        }}>
          {/* Back button */}
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            <button
              onClick={() => {
                window.location.hash = '';
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: `${SPACING.MD} ${SPACING.LG}`,
                minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
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
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: `${SPACING[8]} ${SPACING.XL}`,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#ffffff'
            }}>
              Sign In Required
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '24px'
            }}>
              Please sign in to use the AI Image Generator
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px',
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
            padding: '10px 18px',
            minHeight: '44px',
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '48px' }}
      >
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#ffffff',
          letterSpacing: '-1px'
        }}>
          AI Image Generator
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: '1.6'
        }}>
          Transform your prompts into stunning images with advanced AI models
        </p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '24px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#fca5a5',
                cursor: 'pointer',
                padding: '8px',
                minWidth: '36px',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '24px',
              padding: '12px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#86efac',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Display/Edit Area (Above the bar) - Cursor Style */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        style={{
          marginBottom: '12px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          minHeight: '100px',
          maxHeight: '400px',
          transition: 'all 0.2s ease'
        }}
        onFocus={(e) => {
          if (e.currentTarget.contains(e.target)) {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
          }
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            // Auto-resize
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px';
          }}
          placeholder="Describe the image you want to generate..."
          disabled={generating}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (prompt.trim() && !generating) {
                handleGenerate();
              }
            }
          }}
          style={{
            width: '100%',
            minHeight: '100px',
            maxHeight: '400px',
            padding: 0,
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '13px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            overflow: 'auto',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        />
      </motion.div>

      {/* Face Photo Selector */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        style={{ marginBottom: '12px' }}
      >
        <button
          onClick={() => setShowFaceSelector(!showFaceSelector)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ImageIcon size={14} />
          <span>{selectedFacePhoto ? 'Change Face Photo' : 'Select Face Photo (Optional)'}</span>
          {selectedFacePhoto && (
            <span style={{
              padding: '2px 6px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '8px',
              fontSize: '10px'
            }}>
              Selected
            </span>
          )}
          <ChevronDown size={12} style={{
            transform: showFaceSelector ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease'
          }} />
        </button>

        <AnimatePresence>
          {showFaceSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {loadingFacePhotos ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Loading photos...</p>
                </div>
              ) : facePhotos.length === 0 ? (
                <div style={{
                  padding: '32px 20px',
                  textAlign: 'center'
                }}>
                  <ImageIcon size={32} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '12px' }} />
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '12px'
                  }}>
                    No face photos uploaded yet.
                  </p>
                  <button
                    onClick={() => {
                      window.location.hash = '#face-photos';
                    }}
                    style={{
                      padding: '10px 16px',
                      minHeight: '44px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
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
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px'
                }}>
                  <motion.button
                    onClick={() => setSelectedFacePhoto(null)}
                    style={{
                      position: 'relative',
                      background: !selectedFacePhoto 
                        ? 'rgba(139, 92, 246, 0.2)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: !selectedFacePhoto
                        ? '2px solid rgba(139, 92, 246, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: '20px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFacePhoto) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFacePhoto) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }
                    }}
                  >
                    <X size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>None</span>
                  </motion.button>
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
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      {selectedFacePhoto?.fullPath === photo.fullPath && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '20px',
                          height: '20px',
                          background: 'rgba(139, 92, 246, 0.9)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Prompt Bar - Cursor Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '32px', position: 'relative' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '6px 8px',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          minHeight: '44px'
        }}
        onFocus={(e) => {
          if (e.currentTarget.contains(e.target)) {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
          }
        }}
        >
          {/* Model Selector - Pill Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              disabled={generating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                minHeight: '44px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '500',
                cursor: generating ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: generating ? 0.5 : 1,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!generating) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {(() => {
                const selectedModelData = MODELS.find(m => m.id === selectedModel);
                const Icon = selectedModelData?.icon || Zap;
                return (
                  <>
                    <Icon size={14} style={{ color: 'rgba(139, 92, 246, 0.9)' }} />
                    <span style={{ fontSize: '12px' }}>{selectedModelData?.name || 'Model'}</span>
                    <ChevronDown size={11} style={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      transform: modelDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease'
                    }} />
                  </>
                );
              })()}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {modelDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    minWidth: '200px',
                    background: '#1a1a2e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {MODELS.map((model) => {
                    const Icon = model.icon;
                    const isAvailable = isModelAvailable(model.id);
                    const isSelected = selectedModel === model.id;
                    
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          if (isAvailable) {
                            handleModelSelect(model.id);
                            setModelDropdownOpen(false);
                          }
                        }}
                        disabled={!isAvailable || generating}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
                          background: isSelected 
                            ? 'rgba(139, 92, 246, 0.15)' 
                            : 'transparent',
                          border: 'none',
                          color: isAvailable ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                          fontSize: '14px',
                          cursor: isAvailable && !generating ? 'pointer' : 'not-allowed',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          opacity: isAvailable ? 1 : 0.5
                        }}
                        onMouseEnter={(e) => {
                          if (isAvailable && !generating) {
                            e.target.style.background = isSelected 
                              ? 'rgba(139, 92, 246, 0.2)' 
                              : 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = isSelected 
                            ? 'rgba(139, 92, 246, 0.15)' 
                            : 'transparent';
                        }}
                      >
                        <Icon size={16} style={{ 
                          color: isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.6)'
                        }} />
                        <span style={{ flex: 1 }}>{model.name}</span>
                        {isSelected && (
                          <CheckCircle2 size={16} style={{ color: '#8b5cf6' }} />
                        )}
                        {!isAvailable && (
                          <span style={{ fontSize: '11px', color: 'rgba(239, 68, 68, 0.7)' }}>
                            Unavailable
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Variations Selector - Pill Button */}
          <button
            onClick={() => {
              const next = numVariations >= 4 ? 1 : numVariations + 1;
              setNumVariations(next);
            }}
            disabled={generating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 14px',
              minHeight: '44px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '500',
              cursor: generating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: generating ? 0.5 : 1,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!generating) {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span style={{ fontSize: '12px' }}>×{numVariations}</span>
            <ChevronDown size={11} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          </button>

          {/* Generation Status */}
          {generating && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              fontSize: '12px',
              color: 'rgba(139, 92, 246, 0.8)'
            }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span>{generatingCount}/{numVariations}</span>
            </div>
          )}

          {/* Generate Button - Circular */}
          <button
            onClick={handleGenerate}
            disabled={!prompt || prompt.trim() === '' || generating || !selectedModel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              padding: 0,
              background: (!prompt || prompt.trim() === '' || generating || !selectedModel)
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(139, 92, 246, 0.9)',
              border: 'none',
              borderRadius: '50%',
              color: (!prompt || prompt.trim() === '' || generating || !selectedModel)
                ? 'rgba(255, 255, 255, 0.3)'
                : '#ffffff',
              cursor: (!prompt || prompt.trim() === '' || generating || !selectedModel)
                ? 'not-allowed'
                : 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!(!prompt || prompt.trim() === '' || generating || !selectedModel)) {
                e.target.style.background = 'rgba(139, 92, 246, 1)';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!prompt || prompt.trim() === '' || generating || !selectedModel)) {
                e.target.style.background = 'rgba(139, 92, 246, 0.9)';
                e.target.style.transform = 'scale(1)';
              }
            }}
            aria-label="Generate images"
          >
            {generating ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={16} />
            )}
          </button>
        </div>

        {/* Close dropdown when clicking outside */}
        {modelDropdownOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setModelDropdownOpen(false)}
          />
        )}
      </motion.div>

      {/* Step 3: Advanced Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: '32px' }}
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.03)';
          }}
        >
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: 'hidden',
                marginTop: '16px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Size
                  </label>
                  <select
                    value={advancedOptions.size}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, size: e.target.value }))}
                    disabled={generating}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      opacity: generating ? 0.6 : 1
                    }}
                    onFocus={(e) => {
                      if (!generating) {
                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseEnter={(e) => {
                      if (!generating) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.matches(':focus')) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    <option value="1024x1024" style={{ background: '#1a1a2e', color: '#ffffff' }}>1024x1024</option>
                    <option value="1792x1024" style={{ background: '#1a1a2e', color: '#ffffff' }}>1792x1024</option>
                    <option value="1024x1792" style={{ background: '#1a1a2e', color: '#ffffff' }}>1024x1792</option>
                  </select>
                </div>

                {(selectedModel === PROVIDERS.DALLE3) && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '8px'
                    }}>
                      Quality
                    </label>
                    <select
                      value={advancedOptions.quality}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, quality: e.target.value }))}
                      disabled={generating}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        cursor: generating ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        opacity: generating ? 0.6 : 1
                      }}
                      onFocus={(e) => {
                        if (!generating) {
                          e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseEnter={(e) => {
                        if (!generating) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.target.matches(':focus')) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <option value="standard" style={{ background: '#1a1a2e', color: '#ffffff' }}>Standard</option>
                      <option value="hd" style={{ background: '#1a1a2e', color: '#ffffff' }}>HD</option>
                    </select>
                  </div>
                )}

                {(selectedModel === PROVIDERS.FLUX || selectedModel === PROVIDERS.SDXL) && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '8px'
                    }}>
                      Number of Outputs
                    </label>
                    <select
                      value={advancedOptions.numOutputs}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, numOutputs: parseInt(e.target.value) }))}
                      disabled={generating}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        cursor: generating ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        opacity: generating ? 0.6 : 1
                      }}
                      onFocus={(e) => {
                        if (!generating) {
                          e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseEnter={(e) => {
                        if (!generating) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.target.matches(':focus')) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <option value={1} style={{ background: '#1a1a2e', color: '#ffffff' }}>1</option>
                      <option value={2} style={{ background: '#1a1a2e', color: '#ffffff' }}>2</option>
                      <option value={3} style={{ background: '#1a1a2e', color: '#ffffff' }}>3</option>
                      <option value={4} style={{ background: '#1a1a2e', color: '#ffffff' }}>4</option>
                    </select>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>


      {/* Generation Progress / Result */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              padding: '40px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textAlign: 'center'
            }}
          >
            <Loader2 size={48} style={{
              animation: 'spin 1s linear infinite',
              color: '#8b5cf6',
              marginBottom: '16px'
            }} />
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}>
              Generating with {MODELS.find(m => m.id === selectedModel)?.name || 'AI'}...
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              This usually takes 10-30 seconds
            </p>
            <div style={{
              marginTop: '20px'
            }}>
              <div style={{
                height: PROGRESS.BAR_HEIGHT,
                width: '100%',
                maxWidth: '320px',
                margin: '0 auto',
                background: PROGRESS.BAR_BACKGROUND,
                borderRadius: PROGRESS.BAR_BORDER_RADIUS,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: PROGRESS.BAR_FILL,
                  transition: PROGRESS.TRANSITION
                }} />
              </div>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '8px'
              }}>
                Progress: {generatingCount}/{numVariations}
              </p>
            </div>
          </motion.div>
        )}

        {generatedImages.length > 0 && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0
              }}>
                {generatedImages.length > 1 ? `Generated Images (${generatedImages.length})` : 'Generated Image'}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '10px 16px',
                    minHeight: '44px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
                  onClick={handleRegenerate}
                  disabled={generating}
                  style={{
                    padding: '10px 16px',
                    minHeight: '44px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    opacity: generating ? 0.6 : 1
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
                <button
                  onClick={handleShare}
                  style={{
                    padding: '10px 16px',
                    minHeight: '44px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
            {/* Grid of Generated Images */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: generatedImages.length === 1 
                ? '1fr' 
                : generatedImages.length === 2 
                  ? 'repeat(2, 1fr)' 
                  : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {generatedImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'relative',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Generated variation ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '8px'
                    }}
                  />
                  {generatedImages.length > 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '4px 8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Variation {index + 1}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '6px'
                  }}>
                    <button
                      onClick={async () => {
                        try {
                          const a = document.createElement('a');
                          a.href = img.imageUrl;
                          a.download = `ai-image-v${index + 1}-${Date.now()}.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);

                          // Show rate app modal after download (if user hasn't rated yet)
                          const hasRated = localStorage.getItem('hasRatedApp') === 'true';
                          const hasSeenRatingPrompt = localStorage.getItem('hasSeenRatingPrompt') === 'true';
                          
                          if (user && !hasRated) {
                            const lastPromptTime = localStorage.getItem('lastRatingPromptTime');
                            const shouldShow = !hasSeenRatingPrompt || 
                              (lastPromptTime && Date.now() - parseInt(lastPromptTime) > 7 * 24 * 60 * 60 * 1000);
                            
                            if (shouldShow) {
                              setTimeout(() => {
                                setShowRateAppModal(true);
                                localStorage.setItem('hasSeenRatingPrompt', 'true');
                                localStorage.setItem('lastRatingPromptTime', Date.now().toString());
                              }, 500);
                            }
                          }
                        } catch (err) {
                          logger.error('Individual download error:', err);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        minWidth: '36px',
                        minHeight: '36px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                      }}
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '48px' }}
        >
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            Recent Generations
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {generationHistory.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setGeneratedImage(item.imageUrl);
                  setPrompt(item.prompt);
                }}
              >
                <img
                  src={item.imageUrl}
                  alt="Generated"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <div style={{
                  padding: '12px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {item.prompt.substring(0, 50)}...
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rate App Modal */}
      <RateAppModal
        isOpen={showRateAppModal}
        onClose={() => setShowRateAppModal(false)}
        onSuccess={(data) => {
          // Credits updated via event dispatch in modal
          logger.log('[AIImageGenerator] Rating reward successful:', data);
        }}
      />
      </div>
    </div>
  );
};

export default AIImageGenerator;

