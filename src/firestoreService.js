/**
 * Firestore Service for User Data Management
 * 
 * This service provides CRUD operations for user profiles and related data
 * including custom options, hidden/deleted options, saved prompt sets, and installed packages.
 * 
 * @module firestoreService
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase-config';
import { getErrorMessage } from './utils/errorHandler';
import { logger } from './utils/logger.js';

// Collection name for users
const USERS_COLLECTION = 'users';

/**
 * @typedef {Object} UserProfile
 * @property {string} displayName - User's display name
 * @property {string} avatar - URL to user's avatar image
 * @property {string} bio - User's bio/description
 * @property {Object.<string, Array>} customOptions - Custom prompts by category
 * @property {Object.<string, Array<string>>} hiddenOptions - Hidden option IDs by category
 * @property {Object.<string, Array<string>>} deletedOptions - Permanently deleted option IDs by category
 * @property {Array<PromptSet>} savedPromptSets - Array of saved prompt configurations
 * @property {Array<string>} installedPackages - Array of installed package IDs
 * @property {Array<string>} starredPackages - Array of starred/favorited package IDs
 * @property {Timestamp} createdAt - Timestamp when profile was created
 * @property {Timestamp} updatedAt - Timestamp when profile was last updated
 */

/**
 * @typedef {Object} PromptSet
 * @property {string} id - Unique identifier for the prompt set
 * @property {string} name - Name of the saved prompt set
 * @property {string} description - Optional description
 * @property {Object.<string, number>} selections - Category selections (category -> index)
 * @property {Object.<string, boolean>} includedCategories - Which categories are included
 * @property {string} generatedPrompt - The full generated prompt text
 * @property {Timestamp} createdAt - When the set was created
 * @property {Timestamp} updatedAt - When the set was last updated
 */

/**
 * @typedef {Object} CustomOption
 * @property {string} id - Unique identifier for the custom option
 * @property {string} text - The custom prompt text
 * @property {string} title - Optional title for the option
 * @property {Timestamp} createdAt - When the option was created
 */

/**
 * Creates a new user profile in Firestore
 * 
 * @param {string} userId - The user's unique ID (typically from Firebase Auth)
 * @param {Object} userData - Initial user data
 * @param {string} [userData.displayName] - User's display name
 * @param {string} [userData.avatar] - URL to user's avatar
 * @param {string} [userData.bio] - User's bio
 * @returns {Promise<void>}
 * @throws {Error} If userId is missing or Firestore operation fails
 * 
 * @example
 * await createUserProfile('user123', {
 *   displayName: 'John Doe',
 *   avatar: 'https://example.com/avatar.jpg',
 *   bio: 'Photography enthusiast'
 * });
 */
export const createUserProfile = async (userId, userData = {}) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      throw new Error('User profile already exists. Use updateUserProfile instead.');
    }

    const profileData = {
      displayName: userData.displayName || '',
      avatar: userData.avatar || '',
      bio: userData.bio || '',
      credits: userData.credits || 0,
      customOptions: {},
      hiddenOptions: {},
      deletedOptions: {},
      savedPromptSets: [],
      installedPackages: [],
      starredPackages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, profileData);
    logger.log('[createUserProfile] User profile created successfully:', userId);
  } catch (error) {
    logger.error('[createUserProfile] Error creating user profile:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Retrieves a user's complete profile from Firestore
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<UserProfile|null>} User profile data or null if not found
 * @throws {Error} If userId is missing or Firestore operation fails
 * 
 * @example
 * const profile = await getUserProfile('user123');
 * if (profile) {
 *   console.log(profile.displayName);
 * }
 */
export const getUserProfile = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const profile = {
      id: userSnap.id,
      ...userSnap.data(),
    };
    logger.log('[getUserProfile] Profile retrieved:', userId, profile ? 'exists' : 'not found');
    return profile;
  } catch (error) {
    logger.error('[getUserProfile] Error getting user profile:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Updates user profile data in Firestore
 * 
 * @param {string} userId - The user's unique ID
 * @param {Object} updates - Fields to update (partial UserProfile)
 * @param {string} [updates.displayName] - Updated display name
 * @param {string} [updates.avatar] - Updated avatar URL
 * @param {string} [updates.bio] - Updated bio
 * @returns {Promise<void>}
 * @throws {Error} If userId is missing or Firestore operation fails
 * 
 * @example
 * await updateUserProfile('user123', {
 *   displayName: 'Jane Doe',
 *   bio: 'Updated bio text'
 * });
 */
export const updateUserProfile = async (userId, updates) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates must be an object');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    // Prepare update data with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    logger.log('[updateUserProfile] User profile updated successfully:', userId);
  } catch (error) {
    logger.error('[updateUserProfile] Error updating user profile:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Adds a custom option to a specific category
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} category - The category name (e.g., 'Aesthetic', 'BodyPose')
 * @param {string} optionText - The custom prompt text
 * @param {string} [title] - Optional title for the option
 * @returns {Promise<string>} The ID of the created custom option
 * @throws {Error} If userId, category, or optionText is missing
 * 
 * @example
 * const optionId = await saveCustomOption('user123', 'Aesthetic', 'A beautiful sunset scene');
 */
export const saveCustomOption = async (userId, category, optionText, title = '') => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!category) {
    throw new Error('Category is required');
  }
  if (!optionText || typeof optionText !== 'string') {
    throw new Error('Option text is required and must be a string');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    // Generate unique ID for the custom option
    const optionId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const customOption = {
      id: optionId,
      text: optionText,
      title: title || '',
      createdAt: serverTimestamp(),
    };

    // Get current customOptions or initialize empty object
    const currentData = userSnap.data();
    const customOptions = currentData.customOptions || {};
    const categoryOptions = customOptions[category] || [];

    // Add new option to category array
    const updatedCategoryOptions = [...categoryOptions, customOption];

    // Update the document
    await updateDoc(userRef, {
      customOptions: {
        ...customOptions,
        [category]: updatedCategoryOptions,
      },
      updatedAt: serverTimestamp(),
    });

    logger.log('[saveCustomOption] Custom option saved successfully:', optionId, category);
    return optionId;
  } catch (error) {
    logger.error('[saveCustomOption] Error saving custom option:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Hides an option by adding its ID to the hiddenOptions array for the category
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} category - The category name
 * @param {string} optionId - The ID of the option to hide
 * @returns {Promise<void>}
 * @throws {Error} If userId, category, or optionId is missing
 * 
 * @example
 * await hideOption('user123', 'Aesthetic', 'aesthetic_001');
 */
export const hideOption = async (userId, category, optionId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!category) {
    throw new Error('Category is required');
  }
  if (!optionId) {
    throw new Error('Option ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    const currentData = userSnap.data();
    const hiddenOptions = currentData.hiddenOptions || {};
    const categoryHidden = hiddenOptions[category] || [];

    // Check if already hidden
    if (categoryHidden.includes(optionId)) {
      return; // Already hidden, no need to update
    }

    // Add to hidden options
    await updateDoc(userRef, {
      hiddenOptions: {
        ...hiddenOptions,
        [category]: [...categoryHidden, optionId],
      },
      updatedAt: serverTimestamp(),
    });
    logger.log('[hideOption] Option hidden successfully:', optionId, category);
  } catch (error) {
    logger.error('[hideOption] Error hiding option:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Permanently deletes an option by adding its ID to the deletedOptions array
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} category - The category name
 * @param {string} optionId - The ID of the option to delete
 * @returns {Promise<void>}
 * @throws {Error} If userId, category, or optionId is missing
 * 
 * @example
 * await deleteOption('user123', 'Aesthetic', 'aesthetic_001');
 */
export const deleteOption = async (userId, category, optionId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!category) {
    throw new Error('Category is required');
  }
  if (!optionId) {
    throw new Error('Option ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    const currentData = userSnap.data();
    const deletedOptions = currentData.deletedOptions || {};
    const categoryDeleted = deletedOptions[category] || [];

    // Check if already deleted
    if (categoryDeleted.includes(optionId)) {
      return; // Already deleted, no need to update
    }

    // Add to deleted options
    await updateDoc(userRef, {
      deletedOptions: {
        ...deletedOptions,
        [category]: [...categoryDeleted, optionId],
      },
      updatedAt: serverTimestamp(),
    });
    logger.log('[deleteOption] Option deleted successfully:', optionId, category);
  } catch (error) {
    logger.error('[deleteOption] Error deleting option:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Saves a prompt set configuration
 * 
 * @param {string} userId - The user's unique ID
 * @param {Object} setData - The prompt set data
 * @param {string} setData.name - Name of the prompt set
 * @param {string} [setData.description] - Optional description
 * @param {Object.<string, number>} setData.selections - Category selections
 * @param {Object.<string, boolean>} setData.includedCategories - Included categories
 * @param {string} setData.generatedPrompt - The full generated prompt
 * @returns {Promise<string>} The ID of the saved prompt set
 * @throws {Error} If userId or required setData fields are missing
 * 
 * @example
 * const setId = await savePromptSet('user123', {
 *   name: 'My Favorite Setup',
 *   description: 'Perfect for portraits',
 *   selections: { Aesthetic: 0, BodyPose: 2 },
 *   includedCategories: { Aesthetic: true, BodyPose: true },
 *   generatedPrompt: 'Full prompt text here...'
 * });
 */
export const savePromptSet = async (userId, setData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!setData || typeof setData !== 'object') {
    throw new Error('Set data is required and must be an object');
  }
  if (!setData.name) {
    throw new Error('Prompt set name is required');
  }
  if (!setData.selections || typeof setData.selections !== 'object') {
    throw new Error('Selections object is required');
  }
  if (!setData.generatedPrompt) {
    throw new Error('Generated prompt is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    // Generate unique ID for the prompt set
    const setId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const promptSet = {
      id: setId,
      name: setData.name,
      description: setData.description || '',
      selections: setData.selections,
      includedCategories: setData.includedCategories || {},
      generatedPrompt: setData.generatedPrompt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Get current savedPromptSets array
    const currentData = userSnap.data();
    const savedPromptSets = currentData.savedPromptSets || [];

    // Add new prompt set
    await updateDoc(userRef, {
      savedPromptSets: [...savedPromptSets, promptSet],
      updatedAt: serverTimestamp(),
    });

    logger.log('[savePromptSet] Prompt set saved successfully:', setId);
    return setId;
  } catch (error) {
    logger.error('[savePromptSet] Error saving prompt set:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Retrieves all saved prompt sets for a user
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Array<PromptSet>>} Array of saved prompt sets
 * @throws {Error} If userId is missing or Firestore operation fails
 * 
 * @example
 * const sets = await getSavedPromptSets('user123');
 * sets.forEach(set => console.log(set.name));
 */
export const getSavedPromptSets = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return [];
    }

    const userData = userSnap.data();
    const sets = userData.savedPromptSets || [];
    logger.log('[getSavedPromptSets] Retrieved', sets.length, 'prompt sets for user:', userId);
    return sets;
  } catch (error) {
    logger.error('[getSavedPromptSets] Error getting saved prompt sets:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Deletes a saved prompt set by its ID
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} setId - The ID of the prompt set to delete
 * @returns {Promise<void>}
 * @throws {Error} If userId or setId is missing
 * 
 * @example
 * await deletePromptSet('user123', 'set_1234567890_abc123');
 */
export const deletePromptSet = async (userId, setId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!setId) {
    throw new Error('Set ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist.');
    }

    const currentData = userSnap.data();
    const savedPromptSets = currentData.savedPromptSets || [];

    // Filter out the set to delete
    const updatedSets = savedPromptSets.filter(set => set.id !== setId);

    // Check if set was found
    if (updatedSets.length === savedPromptSets.length) {
      throw new Error('Prompt set not found');
    }

    await updateDoc(userRef, {
      savedPromptSets: updatedSets,
      updatedAt: serverTimestamp(),
    });
    logger.log('[deletePromptSet] Prompt set deleted successfully:', setId);
  } catch (error) {
    logger.error('[deletePromptSet] Error deleting prompt set:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Adds an installed package to the user's profile
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} packageId - The ID of the package to install
 * @returns {Promise<void>}
 * @throws {Error} If userId or packageId is missing
 * 
 * @example
 * await installPackage('user123', 'package_001');
 */
export const installPackage = async (userId, packageId) => {
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
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    const currentData = userSnap.data();
    const installedPackages = currentData.installedPackages || [];

    // Check if already installed
    if (installedPackages.includes(packageId)) {
      return; // Already installed
    }

    await updateDoc(userRef, {
      installedPackages: [...installedPackages, packageId],
      updatedAt: serverTimestamp(),
    });
    logger.log('[installPackage] Package installed successfully:', packageId);
  } catch (error) {
    logger.error('[installPackage] Error installing package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Installs a package with merge mode support
 * 
 * @param {string} userId - The user's unique ID
 * @param {Object} packageData - Package data to install
 * @param {string} packageData.packageId - Package ID
 * @param {string} packageData.name - Package name
 * @param {string} packageData.version - Package version
 * @param {Object.<string, Array<string>>} packageData.options - Package options by category
 * @param {string} mergeMode - Merge mode: 'add', 'replace', or 'new'
 * @returns {Promise<void>}
 * @throws {Error} If userId, packageData, or mergeMode is missing
 * 
 * @example
 * await installPackageWithMerge('user123', {
 *   packageId: 'pkg_123',
 *   name: 'Portrait Pack',
 *   version: '1.0.0',
 *   options: { Aesthetic: ['Option 1', 'Option 2'] }
 * }, 'add');
 */
export const installPackageWithMerge = async (userId, packageData, mergeMode = 'add') => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!packageData || !packageData.packageId) {
    throw new Error('Package data is required');
  }
  if (!['add', 'replace', 'new'].includes(mergeMode)) {
    throw new Error('Merge mode must be "add", "replace", or "new"');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist. Create it first with createUserProfile.');
    }

    const currentData = userSnap.data();
    const currentCustomOptions = currentData.customOptions || {};
    const currentHiddenOptions = currentData.hiddenOptions || {};
    const currentDeletedOptions = currentData.deletedOptions || {};
    const installedPackages = currentData.installedPackages || [];
    const installedPackageVersions = currentData.installedPackageVersions || {};

    // Check if already installed
    if (installedPackages.includes(packageData.packageId)) {
      // Check for version update
      const currentVersion = installedPackageVersions[packageData.packageId];
      if (currentVersion !== packageData.version) {
        // Version update - reinstall with same merge mode
        // For now, we'll just update the version. Full reinstall would require tracking original merge mode
        await updateDoc(userRef, {
          [`installedPackageVersions.${packageData.packageId}`]: packageData.version,
          updatedAt: serverTimestamp(),
        });
        return { updated: true, versionChanged: true };
      }
      return { updated: false, alreadyInstalled: true };
    }

    // Convert package options to custom options format with attribution
    const packageOptions = {};
    Object.keys(packageData.options || {}).forEach(category => {
      const packageCategoryOptions = packageData.options[category] || [];
      packageOptions[category] = packageCategoryOptions.map((optionText, index) => {
        // Handle both string and object formats
        if (typeof optionText === 'string') {
          return {
            id: `pkg_${packageData.packageId}_${category}_${index}`,
            title: optionText.substring(0, 50) || 'Package Option',
            prompt: optionText,
            packageId: packageData.packageId,
            packageName: packageData.name,
            packageVersion: packageData.version,
            createdAt: serverTimestamp(),
          };
        } else {
          // Already an object, just add attribution
          return {
            ...optionText,
            id: optionText.id || `pkg_${packageData.packageId}_${category}_${index}`,
            packageId: packageData.packageId,
            packageName: packageData.name,
            packageVersion: packageData.version,
          };
        }
      });
    });

    let updatedCustomOptions = { ...currentCustomOptions };

    // Apply merge mode
    if (mergeMode === 'add') {
      // Add package options to existing options
      Object.keys(packageOptions).forEach(category => {
        const existing = updatedCustomOptions[category] || [];
        updatedCustomOptions[category] = [...existing, ...packageOptions[category]];
      });
    } else if (mergeMode === 'replace') {
      // Replace existing options in matching categories
      Object.keys(packageOptions).forEach(category => {
        updatedCustomOptions[category] = packageOptions[category];
      });
    } else if (mergeMode === 'new') {
      // Create new profile - for now, we'll just add with special prefix
      // In a full implementation, you'd create a separate profile structure
      Object.keys(packageOptions).forEach(category => {
        const existing = updatedCustomOptions[category] || [];
        updatedCustomOptions[category] = [...existing, ...packageOptions[category]];
      });
    }

    // Restore hidden options that match package options
    // When a package is installed, unhide any options that were previously hidden
    // but are now being added by the package
    let updatedHiddenOptions = { ...currentHiddenOptions };
    Object.keys(packageOptions).forEach(category => {
      const packageOpts = packageOptions[category] || [];
      const hiddenInCategory = updatedHiddenOptions[category] || [];
      
      if (hiddenInCategory.length > 0 && packageOpts.length > 0) {
        // Check each package option to see if it matches a hidden option
        // Match by option text/content
        const restored = [];
        packageOpts.forEach(pkgOpt => {
          const optText = pkgOpt.text || pkgOpt;
          // Find matching hidden option by text
          const matchingHidden = hiddenInCategory.find(hidden => {
            // If hidden is an index, we can't match by text easily
            // If hidden is an ID, we'd need to check the original option
            // For now, we'll restore based on text matching
            return typeof hidden === 'string' && hidden.includes(optText);
          });
          
          if (matchingHidden) {
            restored.push(matchingHidden);
          }
        });
        
        // Remove restored options from hidden list
        if (restored.length > 0) {
          updatedHiddenOptions[category] = hiddenInCategory.filter(h => !restored.includes(h));
          // If all options restored, remove the category key
          if (updatedHiddenOptions[category].length === 0) {
            delete updatedHiddenOptions[category];
          }
        }
      }
    });

    // Restore deleted options that match package options
    // When a package is installed, restore any options that were previously trashed
    let updatedDeletedOptions = { ...currentDeletedOptions };
    Object.keys(packageOptions).forEach(category => {
      const packageOpts = packageOptions[category] || [];
      const deletedInCategory = updatedDeletedOptions[category] || [];
      
      if (deletedInCategory.length > 0 && packageOpts.length > 0) {
        // Check each package option to see if it matches a deleted option
        // Match by option ID (for custom options) or index (for default options)
        const restored = [];
        packageOpts.forEach(pkgOpt => {
          const pkgOptId = pkgOpt.id;
          // Check if this package option ID matches any deleted option
          const matchingDeleted = deletedInCategory.find(deleted => {
            // If deleted is an index (number), compare with package option index
            // If deleted is an ID (string), compare directly
            return deleted === pkgOptId || deleted === pkgOpt.id;
          });
          
          if (matchingDeleted) {
            restored.push(matchingDeleted);
          }
        });
        
        // Remove restored options from deleted list
        if (restored.length > 0) {
          updatedDeletedOptions[category] = deletedInCategory.filter(d => !restored.includes(d));
          // If all options restored, remove the category key
          if (updatedDeletedOptions[category].length === 0) {
            delete updatedDeletedOptions[category];
          }
        }
      }
    });

    // Update user document
    await updateDoc(userRef, {
      customOptions: updatedCustomOptions,
      hiddenOptions: updatedHiddenOptions,
      deletedOptions: updatedDeletedOptions,
      installedPackages: [...installedPackages, packageData.packageId],
      installedPackageVersions: {
        ...installedPackageVersions,
        [packageData.packageId]: packageData.version,
      },
      updatedAt: serverTimestamp(),
    });

    // Track achievement for the package creator
    if (packageData.packageId) {
      try {
        const { getPackage } = await import('./packageService');
        const pkg = await getPackage(packageData.packageId);
        if (pkg && pkg.author && pkg.author.userId) {
          const { trackPackageInstalled } = await import('./utils/engagementService');
          trackPackageInstalled(pkg.author.userId).catch(err => {
            logger.warn('[installPackageWithMerge] Error tracking achievement:', err);
          });
        }
      } catch (err) {
        logger.warn('[installPackageWithMerge] Error getting package for achievement tracking:', err);
      }
    }
    
    logger.log('[installPackageWithMerge] Package installed with merge successfully:', packageData.packageId, mergeMode);
    return { updated: true, installed: true };
  } catch (error) {
    logger.error('[installPackageWithMerge] Error installing package with merge:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Uninstalls a package and removes all its options
 * 
 * @param {string} userId - The user's unique ID
 * @param {string} packageId - The ID of the package to uninstall
 * @returns {Promise<void>}
 * @throws {Error} If userId or packageId is missing
 * 
 * @example
 * await uninstallPackage('user123', 'package_001');
 */
export const uninstallPackage = async (userId, packageId) => {
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
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist.');
    }

    const currentData = userSnap.data();
    const installedPackages = currentData.installedPackages || [];
    const installedPackageVersions = currentData.installedPackageVersions || {};
    const currentCustomOptions = currentData.customOptions || {};

    // Remove package options from customOptions
    const updatedCustomOptions = {};
    Object.keys(currentCustomOptions).forEach(category => {
      const categoryOptions = currentCustomOptions[category] || [];
      // Filter out options that belong to this package
      updatedCustomOptions[category] = categoryOptions.filter(option => {
        return option.packageId !== packageId;
      });
    });

    // Remove package from installed packages
    const updatedInstalledPackages = installedPackages.filter(id => id !== packageId);
    const updatedVersions = { ...installedPackageVersions };
    delete updatedVersions[packageId];

    // Check if package was found
    if (updatedInstalledPackages.length === installedPackages.length) {
      return; // Package not installed, nothing to do
    }

    // Update user document
    await updateDoc(userRef, {
      customOptions: updatedCustomOptions,
      installedPackages: updatedInstalledPackages,
      installedPackageVersions: updatedVersions,
      updatedAt: serverTimestamp(),
    });
    logger.log('[uninstallPackage] Package uninstalled successfully:', packageId);
  } catch (error) {
    logger.error('[uninstallPackage] Error uninstalling package:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Resets a user's Pose Prompter data while keeping the Firebase account.
 *
 * Used by the "Restart account" action to:
 * - Clear favorites
 * - Clear custom/hidden/deleted options
 * - Clear saved prompt sets and installed/starred packages
 *
 * Other profile fields (like displayName/bio) are preserved.
 *
 * @param {string} userId - The user's unique ID
 * @returns {Promise<void>}
 */
export const resetUserAccountData = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);

    // Use setDoc with merge so we don't wipe unrelated profile fields
    await setDoc(
      userRef,
      {
        favorites: {},
        customOptions: {},
        hiddenOptions: {},
        deletedOptions: {},
        savedPromptSets: [],
        installedPackages: [],
        starredPackages: [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    logger.log('[resetUserAccountData] User data reset successfully:', userId);
  } catch (error) {
    logger.error('[resetUserAccountData] Error resetting user data:', error);
    const friendlyMessage = getErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};
