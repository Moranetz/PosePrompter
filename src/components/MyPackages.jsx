import React, { useState, useEffect, memo } from 'react';
import { logger } from '../utils/logger.js';
import { Edit2, Trash2, Eye, Loader2, Plus, Package, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/UserContext';
import { getUserPackages, deletePackage, publishPackage } from '../packageService';
import CreatePackageModal from './CreatePackageModal';
import PackageDetailModal from './PackageDetailModal';
import { useToast } from './Toast/ToastContainer';
import { SkeletonGrid } from './Skeleton/SkeletonCard';
import EmptyState from './EmptyStates/EmptyState';
import ScrollReveal from './ScrollReveal/ScrollReveal';

const MyPackages = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load user packages
  useEffect(() => {
    if (user) {
      loadPackages();
    }
  }, [user]);

  const loadPackages = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const userPkgs = await getUserPackages(user.uid);
      setPackages(userPkgs);
    } catch (err) {
      logger.error('Error loading packages:', err);
      const errorMsg = 'Failed to load your packages. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (packageId) => {
    try {
      await deletePackage(packageId);
      setPackages(packages.filter(pkg => (pkg.packageId || pkg.id) !== packageId));
      setDeleteConfirm(null);
      toast.success('Package deleted successfully');
    } catch (err) {
      logger.error('Error deleting package:', err);
      const errorMsg = 'Failed to delete package. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Handle publish
  const handlePublish = async (packageId) => {
    try {
      await publishPackage(packageId);
      await loadPackages(); // Reload to get updated status
      toast.success('Package published successfully!');
    } catch (err) {
      logger.error('Error publishing package:', err);
      const errorMsg = 'Failed to publish package. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Handle package creation success
  const handleCreateSuccess = () => {
    loadPackages();
    toast.success('Package created successfully!');
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Package size={48} style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Please sign in to view your packages
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        padding: '24px',
        color: '#ffffff',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
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
              My Packages
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Manage your prompt collection packages
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(139, 92, 246, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Plus size={20} />
            Create Package
          </motion.button>
        </div>
        </ScrollReveal>

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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Packages Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : packages.length === 0 ? (
          <EmptyState
            icon="package"
            title="No packages yet"
            description="Create your first package to share your prompt collections with the community"
            actionLabel="Create Package"
            onAction={() => setShowCreateModal(true)}
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
                  onView={() => {
                    setSelectedPackage(pkg);
                    setShowDetailModal(true);
                  }}
                  onEdit={() => {
                    toast.info('Edit functionality coming soon');
                  }}
                  onDelete={() => setDeleteConfirm(pkg.packageId || pkg.id)}
                  onPublish={() => handlePublish(pkg.packageId || pkg.id)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Create Package Modal */}
      {showCreateModal && (
        <CreatePackageModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Package Detail Modal */}
      {showDetailModal && selectedPackage && (
        <PackageDetailModal
          package={selectedPackage}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPackage(null);
          }}
          onInstall={() => {}}
          isInstalled={false}
        />
      )}

      {/* Delete Confirmation Modal */}
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
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
              }}
            >
              Delete Package?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
              This action cannot be undone. The package will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

// Package Card Component - Memoized for performance
const PackageCard = memo(({ pkg, onView, onEdit, onDelete, onPublish }) => {
  const price = pkg.price || 0;
  const priceDisplay = price === 0 ? 'Free' : `$${(price / 100).toFixed(2)}`;
  const status = pkg.status || 'draft';
  const downloads = pkg.stats?.downloads || 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      onHoverStart={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
        e.currentTarget.style.borderColor = '#8b5cf6';
      }}
      onHoverEnd={(e) => {
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
        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '6px 12px',
            background:
              status === 'published'
                ? 'rgba(34, 197, 94, 0.9)'
                : status === 'draft'
                ? 'rgba(251, 191, 36, 0.9)'
                : 'rgba(239, 68, 68, 0.9)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}
        >
          {status}
        </div>
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
      </div>

      {/* Card Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
          <div>
            <span style={{ fontWeight: '500' }}>{downloads}</span> downloads
          </div>
          <div>
            <span style={{ fontWeight: '500' }}>{Object.keys(pkg.options || {}).length}</span> categories
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
            onClick={onView}
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
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
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
            <Eye size={16} />
            View
          </button>
          {status === 'draft' && (
            <button
              onClick={onPublish}
              style={{
                padding: '10px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '8px',
                color: '#86efac',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              Publish
            </button>
          )}
          <button
            onClick={onEdit}
            style={{
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: '#8b5cf6' }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 size={16} />
          </motion.button>
          <motion.button
            onClick={onDelete}
            style={{
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

PackageCard.displayName = 'PackageCard';

export default MyPackages;

