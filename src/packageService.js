/**
 * Package Service for Prompt Collection Sharing
 * 
 * This service provides CRUD operations for sharing prompt collections as packages
 * in a marketplace. Packages can be created, published, searched, and installed by users.
 * 
 * @module packageService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase-config';
import { getUserProfile, installPackage as firestoreInstallPackage } from './firestoreService';
import { getErrorMessage } from './utils/errorHandler';
import { logger } from './utils/logger.js';

// Collection name for packages
const PACKAGES_COLLECTION = 'packages';

/**
 * @typedef {Object} Package
 * @property {string} packageId - Unique identifier for the package
 * @property {string} name - Package name
 * @property {string} description - Package description
 * @property {string} coverImage - URL to cover image
 * @property {Object} author - Author information
 * @property {string} author.userId - Author's user ID
 * @property {string} author.displayName - Author's display name
 * @property {string} author.avatar - Author's avatar URL
 * @property {Object.<string, Array<string>>} options - Categories with arrays of option text
 * @property {Array<string>} tags - Array of tags for searchability
 * @property {string} category - Package category
 * @property {Object} stats - Package statistics
 * @property {number} stats.downloads - Download count
 * @property {number} stats.rating - Average rating (0-5)
 * @property {number} stats.ratingCount - Number of ratings
 * @property {number} stats.stars - Number of users who starred this package
 * @property {number} price - Price in cents (0 for free)
 * @property {string} license - License type (e.g., 'MIT', 'CC-BY', 'Commercial')
 * @property {string} version - Package version (e.g., '1.0.0')
 * @property {string} status - Package status ('draft', 'published', 'flagged')
 * @property {Timestamp} createdAt - When package was created
 * @property {Timestamp} updatedAt - When package was last updated
 * @property {Timestamp} publishedAt - When package was published (if published)
 */

/**
 * Creates a new package in Firestore
 * 
 * @param {string} userId - The user's unique ID (author)
 * @param {Object} packageData - Package data
 * @param {string} packageData.name - Package name (required)
 * @param {string} [packageData.description] - Package description
 * @param {string} [packageData.coverImage] - Cover image URL
 * @param {Object.<string, Array<string>>} packageData.options - Categories with option arrays
 * @param {Array<string>} [packageData.tags] - Array of tags
 * @param {string} [packageData.category] - Package category
 * @param {number} [packageData.price] - Price in cents (default: 0)
 * @param {string} [packageData.license] - License type (default: 'MIT')
 * @param {string} [packageData.version] - Version (default: '1.0.0')
 * @returns {Promise<string>} The ID of the created package
 * @throws {Error} If userId or required fields are missing
 * 
 * @example
 * const packageId = await createPackage('user123', {
 *   name: 'Portrait Photography Pack',
 *   description: 'A collection of portrait prompts',
 *   options: {
 *     Aesthetic: ['Professional', 'Casual'],
 *     BodyPose: ['Standing', 'Sitting']
 *   },
 *   tags: ['portrait', 'photography'],
 *   category: 'Photography'
 * });
 */
export const createPackage = async (userId, packageData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!packageData || typeof packageData !== 'object') {
    throw new Error('Package data is required and must be an object');
  }
  if (!packageData.name) {
    throw new Error('Package name is required');
  }
  if (!packageData.options || typeof packageData.options !== 'object') {
    throw new Error('Options object is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    // Get user profile for author info
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User profile does not exist. Create it first.');
    }

    // Generate unique package ID
    const packageId = `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const packageDoc = {
      packageId,
      name: packageData.name,
      description: packageData.description || '',
      coverImage: packageData.coverImage || '',
      author: {
        userId,
        displayName: userProfile.displayName || '',
        avatar: userProfile.avatar || '',
      },
      options: packageData.options,
      tags: packageData.tags || [],
      category: packageData.category || '',
      stats: {
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        stars: 0,
      },
      price: packageData.price !== undefined ? packageData.price : 0,
      license: packageData.license || 'MIT',
      version: packageData.version || '1.0.0',
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: null,
    };

    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    await setDoc(packageRef, packageDoc);

    logger.log('[createPackage] Package created successfully:', packageId);
    return packageId;
  } catch (error) {
    logger.error('[createPackage] Error creating package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Retrieves a package by its ID
 * 
 * @param {string} packageId - The package ID
 * @returns {Promise<Package|null>} Package data or null if not found
 * @throws {Error} If packageId is missing or Firestore operation fails
 * 
 * @example
 * const pkg = await getPackage('pkg_1234567890_abc123');
 * if (pkg) {
 *   console.log(pkg.name);
 * }
 */
export const getPackage = async (packageId) => {
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    const packageSnap = await getDoc(packageRef);

    if (!packageSnap.exists()) {
      return null;
    }

    const packageData = {
      id: packageSnap.id,
      ...packageSnap.data(),
    };
    logger.log('[getPackage] Package retrieved:', packageId, packageData ? 'exists' : 'not found');
    return packageData;
  } catch (error) {
    logger.error('[getPackage] Error getting package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Updates a package in Firestore
 * 
 * @param {string} packageId - The package ID
 * @param {Object} updates - Fields to update (partial Package)
 * @returns {Promise<void>}
 * @throws {Error} If packageId is missing or Firestore operation fails
 * 
 * @example
 * await updatePackage('pkg_1234567890_abc123', {
 *   name: 'Updated Package Name',
 *   description: 'New description'
 * });
 */
export const updatePackage = async (packageId, updates) => {
  if (!packageId) {
    throw new Error('Package ID is required');
  }
  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates must be an object');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    
    // Check if package exists
    const packageSnap = await getDoc(packageRef);
    if (!packageSnap.exists()) {
      throw new Error('Package does not exist');
    }

    // Prepare update data with timestamp
    // Don't allow updating packageId, createdAt, or stats directly
    const { packageId: _, createdAt, stats, ...allowedUpdates } = updates;
    const updateData = {
      ...allowedUpdates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(packageRef, updateData);
    logger.log('[updatePackage] Package updated successfully:', packageId);
  } catch (error) {
    logger.error('[updatePackage] Error updating package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Deletes a package from Firestore
 * 
 * @param {string} packageId - The package ID
 * @returns {Promise<void>}
 * @throws {Error} If packageId is missing or Firestore operation fails
 * 
 * @example
 * await deletePackage('pkg_1234567890_abc123');
 */
export const deletePackage = async (packageId) => {
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    
    // Check if package exists
    const packageSnap = await getDoc(packageRef);
    if (!packageSnap.exists()) {
      throw new Error('Package does not exist');
    }

    await deleteDoc(packageRef);
    logger.log('[deletePackage] Package deleted successfully:', packageId);
  } catch (error) {
    logger.error('[deletePackage] Error deleting package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Publishes a package (changes status to 'published')
 * 
 * @param {string} packageId - The package ID
 * @returns {Promise<void>}
 * @throws {Error} If packageId is missing or Firestore operation fails
 * 
 * @example
 * await publishPackage('pkg_1234567890_abc123');
 */
export const publishPackage = async (packageId) => {
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    
    // Check if package exists
    const packageSnap = await getDoc(packageRef);
    if (!packageSnap.exists()) {
      throw new Error('Package does not exist');
    }

    const packageData = packageSnap.data();
    const publishedAt = packageData.status === 'published' 
      ? packageData.publishedAt 
      : serverTimestamp();

    await updateDoc(packageRef, {
      status: 'published',
      publishedAt,
      updatedAt: serverTimestamp(),
    });
    
    // Track achievement for the creator
    if (packageData.author && packageData.author.userId) {
      const { trackPackagePublished } = await import('./utils/engagementService');
      trackPackagePublished(packageData.author.userId).catch(err => {
        logger.warn('[publishPackage] Error tracking achievement:', err);
      });
    }
    
    logger.log('[publishPackage] Package published successfully:', packageId);
  } catch (error) {
    logger.error('[publishPackage] Error publishing package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Gets all published packages from the marketplace with optional filters
 * 
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.category] - Filter by category
 * @param {string} [filters.license] - Filter by license
 * @param {number} [filters.maxPrice] - Maximum price in cents
 * @param {number} [filters.minRating] - Minimum rating (0-5)
 * @param {string} [filters.sortBy] - Sort field ('downloads', 'rating', 'createdAt', 'publishedAt')
 * @param {string} [filters.sortOrder] - Sort order ('asc' or 'desc', default: 'desc')
 * @param {number} [filters.limit] - Maximum number of results (default: 50)
 * @returns {Promise<Array<Package>>} Array of packages
 * @throws {Error} If Firestore operation fails
 * 
 * @example
 * const packages = await getAllPackages({
 *   category: 'Photography',
 *   sortBy: 'downloads',
 *   limit: 20
 * });
 */
export const getAllPackages = async (filters = {}) => {
  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packagesRef = collection(db, PACKAGES_COLLECTION);
    let q = query(packagesRef, where('status', '==', 'published'));

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.license) {
      q = query(q, where('license', '==', filters.license));
    }
    if (filters.maxPrice !== undefined) {
      q = query(q, where('price', '<=', filters.maxPrice));
    }
    if (filters.minRating !== undefined) {
      q = query(q, where('stats.rating', '>=', filters.minRating));
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'publishedAt';
    const sortOrder = filters.sortOrder || 'desc';
    q = query(q, orderBy(sortBy === 'downloads' ? 'stats.downloads' : 
                          sortBy === 'rating' ? 'stats.rating' : 
                          sortBy === 'stars' ? 'stats.stars' :
                          sortBy, sortOrder));

    // Apply limit
    const resultLimit = filters.limit || 50;
    q = query(q, limit(resultLimit));

    const querySnapshot = await getDocs(q);
    const packages = [];
    
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    logger.log('[getAllPackages] Retrieved', packages.length, 'packages');
    return packages;
  } catch (error) {
    logger.error('[getAllPackages] Error getting packages:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Gets all packages created by a specific user
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Array<Package>>} Array of packages
 * @throws {Error} If userId is missing or Firestore operation fails
 * 
 * @example
 * const myPackages = await getUserPackages('user123');
 */
export const getUserPackages = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packagesRef = collection(db, PACKAGES_COLLECTION);
    const q = query(
      packagesRef,
      where('author.userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const packages = [];
    
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    logger.log('[getUserPackages] Retrieved', packages.length, 'packages for user:', userId);
    return packages;
  } catch (error) {
    logger.error('[getUserPackages] Error getting user packages:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Searches packages by name or tags
 * 
 * Note: Firestore doesn't support full-text search natively.
 * This function performs a prefix search on the name field and checks tags.
 * For better search, consider using Algolia or similar service.
 * 
 * @param {string} searchTerm - Search term
 * @param {Object} [options] - Search options
 * @param {number} [options.limit] - Maximum number of results (default: 20)
 * @returns {Promise<Array<Package>>} Array of matching packages
 * @throws {Error} If searchTerm is missing or Firestore operation fails
 * 
 * @example
 * const results = await searchPackages('portrait');
 */
export const searchPackages = async (searchTerm, options = {}) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    throw new Error('Search term is required and must be a string');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packagesRef = collection(db, PACKAGES_COLLECTION);
    const resultLimit = options.limit || 20;
    
    // Get all published packages (we'll filter in memory for search)
    // Note: For production, consider using Algolia or similar for full-text search
    let q = query(
      packagesRef,
      where('status', '==', 'published'),
      orderBy('stats.downloads', 'desc'),
      limit(1000) // Get more results to filter, adjust based on your needs
    );

    const querySnapshot = await getDocs(q);
    const searchLower = searchTerm.toLowerCase();

    // PERFORMANCE OPTIMIZATION: Pre-calculate scores to avoid O(n²) during sort
    // Calculate relevance score: name=3, description=2, tags=1
    const calculateRelevanceScore = (data) => {
      let score = 0;
      if (data.name?.toLowerCase().includes(searchLower)) score += 3;
      if (data.description?.toLowerCase().includes(searchLower)) score += 2;
      if (data.tags?.some(tag => tag.toLowerCase().includes(searchLower))) score += 1;
      return score;
    };

    // Build packages array with pre-calculated scores
    const packagesWithScores = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const score = calculateRelevanceScore(data);

      // Only include packages that match
      if (score > 0) {
        packagesWithScores.push({
          id: doc.id,
          ...data,
          _searchScore: score, // Temporary field for sorting
        });
      }
    });

    // Sort by pre-calculated scores (O(n log n) instead of O(n²))
    packagesWithScores.sort((a, b) => b._searchScore - a._searchScore);

    // Remove temporary score field and limit results
    const results = packagesWithScores.slice(0, resultLimit).map(({ _searchScore, ...pkg }) => pkg);
    logger.log('[searchPackages] Found', results.length, 'packages matching:', searchTerm);
    return results;
  } catch (error) {
    logger.error('[searchPackages] Error searching packages:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Installs a package for a user (tracks installation)
 * This adds the package to the user's installedPackages array in their profile
 * and increments the package's download count.
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} packageId - The package ID to install
 * @returns {Promise<void>}
 * @throws {Error} If userId or packageId is missing
 * 
 * @example
 * await installPackage('user123', 'pkg_1234567890_abc123');
 */
export const installPackage = async (userId, packageId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  try {
    // Check if package exists
    const packageData = await getPackage(packageId);
    if (!packageData) {
      throw new Error('Package not found');
    }

    // Check if already installed by getting user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User profile does not exist');
    }

    const installedPackages = userProfile.installedPackages || [];
    if (installedPackages.includes(packageId)) {
      logger.log('[installPackage] Package already installed:', packageId);
      throw new Error('Package already installed');
    }

    // Add package to user's installedPackages in Firestore
    await firestoreInstallPackage(userId, packageId);

    // Increment download count
    await incrementDownloads(packageId);
    logger.log('[installPackage] Package installed successfully:', packageId);
  } catch (error) {
    logger.error('[installPackage] Error installing package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Increments the download count for a package
 * 
 * @param {string} packageId - The package ID
 * @returns {Promise<void>}
 * @throws {Error} If packageId is missing or Firestore operation fails
 * 
 * @example
 * await incrementDownloads('pkg_1234567890_abc123');
 */
export const incrementDownloads = async (packageId) => {
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    
    // Check if package exists
    const packageSnap = await getDoc(packageRef);
    if (!packageSnap.exists()) {
      throw new Error('Package does not exist');
    }

    await updateDoc(packageRef, {
      'stats.downloads': increment(1),
      updatedAt: serverTimestamp(),
    });
    logger.log('[incrementDownloads] Download count incremented for package:', packageId);
  } catch (error) {
    logger.error('[incrementDownloads] Error incrementing downloads:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Stars/favorites a package for a user
 * Increments the package's star count and adds to user's starred packages
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} packageId - The package ID to star
 * @returns {Promise<void>}
 * @throws {Error} If userId or packageId is missing
 * 
 * @example
 * await starPackage('user123', 'pkg_1234567890_abc123');
 */
export const starPackage = async (userId, packageId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    
    // Check if package exists
    const packageSnap = await getDoc(packageRef);
    if (!packageSnap.exists()) {
      throw new Error('Package does not exist');
    }

    // Update user's starred packages in their profile
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist');
    }

    const userData = userSnap.data();
    const starredPackages = userData.starredPackages || [];

    // Check if already starred
    if (starredPackages.includes(packageId)) {
      logger.log('[starPackage] Package already starred:', packageId);
      return;
    }

    // Add to user's starred packages
    await updateDoc(userRef, {
      starredPackages: [...starredPackages, packageId],
      updatedAt: serverTimestamp(),
    });

    // Increment package star count
    await updateDoc(packageRef, {
      'stats.stars': increment(1),
      updatedAt: serverTimestamp(),
    });

    logger.log('[starPackage] Package starred successfully:', packageId);
  } catch (error) {
    logger.error('[starPackage] Error starring package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Unstars/unfavorites a package for a user
 * Decrements the package's star count and removes from user's starred packages
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} packageId - The package ID to unstar
 * @returns {Promise<void>}
 * @throws {Error} If userId or packageId is missing
 * 
 * @example
 * await unstarPackage('user123', 'pkg_1234567890_abc123');
 */
export const unstarPackage = async (userId, packageId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!packageId) {
    throw new Error('Package ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packageRef = doc(db, PACKAGES_COLLECTION, packageId);
    
    // Check if package exists
    const packageSnap = await getDoc(packageRef);
    if (!packageSnap.exists()) {
      throw new Error('Package does not exist');
    }

    // Update user's starred packages in their profile
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist');
    }

    const userData = userSnap.data();
    const starredPackages = userData.starredPackages || [];

    // Check if not starred
    if (!starredPackages.includes(packageId)) {
      logger.log('[unstarPackage] Package not starred:', packageId);
      return;
    }

    // Remove from user's starred packages
    await updateDoc(userRef, {
      starredPackages: starredPackages.filter(id => id !== packageId),
      updatedAt: serverTimestamp(),
    });

    // Decrement package star count (don't go below 0)
    const currentStars = packageSnap.data().stats?.stars || 0;
    if (currentStars > 0) {
      await updateDoc(packageRef, {
        'stats.stars': increment(-1),
        updatedAt: serverTimestamp(),
      });
    }

    logger.log('[unstarPackage] Package unstarred successfully:', packageId);
  } catch (error) {
    logger.error('[unstarPackage] Error unstarring package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Checks if a user has starred a specific package
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} packageId - The package ID to check
 * @returns {Promise<boolean>} True if the user has starred the package
 * @throws {Error} If userId or packageId is missing
 * 
 * @example
 * const isStarred = await checkIfStarred('user123', 'pkg_1234567890_abc123');
 */
export const checkIfStarred = async (userId, packageId) => {
  if (!userId || !packageId) {
    return false;
  }

  if (!db) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();
    const starredPackages = userData.starredPackages || [];
    return starredPackages.includes(packageId);
  } catch (error) {
    logger.error('[checkIfStarred] Error checking if starred:', error);
    return false;
  }
};

/**
 * Gets all user's starred package IDs
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Array<string>>} Array of starred package IDs
 * @throws {Error} If userId is missing
 * 
 * @example
 * const starredIds = await getUserStarredPackages('user123');
 */
export const getUserStarredPackages = async (userId) => {
  if (!userId) {
    return [];
  }

  if (!db) {
    return [];
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }

    const userData = userSnap.data();
    return userData.starredPackages || [];
  } catch (error) {
    logger.error('[getUserStarredPackages] Error getting starred packages:', error);
    return [];
  }
};

/**
 * Gets top packages sorted by star count
 * 
 * @param {Object} [options] - Options for the query
 * @param {number} [options.limit] - Maximum number of results (default: 20)
 * @returns {Promise<Array<Package>>} Array of packages sorted by stars (highest first)
 * @throws {Error} If Firestore operation fails
 * 
 * @example
 * const topPackages = await getTopStarredPackages({ limit: 10 });
 */
export const getTopStarredPackages = async (options = {}) => {
  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const packagesRef = collection(db, PACKAGES_COLLECTION);
    const resultLimit = options.limit || 20;
    
    // Query published packages sorted by stars
    const q = query(
      packagesRef,
      where('status', '==', 'published'),
      orderBy('stats.stars', 'desc'),
      limit(resultLimit)
    );

    const querySnapshot = await getDocs(q);
    const packages = [];
    
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    logger.log('[getTopStarredPackages] Retrieved', packages.length, 'top starred packages');
    return packages;
  } catch (error) {
    // If the query fails (possibly due to missing index), fall back to in-memory sorting
    logger.warn('[getTopStarredPackages] Index query failed, falling back to in-memory sort:', error.message);
    
    try {
      const packagesRef = collection(db, PACKAGES_COLLECTION);
      const q = query(
        packagesRef,
        where('status', '==', 'published'),
        limit(100) // Get more to sort in memory
      );

      const querySnapshot = await getDocs(q);
      const packages = [];
      
      querySnapshot.forEach((doc) => {
        packages.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort by stars in memory
      packages.sort((a, b) => {
        const starsA = a.stats?.stars || 0;
        const starsB = b.stats?.stars || 0;
        return starsB - starsA;
      });

      const resultLimit = options.limit || 20;
      const result = packages.slice(0, resultLimit);
      logger.log('[getTopStarredPackages] Retrieved', result.length, 'top starred packages (fallback)');
      return result;
    } catch (fallbackError) {
      logger.error('[getTopStarredPackages] Fallback also failed:', fallbackError);
      const friendlyMessage = getErrorMessage(fallbackError);
      throw new Error(friendlyMessage);
    }
  }
};

/**
 * FIRESTORE INDEXES REQUIRED
 * 
 * To use the query functions in this service, you need to create composite indexes
 * in Firebase Console. Go to Firestore Database > Indexes and create the following:
 * 
 * 1. For getAllPackages with category filter:
 *    Collection: packages
 *    Fields: status (Ascending), category (Ascending), [sort field] (Ascending/Descending)
 *    Query scope: Collection
 * 
 * 2. For getAllPackages with license filter:
 *    Collection: packages
 *    Fields: status (Ascending), license (Ascending), [sort field] (Ascending/Descending)
 *    Query scope: Collection
 * 
 * 3. For getAllPackages with price filter:
 *    Collection: packages
 *    Fields: status (Ascending), price (Ascending), [sort field] (Ascending/Descending)
 *    Query scope: Collection
 * 
 * 4. For getAllPackages with rating filter:
 *    Collection: packages
 *    Fields: status (Ascending), stats.rating (Ascending), [sort field] (Ascending/Descending)
 *    Query scope: Collection
 * 
 * 5. For getUserPackages:
 *    Collection: packages
 *    Fields: author.userId (Ascending), createdAt (Descending)
 *    Query scope: Collection
 * 
 * 6. For getAllPackages with multiple filters (if combining filters):
 *    You may need additional composite indexes for combinations like:
 *    - status + category + price + stats.downloads
 *    - status + category + stats.rating + stats.downloads
 *    etc.
 * 
 * Note: Firebase will automatically suggest creating these indexes when you first
 * run a query that requires them. You can also create them manually in the
 * Firebase Console under Firestore > Indexes.
 * 
 * For production, consider:
 * - Using Algolia or similar for full-text search instead of in-memory filtering
 * - Adding pagination with startAfter for getAllPackages
 * - Adding caching for frequently accessed packages
 * - Implementing rate limiting for incrementDownloads
 */

