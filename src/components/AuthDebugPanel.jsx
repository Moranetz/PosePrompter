import React, { useState, useEffect } from 'react';
import { Bug, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { auth } from '../firebase-config';
import { getAuthEvents, clearAuthEvents, printDiagnosticReport, diagnoseAuthState } from '../utils/authDebugger';

/**
 * Debug panel for diagnosing auth issues
 * Only shown in development mode or when explicitly enabled
 */
const AuthDebugPanel = ({ user, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const refreshData = () => {
    setEvents(getAuthEvents().slice(-20));
    setDiagnosis(diagnoseAuthState(auth, user, loading));
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [user, loading]);

  const handleClearEvents = () => {
    clearAuthEvents();
    refreshData();
  };

  const handlePrintReport = () => {
    printDiagnosticReport(auth, user, loading);
  };

  const handleForceReload = () => {
    // Clear auth persistence and reload
    try {
      localStorage.removeItem('firebase:authUser');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 99999,
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: diagnosis?.issues?.length > 0 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          marginLeft: 'auto'
        }}
      >
        <Bug size={14} />
        Auth Debug
        {diagnosis?.issues?.length > 0 && (
          <span style={{ 
            background: '#fff', 
            color: '#ef4444', 
            padding: '2px 6px', 
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {diagnosis.issues.length}
          </span>
        )}
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div
          style={{
            marginTop: '8px',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflow: 'auto',
            color: '#fff'
          }}
        >
          {/* Current State */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Current State</h4>
            <div style={{ display: 'grid', gap: '4px' }}>
              <div>Loading: <span style={{ color: loading ? '#f59e0b' : '#22c55e' }}>{String(loading)}</span></div>
              <div>User: <span style={{ color: user ? '#22c55e' : '#ef4444' }}>{user ? user.uid : 'null'}</span></div>
              <div>Firebase User: <span style={{ color: auth?.currentUser ? '#22c55e' : '#ef4444' }}>
                {auth?.currentUser ? auth.currentUser.uid : 'null'}
              </span></div>
            </div>
          </div>

          {/* Issues */}
          {diagnosis?.issues?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>Issues Detected</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {diagnosis.issues.map((issue, i) => (
                  <li key={i} style={{ color: '#fca5a5', marginBottom: '4px' }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Storage Status */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Storage</h4>
            <div style={{ display: 'grid', gap: '4px' }}>
              <div>Session: <span style={{ color: diagnosis?.storage?.sessionStorage ? '#22c55e' : '#ef4444' }}>
                {diagnosis?.storage?.sessionStorage ? 'OK' : 'BLOCKED'}
              </span></div>
              <div>Local: <span style={{ color: diagnosis?.storage?.localStorage ? '#22c55e' : '#ef4444' }}>
                {diagnosis?.storage?.localStorage ? 'OK' : 'BLOCKED'}
              </span></div>
              <div>Cookies: <span style={{ color: diagnosis?.storage?.cookies ? '#22c55e' : '#ef4444' }}>
                {diagnosis?.storage?.cookies ? 'OK' : 'BLOCKED'}
              </span></div>
            </div>
          </div>

          {/* Recent Events */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Recent Events ({events.length})</h4>
            <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: '10px' }}>
              {events.map((event, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '4px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: event.data?.type === 'ERROR' ? '#fca5a5' : 
                           event.data?.type === 'SUCCESS' ? '#86efac' : 
                           event.data?.type === 'WARNING' ? '#fcd34d' : '#fff'
                  }}
                >
                  {event.event}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrintReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: '#8b5cf6',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Print Report
            </button>
            <button
              onClick={refreshData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              onClick={handleClearEvents}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              <Trash2 size={12} /> Clear
            </button>
            <button
              onClick={handleForceReload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Force Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugPanel;

