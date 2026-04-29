import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { initPostHog } from './posthog.js';

// Initialize PostHog before app mount
initPostHog();

// Import styles
import('./styles.css').catch(() => {});

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Fallback error display — should never happen in normal operation
  document.body.style.backgroundColor = '#0a0a0f';
  document.body.style.color = '#ffffff';
  document.body.innerHTML = '<div style="padding: 40px; text-align: center;"><h1>Something went wrong</h1><p>Please refresh the page or try again later.</p></div>';
}
