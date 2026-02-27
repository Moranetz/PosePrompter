import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Camera, Sparkles, Check, ChevronDown } from 'lucide-react';
import { analyzeImage, validateImageFile } from '../utils/imageAnalysisService';
import { categoryDisplayNames } from '../data/categoryRegistry';

const ImageToPromptModal = ({ isOpen, onClose, onSaveOption, categories }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Aesthetic');
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setAnalyzing(false);
    setError(null);
    setGeneratedTitle('');
    setGeneratedPrompt('');
    setSelectedCategory('Aesthetic');
    setSaved(false);
    setDragOver(false);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFile = useCallback((selectedFile) => {
    setError(null);
    setSaved(false);
    setGeneratedPrompt('');
    setGeneratedTitle('');

    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const result = await analyzeImage(file, {
        category: selectedCategory,
        signal: abortRef.current.signal,
      });
      setGeneratedTitle(result.title);
      setGeneratedPrompt(result.prompt);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.userMessage || err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
      abortRef.current = null;
    }
  }, [file, selectedCategory]);

  const handleSave = useCallback(async () => {
    if (!generatedPrompt.trim() || !generatedTitle.trim()) return;

    try {
      await onSaveOption(selectedCategory, {
        title: generatedTitle.trim(),
        prompt: generatedPrompt.trim(),
      });
      setSaved(true);
    } catch {
      // savePhotoToPromptOption handles its own error/rollback and alerts
    }
  }, [generatedPrompt, generatedTitle, selectedCategory, onSaveOption]);

  // Reset saved state when user switches category after saving
  const prevCategoryRef = useRef(selectedCategory);
  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory) {
      prevCategoryRef.current = selectedCategory;
      setSaved(false);
    }
  }, [selectedCategory]);

  // Abort in-flight analysis if modal unmounts or closes
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const availableCategories = Object.keys(categoryDisplayNames).filter(
    (key) => categories[key] && categories[key].length >= 0
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '640px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(168, 85, 247, 0.2)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            borderRadius: '8px', padding: '6px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', display: 'flex',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Camera size={22} color="#a855f7" />
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#ffffff' }}>
            Generate Prompt from Photo
          </h3>
        </div>

        {/* Upload area */}
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#a855f7' : 'rgba(168, 85, 247, 0.3)'}`,
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s ease',
              marginBottom: '20px',
            }}
          >
            <Upload size={36} color={dragOver ? '#a855f7' : 'rgba(255,255,255,0.3)'} style={{ marginBottom: '12px' }} />
            <p style={{ margin: '0 0 6px 0', color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: '500' }}>
              Drop an image here or click to upload
            </p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              JPG, PNG, or WebP — max 5 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          /* Image preview */
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <img
              src={preview}
              alt="Uploaded"
              style={{
                width: '100%',
                maxHeight: '240px',
                objectFit: 'contain',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <button
              onClick={() => { setFile(null); setPreview(null); setGeneratedPrompt(''); setGeneratedTitle(''); setError(null); setSaved(false); }}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '6px', padding: '4px', cursor: 'pointer',
                color: '#fff', display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Category picker */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>
            Target Category
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 36px 10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#ffffff',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#1a1a2e', color: '#fff' }}>
                  {categoryDisplayNames[cat] || cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="rgba(255,255,255,0.4)"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#fca5a5',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze button */}
        {preview && !generatedPrompt && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              width: '100%',
              padding: '14px',
              background: analyzing
                ? 'rgba(168, 85, 247, 0.3)'
                : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: analyzing ? 'none' : '0 4px 16px rgba(168, 85, 247, 0.4)',
              marginBottom: '16px',
            }}
          >
            {analyzing ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing image...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze Photo
              </>
            )}
          </button>
        )}

        {/* Generated prompt (editable) */}
        {generatedPrompt && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>
                Title
              </label>
              <input
                type="text"
                value={generatedTitle}
                onChange={(e) => { setGeneratedTitle(e.target.value); setSaved(false); }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>
                Generated Prompt — edit as needed
              </label>
              <textarea
                value={generatedPrompt}
                onChange={(e) => { setGeneratedPrompt(e.target.value); setSaved(false); }}
                style={{
                  width: '100%',
                  minHeight: '180px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {analyzing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                Re-analyze
              </button>

              <button
                onClick={handleSave}
                disabled={saved || !generatedPrompt.trim() || !generatedTitle.trim()}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: saved
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : (generatedPrompt.trim() && generatedTitle.trim())
                      ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                      : 'rgba(168, 85, 247, 0.3)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: (saved || !generatedPrompt.trim() || !generatedTitle.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: saved ? '0 4px 12px rgba(34,197,94,0.3)' : '0 4px 12px rgba(168,85,247,0.3)',
                }}
              >
                {saved ? (
                  <>
                    <Check size={16} />
                    Saved to {categoryDisplayNames[selectedCategory]}
                  </>
                ) : (
                  <>
                    Save to {categoryDisplayNames[selectedCategory]}
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Spinner animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default ImageToPromptModal;
