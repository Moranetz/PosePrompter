import React, { useState, useMemo } from 'react';
import { X, Star, Download, Share2, Flag, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { categoryDisplayNames } from './CreatePackageModal';

const PackageDetailModal = ({ package: pkg, isOpen, onClose, onInstall, isInstalled }) => {
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen || !pkg) return null;

  const price = pkg.price || 0;
  const priceDisplay = price === 0 ? 'Free' : `$${(price / 100).toFixed(2)}`;
  const rating = pkg.stats?.rating || 0;
  const ratingCount = pkg.stats?.ratingCount || 0;
  const downloads = pkg.stats?.downloads || 0;
  const stars = pkg.stats?.stars || 0;

  // Calculate total options
  const totalOptions = useMemo(() => {
    if (!pkg.options) return 0;
    return Object.values(pkg.options).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }, [pkg.options]);

  // Handle share
  const handleShare = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: pkg.name,
          text: pkg.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      setSharing(false);
    }
  };

  // Handle report
  const handleReport = () => {
    // TODO: Implement report functionality
    alert('Report functionality coming soon');
  };

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

        {/* Cover Image */}
        <div
          style={{
            width: '100%',
            height: '300px',
            background: pkg.coverImage
              ? `url(${pkg.coverImage})`
              : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Price Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px 16px',
              background: price === 0 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(139, 92, 246, 0.9)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            {priceDisplay}
          </div>
          {isInstalled && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.9)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Installed
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '12px',
              }}
            >
              {pkg.name}
            </h2>

            {/* Author */}
            {pkg.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {pkg.author.avatar && (
                  <img
                    src={pkg.author.avatar}
                    alt={pkg.author.displayName}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>
                    {pkg.author.displayName || 'Anonymous'}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                    Package Creator
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} style={{ fill: stars > 0 ? '#fbbf24' : 'transparent', color: '#fbbf24' }} />
                <div>
                  <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                    {stars.toLocaleString()}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                    {stars === 1 ? 'star' : 'stars'}
                  </div>
                </div>
              </div>
              {rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                      {rating.toFixed(1)}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                      {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={20} style={{ color: '#ec4899' }} />
                <div>
                  <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                    {downloads.toLocaleString()}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>downloads</div>
                </div>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                  {Object.keys(pkg.options || {}).length}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>categories</div>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                  {totalOptions}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>options</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                Description
              </h3>
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '16px',
                  lineHeight: '1.6',
                }}
              >
                {pkg.description}
              </p>
            </div>
          )}

          {/* What's Included */}
          {pkg.options && Object.keys(pkg.options).length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
                What's Included
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '16px',
                }}
              >
                {Object.entries(pkg.options).map(([category, options]) => (
                  <div
                    key={category}
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ color: '#8b5cf6', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      {categoryDisplayNames[category] || category}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      {options?.length || 0} {options?.length === 1 ? 'option' : 'options'}
                    </div>
                    {options && options.length > 0 && (
                      <div
                        style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                      >
                        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                          Preview:
                        </div>
                        {options.slice(0, 2).map((opt, idx) => (
                          <div
                            key={idx}
                            style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '12px',
                              marginTop: '4px',
                              paddingLeft: '8px',
                            }}
                          >
                            • {typeof opt === 'string' ? opt.substring(0, 40) : 'Option'}...
                          </div>
                        ))}
                        {options.length > 2 && (
                          <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', marginTop: '4px', paddingLeft: '8px' }}>
                            +{options.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {pkg.tags && pkg.tags.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                Tags
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {pkg.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '6px',
                      color: '#c4b5fd',
                      fontSize: '14px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Package Info */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '10px',
              marginBottom: '32px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Package Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '4px' }}>
                  License
                </div>
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>
                  {pkg.license || 'MIT'}
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '4px' }}>
                  Version
                </div>
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>
                  {pkg.version || '1.0.0'}
                </div>
              </div>
              {pkg.category && (
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '4px' }}>
                    Category
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>
                    {pkg.category}
                  </div>
                </div>
              )}
              {pkg.publishedAt && (
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '4px' }}>
                    Published
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>
                    {pkg.publishedAt.toDate ? pkg.publishedAt.toDate().toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section - Placeholder */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Reviews
            </h3>
            <div
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {ratingCount === 0 ? 'No reviews yet. Be the first to review!' : 'Reviews coming soon!'}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onInstall}
              disabled={isInstalled}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                background: isInstalled
                  ? 'rgba(139, 92, 246, 0.3)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                cursor: isInstalled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isInstalled ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.4)',
                opacity: isInstalled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isInstalled) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isInstalled) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }
              }}
            >
              {isInstalled ? (
                <>
                  <Check size={20} />
                  Installed
                </>
              ) : (
                <>
                  <Download size={20} />
                  Install Package
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              style={{
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
            >
              {sharing ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : shareSuccess ? (
                <Check size={18} />
              ) : (
                <Share2 size={18} />
              )}
              {shareSuccess ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={handleReport}
              style={{
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#fca5a5',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              <Flag size={18} />
              Report
            </button>
          </div>
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
  );
};

export default PackageDetailModal;

