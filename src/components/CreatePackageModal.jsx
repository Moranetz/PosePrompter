import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, Loader2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase-config';
import { useAuth } from '../contexts/UserContext';
import { getUserProfile } from '../firestoreService';
import { createPackage, publishPackage } from '../packageService';
import { getErrorMessage } from '../utils/errorHandler';

// Category display names
export const categoryDisplayNames = {
  'Aesthetic': 'Aesthetic',
  'BodyPose': 'Body Pose',
  'Torso': 'Torso',
  'Arms': 'Arms',
  'Hands': 'Hands',
  'Legs': 'Legs',
  'Feet': 'Feet',
  'HeadPosition': 'Head Position',
  'FacialExpression': 'Facial Expression',
  'Eyes': 'Eyes',
  'Mouth': 'Mouth',
  'Hair': 'Hair',
  'Outfit': 'Outfit',
  'OutfitTop': 'Outfit Top',
  'OutfitBottom': 'Outfit Bottom',
  'Shoes': 'Shoes',
  'Jewelry': 'Jewelry',
  'HairAccessories': 'Hair Accessories',
  'Bags': 'Bags',
  'BrandDesigner': 'Brand/Designer',
  'Perspective': 'Perspective',
  'Framing': 'Framing',
  'CameraAngle': 'Camera Angle',
  'CameraType': 'Camera Type',
  'Lighting': 'Lighting',
  'ColorPalette': 'Color Palette',
  'Texture': 'Texture',
  'Mood': 'Mood',
  'PhotoStyle': 'Photo Style',
  'Background': 'Background',
  'Props': 'Props',
};

const CreatePackageModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: null,
    coverImageUrl: '',
    selectedCategories: [],
    tags: '',
    price: 'free',
    customPrice: '',
    license: 'personal',
    category: '',
  });

  // User custom options
  const [userCustomOptions, setUserCustomOptions] = useState({});
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Load user custom options
  useEffect(() => {
    if (isOpen && user) {
      loadUserCustomOptions();
    }
  }, [isOpen, user]);

  const loadUserCustomOptions = async () => {
    if (!user) return;
    setLoadingUserData(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile && profile.customOptions) {
        setUserCustomOptions(profile.customOptions);
      }
    } catch (err) {
      console.error('Error loading user custom options:', err);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        coverImage: null,
        coverImageUrl: '',
        selectedCategories: [],
        tags: '',
        price: 'free',
        customPrice: '',
        license: 'personal',
        category: '',
      });
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (uploadingImage) return; // Prevent double-clicks

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

    setUploadingImage(true);
    setError('');

    if (!storage) {
      setError('Firebase storage is not initialized. Please check your Firebase configuration.');
      setUploadingImage(false);
      return;
    }

    try {
      console.log('[CreatePackageModal] Uploading image:', file.name);
      // Create a unique filename
      const fileName = `package-covers/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      await uploadBytes(storageRef, file);
      console.log('[CreatePackageModal] Image uploaded successfully');

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('[CreatePackageModal] Got download URL');

      setFormData(prev => ({
        ...prev,
        coverImage: file,
        coverImageUrl: downloadURL,
      }));
    } catch (err) {
      console.error('[CreatePackageModal] Error uploading image:', err);
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setFormData(prev => {
      const isSelected = prev.selectedCategories.includes(category);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter(c => c !== category)
          : [...prev.selectedCategories, category],
      };
    });
  };

  // Get options count for selected categories
  const getTotalOptionsCount = useMemo(() => {
    let count = 0;
    formData.selectedCategories.forEach(category => {
      const customOptions = userCustomOptions[category] || [];
      count += customOptions.length;
    });
    return count;
  }, [formData.selectedCategories, userCustomOptions]);

  // Validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Package name is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (formData.description.length > 500) {
      setError('Description must be 500 characters or less');
      return false;
    }

    if (formData.selectedCategories.length === 0) {
      setError('Please select at least one category');
      return false;
    }

    if (getTotalOptionsCount < 3) {
      setError('You must have at least 3 options across all selected categories');
      return false;
    }

    if (formData.price === 'custom' && (!formData.customPrice || parseFloat(formData.customPrice) <= 0)) {
      setError('Please enter a valid custom price');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (publish = false) => {
    if (loading) return; // Prevent double-clicks

    if (!user) {
      setError('Please sign in to do that');
      return;
    }

    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('[CreatePackageModal] Creating package, publish:', publish);
      
      // Build options object from selected categories
      const options = {};
      formData.selectedCategories.forEach(category => {
        const customOptions = userCustomOptions[category] || [];
        // Extract text/prompt from each option
        options[category] = customOptions.map(opt => opt.text || opt.prompt || opt.title || '');
      });

      // Calculate price in cents
      let priceInCents = 0;
      if (formData.price === '2.99') {
        priceInCents = 299;
      } else if (formData.price === '4.99') {
        priceInCents = 499;
      } else if (formData.price === 'custom') {
        priceInCents = Math.round(parseFloat(formData.customPrice) * 100);
      }

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create package data
      const packageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        coverImage: formData.coverImageUrl,
        options,
        tags,
        category: formData.category.trim(),
        price: priceInCents,
        license: formData.license === 'personal' ? 'Personal Use' : 'Commercial OK',
      };

      console.log('[CreatePackageModal] Package data prepared:', packageData);

      // Create package
      const packageId = await createPackage(user.uid, packageData);
      console.log('[CreatePackageModal] Package created:', packageId);

      // If publishing, update status
      if (publish) {
        await publishPackage(packageId);
        console.log('[CreatePackageModal] Package published');
        setSuccessMessage('Package published successfully!');
      } else {
        setSuccessMessage('Package saved as draft!');
      }

      // Reset form
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('[CreatePackageModal] Error creating package:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get all available categories from userCustomOptions
  const availableCategories = Object.keys(userCustomOptions).filter(
    cat => userCustomOptions[cat] && userCustomOptions[cat].length > 0
  );

  return (
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
        overflow: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '900px',
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
            Create Package
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            Share your custom prompt collections with the community
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px', display: 'flex', gap: '24px', flexDirection: 'column' }}>
          {/* Error/Success Messages */}
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
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '8px',
                color: '#86efac',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              {successMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Package Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Package Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter package name"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
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

              {/* Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Description <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>
                    ({formData.description.length}/500)
                  </span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your package..."
                  disabled={loading}
                  rows={4}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
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

              {/* Cover Image Upload */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Cover Image
                </label>
                {formData.coverImageUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: null, coverImageUrl: '' }))}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#ffffff',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px dashed rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: uploadingImage ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!uploadingImage) {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!uploadingImage) {
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage || loading}
                      style={{ display: 'none' }}
                    />
                    {uploadingImage ? (
                      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6', marginBottom: '8px' }} />
                    ) : (
                      <Upload size={24} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
                    )}
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                      {uploadingImage ? 'Uploading...' : 'Click to upload cover image'}
                    </span>
                  </label>
                )}
              </div>

              {/* Tags */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="portrait, photography, style"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
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

              {/* Category */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Package Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Photography, Art, Fashion"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
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
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Category Selection */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Select Categories <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>
                    ({formData.selectedCategories.length} selected, {getTotalOptionsCount} options)
                  </span>
                </label>
                {loadingUserData ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : availableCategories.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                    No custom options found. Create custom options first to create a package.
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {availableCategories.map(category => {
                      const isSelected = formData.selectedCategories.includes(category);
                      const optionCount = (userCustomOptions[category] || []).length;
                      return (
                        <label
                          key={category}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px',
                            background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                            border: isSelected ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategory(category)}
                            disabled={loading}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#8b5cf6',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                              {categoryDisplayNames[category] || category}
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                              {optionCount} {optionCount === 1 ? 'option' : 'options'}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Categories Options Preview */}
              {formData.selectedCategories.length > 0 && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff',
                    }}
                  >
                    Options Preview
                  </label>
                  <div
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {formData.selectedCategories.map(category => {
                      const options = userCustomOptions[category] || [];
                      return (
                        <div key={category}>
                          <div style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                            {categoryDisplayNames[category] || category}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px' }}>
                            {options.slice(0, 3).map((opt, idx) => (
                              <div
                                key={idx}
                                style={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  borderRadius: '4px',
                                }}
                              >
                                {opt.title || opt.text?.substring(0, 50) || opt.prompt?.substring(0, 50) || 'Option'}
                              </div>
                            ))}
                            {options.length > 3 && (
                              <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', paddingLeft: '8px' }}>
                                +{options.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  Price
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['free', '2.99', '4.99', 'custom'].map(price => (
                    <label
                      key={price}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: formData.price === price ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: formData.price === price ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="price"
                        value={price}
                        checked={formData.price === price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        disabled={loading}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#8b5cf6',
                        }}
                      />
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>
                        {price === 'free' ? 'Free' : price === 'custom' ? 'Custom' : `$${price}`}
                      </span>
                    </label>
                  ))}
                  {formData.price === 'custom' && (
                    <input
                      type="number"
                      value={formData.customPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, customPrice: e.target.value }))}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
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
                  )}
                </div>
              </div>

              {/* License */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                  }}
                >
                  License
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['personal', 'commercial'].map(license => (
                    <label
                      key={license}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: formData.license === license ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: formData.license === license ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="license"
                        value={license}
                        checked={formData.license === license}
                        onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                        disabled={loading}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#8b5cf6',
                        }}
                      />
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>
                        {license === 'personal' ? 'Personal Use' : 'Commercial OK'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '10px',
            }}
          >
            <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Preview</h3>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
              }}
            >
              {formData.coverImageUrl ? (
                <img
                  src={formData.coverImageUrl}
                  alt="Preview"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon size={32} style={{ color: 'rgba(139, 92, 246, 0.5)' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {formData.name || 'Package Name'}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '12px' }}>
                  {formData.description || 'Package description will appear here...'}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag)
                    .slice(0, 3)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(139, 92, 246, 0.2)',
                          borderRadius: '4px',
                          color: '#c4b5fd',
                          fontSize: '12px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
                <div style={{ marginTop: '12px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                  {formData.selectedCategories.length} categories • {getTotalOptionsCount} options •{' '}
                  {formData.price === 'free' ? 'Free' : formData.price === 'custom' ? `$${formData.customPrice || '0'}` : `$${formData.price}`}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = '#8b5cf6';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading
                  ? 'rgba(139, 92, 246, 0.5)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Publishing...
                </>
              ) : (
                'Publish Package'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePackageModal;

