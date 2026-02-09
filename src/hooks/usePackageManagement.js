/**
 * Custom Hook: usePackageManagement
 * 
 * Encapsulates package CRUD operations
 * Provides loading state, error handling, and package management functions
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '../utils/logger.js';
import { 
  getUserPackages, 
  createPackage, 
  updatePackage, 
  deletePackage,
  installPackage,
  uninstallPackage,
} from '../packageService.js';
import { useAuth } from '../contexts/UserContext.jsx';

export function usePackageManagement() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load user packages
   */
  const loadPackages = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userPkgs = await getUserPackages(user.uid);
      setPackages(userPkgs);
      logger.log('[usePackageManagement] Packages loaded:', userPkgs.length);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load packages';
      setError(errorMessage);
      logger.error('[usePackageManagement] Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Create new package
   */
  const create = useCallback(async (packageData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const newPackage = await createPackage(user.uid, packageData);
      setPackages(prev => [newPackage, ...prev]);
      logger.log('[usePackageManagement] Package created:', newPackage.id);
      return newPackage;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create package';
      setError(errorMessage);
      logger.error('[usePackageManagement] Error creating package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Update package
   */
  const update = useCallback(async (packageId, updates) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedPackage = await updatePackage(user.uid, packageId, updates);
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? updatedPackage : pkg
      ));
      logger.log('[usePackageManagement] Package updated:', packageId);
      return updatedPackage;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update package';
      setError(errorMessage);
      logger.error('[usePackageManagement] Error updating package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Delete package
   */
  const remove = useCallback(async (packageId) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      await deletePackage(user.uid, packageId);
      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      logger.log('[usePackageManagement] Package deleted:', packageId);
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete package';
      setError(errorMessage);
      logger.error('[usePackageManagement] Error deleting package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Install package
   */
  const install = useCallback(async (packageId) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      await installPackage(user.uid, packageId);
      logger.log('[usePackageManagement] Package installed:', packageId);
      // Reload packages to get updated installation status
      await loadPackages();
    } catch (err) {
      const errorMessage = err.message || 'Failed to install package';
      setError(errorMessage);
      logger.error('[usePackageManagement] Error installing package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, loadPackages]);

  /**
   * Uninstall package
   */
  const uninstall = useCallback(async (packageId) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      await uninstallPackage(user.uid, packageId);
      logger.log('[usePackageManagement] Package uninstalled:', packageId);
      // Reload packages to get updated installation status
      await loadPackages();
    } catch (err) {
      const errorMessage = err.message || 'Failed to uninstall package';
      setError(errorMessage);
      logger.error('[usePackageManagement] Error uninstalling package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, loadPackages]);

  // Load packages on mount and when user changes
  useEffect(() => {
    if (user) {
      loadPackages();
    }
  }, [user, loadPackages]);

  return {
    packages,
    loading,
    error,
    loadPackages,
    createPackage: create,
    updatePackage: update,
    deletePackage: remove,
    installPackage: install,
    uninstallPackage: uninstall,
  };
}

