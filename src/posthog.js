import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export function initPostHog() {
  if (!POSTHOG_KEY) {
    console.warn('[PostHog] No API key found — skipping initialization');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    capture_performance: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        console.log('[PostHog] Initialized', ph.get_distinct_id());
      }
    },
  });
}

export function identifyUser(userId, properties = {}) {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

export function trackEvent(event, properties = {}) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export { posthog };
