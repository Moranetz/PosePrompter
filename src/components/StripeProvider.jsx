/**
 * StripeProvider - Wraps the app with Stripe context
 * 
 * This component loads Stripe with the publishable key and provides
 * Stripe Elements context to child components.
 */

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load Stripe publishable key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

/**
 * StripeProvider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that need Stripe context
 */
const StripeProvider = ({ children }) => {
  // Check if Stripe key is configured
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    console.warn(
      '[StripeProvider] VITE_STRIPE_PUBLISHABLE_KEY not found in environment variables. ' +
      'Stripe payments will not work. Please add it to your .env.local file.'
    );
  }

  // Elements wrapper - doesn't need clientSecret or mode at this level
  // The actual clientSecret will be provided in nested Elements in BuyCreditsModal
  // We just provide the Stripe instance and appearance settings
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#8b5cf6',
            colorBackground: '#12121a',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeProvider;

