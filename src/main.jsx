import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Initialize app when DOM is ready
function initApp() {
  // CRITICAL: Show immediate feedback that script is loading
  console.log('🚀 main.jsx is loading...');
  console.log('📦 React version:', React.version);
  console.log('🌐 Window location:', window.location.href);
  console.log('📦 Document ready state:', document.readyState);

  // Set background immediately so user sees something
  if (document.body) {
    document.body.style.backgroundColor = '#0a0a0f';
    document.body.style.color = '#ffffff';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
  }

  // Show loading message immediately
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'initial-loading';
  loadingDiv.innerHTML = '<div style="padding: 40px; text-align: center;"><h2>Loading PosePrompt Studio...</h2><p>If this persists, check console (F12)</p></div>';
  if (document.body) {
    document.body.appendChild(loadingDiv);
  }

  // Try to import styles (non-blocking)
  import('./styles.css').catch(err => {
    console.warn('⚠️ Failed to import styles (non-critical):', err);
  });

  // Debug: Check if root element exists
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Root element not found!');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = '<div style="padding: 40px; color: #ef4444; text-align: center;"><h1>❌ Root Element Not Found</h1><p>Check index.html</p></div>';
    if (document.body) {
      const loading = document.getElementById('initial-loading');
      if (loading) loading.remove();
      document.body.appendChild(errorDiv);
    }
    return;
  }

  console.log('✅ Root element found');
  
  // Remove loading message
  const loading = document.getElementById('initial-loading');
  if (loading) loading.remove();
  
  console.log('📦 Mounting React app...');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ React app mounted successfully');
  } catch (error) {
    console.error('❌ Error mounting React app:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Show error on page
    rootElement.innerHTML = `
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; color: #ffffff;">
        <h1 style="color: #ef4444; margin-bottom: 20px;">❌ Error Loading App</h1>
        <h2 style="color: #fbbf24; margin-bottom: 16px;">${error.name}: ${error.message}</h2>
        <pre style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; overflow: auto; font-size: 12px; line-height: 1.5;">${error.stack || 'No stack trace available'}</pre>
        <p style="margin-top: 20px; color: #fbbf24;">💡 Check the browser console (F12 → Console) for more details.</p>
      </div>
    `;
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already ready
  initApp();
}

