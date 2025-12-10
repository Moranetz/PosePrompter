/**
 * CreditBalance - Displays user's current credit balance
 * 
 * Shows credits in the header with a button to open the buy credits modal.
 */

import React, { useState, useEffect } from 'react';
import { Gem, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { getUserProfile } from '../firestoreService';
import BuyCreditsModal from './BuyCreditsModal';

const CreditBalance = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Fetch user's credit balance
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.uid) {
        setCredits(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserProfile(user.uid);
        setCredits(profile?.credits || 0);
      } catch (error) {
        console.error('[CreditBalance] Error fetching credits:', error);
        setCredits(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();

    // Refresh credits periodically (every 30 seconds)
    const interval = setInterval(fetchCredits, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle successful purchase
  const handlePurchaseSuccess = (data) => {
    if (data && data.creditBalance !== undefined) {
      setCredits(data.creditBalance);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowBuyModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }}
      >
        <Gem size={16} style={{ color: '#fbbf24' }} />
        <span>Get gems</span>
      </button>

      <BuyCreditsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </>
  );
};

export default CreditBalance;

