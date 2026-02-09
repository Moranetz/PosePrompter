/**
 * Custom Hook: useCredits
 * 
 * Encapsulates credit/gem management logic
 * Provides balance, loading state, and credit operations
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '../utils/logger.js';
import { getGemBalance } from '../utils/paymentService.js';
import { useAuth } from '../contexts/UserContext.jsx';

export function useCredits() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load credit balance
   */
  const loadBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gems = await getGemBalance(user.uid);
      setBalance(gems);
      logger.log('[useCredits] Balance loaded:', gems);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load balance';
      setError(errorMessage);
      logger.error('[useCredits] Error loading balance:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Refresh balance (force reload)
   */
  const refreshBalance = useCallback(async () => {
    await loadBalance();
  }, [loadBalance]);

  // Load balance on mount and when user changes
  useEffect(() => {
    if (user) {
      loadBalance();
    } else {
      setBalance(0);
    }
  }, [user, loadBalance]);

  return {
    balance,
    loading,
    error,
    loadBalance,
    refreshBalance,
  };
}

