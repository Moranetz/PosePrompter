import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import { logger } from '../utils/logger.js';
import { Search, Filter, Star, Download, ChevronDown, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/UserContext';
import { getAllPackages, searchPackages, getUserPackages } from '../packageService';
import { getUserProfile } from '../firestoreService';
import { useToast } from './Toast/ToastContainer';
import { SkeletonGrid } from './Skeleton/SkeletonCard';
import EmptyState from './EmptyStates/EmptyState';
import ScrollReveal from './ScrollReveal/ScrollReveal';

// Lazy load modals for better performance
const PackageDetailModal = lazy(() => import('./PackageDetailModal'));
const InstallPackageModal = lazy(() => import('./InstallPackageModal'));

const PackageMarketplace = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [installedPackages, setInstalledPackages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('downloads');
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showMyInstalls, setShowMyInstalls] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Modal states
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Load installed packages
  useEffect(() => {
    if (user) {
      loadInstalledPackages();
    }
  }, [user]);

  const loadInstalledPackages = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile && profile.installedPackages) {
        setInstalledPackages(profile.installedPackages);
      }
    } catch (err) {
      logger.error('Error loading installed packages:', err);
    }
  };

  // Load packages
  useEffect(() => {
    loadPackages();
  }, [sortBy, priceFilter, categoryFilter, showMyInstalls]);

  const loadPackages = async () => {
    setLoading(true);
    setError('');

    try {
      let results = [];

      if (showMyInstalls && user) {
        // PERFORMANCE OPTIMIZATION: Reuse installedPackages state instead of duplicate query
        // Load user's installed packages
        const userPkgs = await getUserPackages(user.uid);
        // Filter to only installed ones using cached state
        results = userPkgs.filter(pkg => installedPackages.includes(pkg.packageId || pkg.id));
      } else {
        // Build filters
        const filters = {
          sortBy: sortBy === 'downloads' ? 'downloads' : 
                  sortBy === 'rating' ? 'rating' : 
                  sortBy === 'stars' ? 'stars' :
                  'publishedAt',
          sortOrder: 'desc',
          limit: 50,
        };

        if (priceFilter === 'free') {
          filters.maxPrice = 0;
        } else if (priceFilter === 'paid') {
          filters.minPrice = 1;
        }

        if (categoryFilter !== 'all') {
          filters.category = categoryFilter;
        }

        results = await getAllPackages(filters);
      }

      setPackages(results);
    } catch (err) {
      logger.error('Error loading packages:', err);
      const errorMsg = 'Failed to load packages. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      loadPackages();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await searchPackages(searchTerm, { limit: 50 });
      setPackages(results);
      if (results.length === 0) {
        toast.info('No packages found matching your search');
      }
    } catch (err) {
      logger.error('Error searching packages:', err);
      const errorMsg = 'Failed to search packages. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Get unique categories from packages
  const availableCategories = useMemo(() => {
    const categories = new Set();
    packages.forEach(pkg => {
      if (pkg.category) {
        categories.add(pkg.category);
      }
    });
    return Array.from(categories).sort();
  }, [packages]);

  // Handle package card click
  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  // Handle install button click
  const handleInstallClick = (e, pkg) => {
    e.stopPropagation();
    setSelectedPackage(pkg);
    setShowInstallModal(true);
  };

  // Handle successful install
  const handleInstallSuccess = () => {
    loadInstalledPackages();
    setShowInstallModal(false);
    setShowDetailModal(false);
    toast.success('Package installed successfully!');
  };

  // Check if package is installed
  const isInstalled = (packageId) => {
    return installedPackages.includes(packageId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        padding: 'clamp(12px, 3vw, 24px)',
        color: '#ffffff',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Package Marketplace
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Discover and install prompt collections from the community
            </p>
          </div>
        </ScrollReveal>

        {/* Search and Filters Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Search packages by name, tags, or description..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 48px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s ease',
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
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  loadPackages();
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Sort Dropdown */}
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '10px 36px 10px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="stars">Most Starred</option>
                <option value="downloads">Most Downloads</option>
                <option value="rating">Top Rated</option>
                <option value="publishedAt">Newest</option>
                <option value="price">Price</option>
              </select>
              <ChevronDown
                size={16}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              />
            </div>

            {/* Price Filters */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'free', 'paid'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPriceFilter(filter)}
                  style={{
                    padding: '10px 16px',
                    background: priceFilter === filter ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${priceFilter === filter ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'capitalize',
                  }}
                  onMouseEnter={(e) => {
                    if (priceFilter !== filter) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (priceFilter !== filter) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  {filter === 'all' ? 'All Prices' : filter === 'free' ? 'Free' : 'Paid'}
                </button>
              ))}
            </div>

            {/* My Installs Filter */}
            {user && (
              <button
                onClick={() => setShowMyInstalls(!showMyInstalls)}
                style={{
                  padding: '10px 16px',
                  background: showMyInstalls ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${showMyInstalls ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!showMyInstalls) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showMyInstalls) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                My Installs
              </button>
            )}

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  style={{
                    padding: '10px 36px 10px 16px',
                    background: categoryFilter !== 'all' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${categoryFilter !== 'all' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Filter size={14} />
                  {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                  <ChevronDown size={14} />
                </button>
                {showCategoryDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      background: 'rgba(26, 26, 46, 0.95)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      minWidth: '200px',
                      zIndex: 100,
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setShowCategoryDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: categoryFilter === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      All Categories
                    </button>
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat);
                          setShowCategoryDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: categoryFilter === cat ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#fca5a5',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Packages Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : packages.length === 0 ? (
          <EmptyState
            icon={searchTerm ? 'search' : 'package'}
            title={searchTerm ? 'No packages found' : 'No packages yet'}
            description={
              searchTerm
                ? 'Try a different search term or browse all packages'
                : 'Be the first to create a package and share it with the community!'
            }
          />
        ) : (
          <div
            className="package-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {packages.map((pkg, index) => (
              <ScrollReveal key={pkg.packageId || pkg.id} delay={index * 0.1}>
                <PackageCard
                  pkg={pkg}
                  isInstalled={isInstalled(pkg.packageId || pkg.id)}
                  onClick={() => handlePackageClick(pkg)}
                  onInstall={(e) => handleInstallClick(e, pkg)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Package Detail Modal */}
      {showDetailModal && selectedPackage && (
        <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading...</div>}>
          <PackageDetailModal
            package={selectedPackage}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPackage(null);
            }}
            onInstall={() => {
              setShowDetailModal(false);
              setShowInstallModal(true);
            }}
            isInstalled={isInstalled(selectedPackage.packageId || selectedPackage.id)}
          />
        </Suspense>
      )}

      {/* Install Package Modal */}
      {showInstallModal && selectedPackage && (
        <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading...</div>}>
          <InstallPackageModal
            package={selectedPackage}
            isOpen={showInstallModal}
            onClose={() => {
              setShowInstallModal(false);
              setSelectedPackage(null);
            }}
            onSuccess={handleInstallSuccess}
          />
        </Suspense>
      )}

      {/* Click outside to close category dropdown */}
      {showCategoryDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
          onClick={() => setShowCategoryDropdown(false)}
        />
      )}

    </motion.div>
  );
};

// Package Card Component - Memoized for performance
const PackageCard = memo(({ pkg, isInstalled, onClick, onInstall }) => {
  const price = pkg.price || 0;
  const priceDisplay = price === 0 ? 'Free' : `$${(price / 100).toFixed(2)}`;
  const rating = pkg.stats?.rating || 0;
  const ratingCount = pkg.stats?.ratingCount || 0;
  const downloads = pkg.stats?.downloads || 0;
  const stars = pkg.stats?.stars || 0;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        willChange: 'transform', // Hint for GPU acceleration
        transform: 'translateZ(0)', // Force GPU layer
      }}
      onHoverStart={(e) => {
        // Instant updates - no delay
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
        e.currentTarget.style.borderColor = '#8b5cf6';
      }}
      onHoverEnd={(e) => {
        // Instant updates
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
      }}
    >
      {/* Cover Image */}
      <div
        style={{
          width: '100%',
          height: '200px',
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
            top: '12px',
            right: '12px',
            padding: '6px 12px',
            background: price === 0 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(139, 92, 246, 0.9)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {priceDisplay}
        </div>
        {isInstalled && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '6px 12px',
              background: 'rgba(34, 197, 94, 0.9)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            Installed
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Package Name */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#ffffff',
            lineHeight: '1.3',
          }}
        >
          {pkg.name}
        </h3>

        {/* Author */}
        {pkg.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            {pkg.author.avatar && (
              <img
                src={pkg.author.avatar}
                alt={pkg.author.displayName}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            )}
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {pkg.author.displayName || 'Anonymous'}
            </span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
            <Star size={14} style={{ fill: stars > 0 ? '#fbbf24' : 'transparent', color: '#fbbf24' }} />
            <span>{stars}</span>
          </div>
          {rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px' }}>Rating:</span>
              <span>{rating.toFixed(1)}</span>
              {ratingCount > 0 && <span>({ratingCount})</span>}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={14} />
            <span>{downloads}</span>
          </div>
        </div>

        {/* Description Preview */}
        {pkg.description && (
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '16px',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {pkg.description}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <button
            onClick={onClick}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease', // Only animate transform/shadow, colors change instantly
              willChange: 'background-color, border-color, transform', // Hint for GPU acceleration
              transform: 'translateZ(0)', // Force GPU layer
            }}
            onMouseEnter={(e) => {
              // Instant color change - no transition on colors
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              // Instant color change
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
          >
            Preview
          </button>
          <motion.button
            onClick={onInstall}
            disabled={isInstalled}
            style={{
              flex: 1,
              padding: '10px',
              background: isInstalled
                ? 'rgba(139, 92, 246, 0.3)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isInstalled ? 'not-allowed' : 'pointer',
              opacity: isInstalled ? 0.6 : 1,
              willChange: 'transform', // Hint for GPU acceleration
              transform: 'translateZ(0)', // Force GPU layer
            }}
            whileHover={!isInstalled ? { y: -2, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)' } : {}}
            whileTap={!isInstalled ? { scale: 0.95 } : {}}
            transition={{ duration: 0.1 }} // Faster animation
          >
            {isInstalled ? 'Installed' : 'Install'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

PackageCard.displayName = 'PackageCard';

export default PackageMarketplace;

