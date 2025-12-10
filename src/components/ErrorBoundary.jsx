import React from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { auth } from '../firebase-config';
import { signOut as firebaseSignOut } from 'firebase/auth';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 [ErrorBoundary] ===== CRASH DETECTED =====');
    console.error('[ErrorBoundary] Error:', error);
    console.error('[ErrorBoundary] Error message:', error?.message);
    console.error('[ErrorBoundary] Error stack:', error?.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
    console.error('[ErrorBoundary] Full error info:', errorInfo);
    
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: (prevState.errorCount || 0) + 1,
    }));

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Reset error state if props changed (indicating a re-render attempt)
    // This helps recover from transient errors
    if (this.state.hasError && prevProps.children !== this.props.children) {
      // Only reset if error count is low (to avoid infinite loops)
      if (this.state.errorCount < 3) {
        console.log('[ErrorBoundary] Props changed, attempting recovery');
        this.setState({ hasError: false, error: null, errorInfo: null, errorCount: 0 });
      }
    }
  }

  handleReset = () => {
    try {
      // Force a hard reload using href instead of reload() for better compatibility
      // This bypasses any potential issues with reload()
      const currentUrl = window.location.href;
      window.location.href = currentUrl;
    } catch (error) {
      console.error('Error reloading page:', error);
      // Fallback: try reload() if href fails
      try {
        window.location.reload(true);
      } catch (e) {
        // Last resort: redirect to root
        window.location.href = window.location.origin + window.location.pathname;
      }
    }
  };

  handleClearAuth = async () => {
    try {
      // Clear Firebase auth state
      if (auth) {
        try {
          if (auth.currentUser) {
            await firebaseSignOut(auth); // CRITICAL FIX: Use correct Firebase v9+ signOut
          }
        } catch (signOutError) {
          console.warn('Error signing out:', signOutError);
        }
      }
      
      // Clear ALL storage including Firebase persistence
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Also clear IndexedDB if possible (Firebase uses it)
        if ('indexedDB' in window) {
          try {
            indexedDB.databases().then(databases => {
              databases.forEach(db => {
                if (db.name) {
                  indexedDB.deleteDatabase(db.name);
                }
              });
            });
          } catch (e) {
            console.warn('Could not clear IndexedDB:', e);
          }
        }
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      
      // Force a hard reload with cache bypass
      const url = new URL(window.location.href);
      url.searchParams.set('_clear', Date.now().toString());
      window.location.href = url.toString();
    } catch (error) {
      console.error('Error clearing auth:', error);
      // Last resort: redirect to root with cache bypass
      window.location.replace(window.location.origin + window.location.pathname + '?_clear=' + Date.now());
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <AlertCircle
              size={64}
              style={{
                color: '#ef4444',
                margin: '0 auto 24px',
              }}
            />
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '24px',
                lineHeight: '1.6',
              }}
            >
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            {/* Only show error details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <details
                open={true}
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    marginBottom: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.handleClearAuth();
                }}
                style={{
                  padding: '14px 28px',
                  background: 'rgba(239, 68, 68, 0.3)',
                  border: '2px solid rgba(239, 68, 68, 0.6)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.4)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.8)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                <LogOut size={20} />
                Clear All Data & Reset
              </button>
              
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', margin: 0 }}>
                This will sign you out, clear all stored data, and reload the page
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleReset();
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }}
                >
                  <RefreshCw size={18} />
                  Just Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

