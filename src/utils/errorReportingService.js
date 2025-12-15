/**
 * Error Reporting Service
 * 
 * Stores error details (including Request IDs) in Firestore for user debugging
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { logger } from './logger.js';

const ERROR_REPORTS_COLLECTION = 'errorReports';

/**
 * Reports an error to the user's account for debugging
 * 
 * @param {string} userId - User ID
 * @param {Error|Object|string} error - The error object or message
 * @param {Object} context - Additional context about where the error occurred
 * @param {string} [context.endpoint] - API endpoint where error occurred
 * @param {string} [context.component] - Component name where error occurred
 * @param {string} [context.action] - Action being performed when error occurred
 * @param {Object} [context.metadata] - Additional metadata
 * @returns {Promise<string>} The ID of the created error report
 */
export const reportError = async (userId, error, context = {}) => {
  if (!userId || !error) {
    logger.warn('[errorReportingService] Cannot report error: missing userId or error');
    return null;
  }

  if (!db) {
    logger.warn('[errorReportingService] Firestore not initialized, cannot report error');
    return null;
  }

  try {
    // Extract error details
    let errorMessage = '';
    let errorCode = '';
    let errorStack = '';
    let requestId = null;
    let statusCode = null;
    let errorType = 'unknown';

    if (typeof error === 'string') {
      errorMessage = error;
      errorType = 'string';
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || error.error?.message || JSON.stringify(error);
      errorCode = error.code || '';
      errorStack = error.stack || '';
      statusCode = error.status || error.statusCode || null;
      
      // Extract Request ID from various possible locations
      requestId = error.request_id || 
                  error.headers?.['x-request-id'] || 
                  error.requestId ||
                  (errorMessage.match(/Request ID:\s*([a-f0-9-]{36})/i)?.[1]) ||
                  (errorMessage.match(/\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/i)?.[1]);
      
      // Determine error type
      if (error.code?.startsWith('auth/')) {
        errorType = 'authentication';
      } else if (error.code?.startsWith('firestore/') || error.code?.startsWith('storage/')) {
        errorType = 'firebase';
      } else if (error.status === 429 || errorMessage.includes('rate limit')) {
        errorType = 'rate_limit';
      } else if (error.status === 400 || errorMessage.includes('content policy')) {
        errorType = 'content_policy';
      } else if (error.status === 402 || errorMessage.includes('credits')) {
        errorType = 'credits';
      } else if (error.status === 500 || error.status === 502 || error.status === 503) {
        errorType = 'server_error';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'network';
      } else {
        errorType = 'api_error';
      }
    }

    // Create error report document
    const errorReport = {
      userId,
      errorType,
      errorMessage,
      errorCode: errorCode || null,
      requestId: requestId || null,
      statusCode,
      stack: errorStack || null,
      context: {
        endpoint: context.endpoint || null,
        component: context.component || null,
        action: context.action || null,
        metadata: context.metadata || null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null,
      },
      createdAt: serverTimestamp(),
      resolved: false,
    };

    const docRef = await addDoc(collection(db, ERROR_REPORTS_COLLECTION), errorReport);
    
    logger.log('[errorReportingService] Error reported successfully:', {
      reportId: docRef.id,
      userId,
      errorType,
      requestId,
    });

    return docRef.id;
  } catch (reportingError) {
    // Don't throw - error reporting should never break the app
    logger.error('[errorReportingService] Failed to report error:', reportingError);
    return null;
  }
};

/**
 * Gets error reports for a user
 * 
 * @param {string} userId - User ID
 * @param {number} [limitCount=50] - Maximum number of reports to retrieve
 * @returns {Promise<Array>} Array of error reports
 */
export const getUserErrorReports = async (userId, limitCount = 50) => {
  if (!userId || !db) {
    return [];
  }

  try {
    const reportsQuery = query(
      collection(db, ERROR_REPORTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(reportsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    logger.error('[errorReportingService] Error fetching error reports:', error);
    return [];
  }
};

/**
 * Marks an error report as resolved
 * 
 * @param {string} reportId - Error report ID
 * @returns {Promise<void>}
 */
export const markErrorReportResolved = async (reportId) => {
  if (!reportId || !db) {
    return;
  }

  try {
    const { updateDoc, doc } = await import('firebase/firestore');
    const reportRef = doc(db, ERROR_REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
      resolved: true,
      resolvedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('[errorReportingService] Error marking report as resolved:', error);
  }
};

