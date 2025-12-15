import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Copy, ExternalLink, Loader2, Calendar, Code, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { getUserErrorReports, markErrorReportResolved } from '../utils/errorReportingService';
import { getErrorMessage } from '../utils/errorHandler';

const ErrorReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unresolved, resolved

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadReports();
  }, [user, filter]);

  const loadReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      const allReports = await getUserErrorReports(user.uid, 100);
      
      // Filter reports
      let filtered = allReports;
      if (filter === 'unresolved') {
        filtered = allReports.filter(r => !r.resolved);
      } else if (filter === 'resolved') {
        filtered = allReports.filter(r => r.resolved);
      }
      
      setReports(filtered);
    } catch (err) {
      console.error('Error loading error reports:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId) => {
    try {
      await markErrorReportResolved(reportId);
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, resolved: true } : r
      ));
    } catch (err) {
      console.error('Error marking report as resolved:', err);
      setError('Failed to mark report as resolved');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast here
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const getErrorTypeLabel = (type) => {
    const labels = {
      'authentication': 'Authentication',
      'firebase': 'Firebase',
      'rate_limit': 'Rate Limit',
      'content_policy': 'Content Policy',
      'credits': 'Credits',
      'server_error': 'Server Error',
      'network': 'Network',
      'api_error': 'API Error',
      'unknown': 'Unknown',
    };
    return labels[type] || type;
  };

  const getErrorTypeColor = (type) => {
    const colors = {
      'authentication': '#ef4444',
      'firebase': '#f59e0b',
      'rate_limit': '#f97316',
      'content_policy': '#ec4899',
      'credits': '#3b82f6',
      'server_error': '#dc2626',
      'network': '#6366f1',
      'api_error': '#8b5cf6',
      'unknown': '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (!user) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#ffffff',
      }}>
        <p>Please sign in to view error reports</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      padding: '24px',
      color: '#ffffff',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Error Reports
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '16px',
            }}>
              View and debug errors that occurred in your account
            </p>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                background: filter === 'all' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${filter === 'all' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              style={{
                padding: '8px 16px',
                background: filter === 'unresolved' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${filter === 'unresolved' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Unresolved ({reports.filter(r => !r.resolved).length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              style={{
                padding: '8px 16px',
                background: filter === 'resolved' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${filter === 'resolved' ? '#22c55e' : 'rgba(34, 197, 94, 0.3)'}`,
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Resolved ({reports.filter(r => r.resolved).length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            color: '#fca5a5',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px',
          }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Reports List */}
        {!loading && reports.length === 0 && (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)' }}>
              No error reports found
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
              {filter === 'all' 
                ? 'Errors will appear here when they occur'
                : `No ${filter} errors found`}
            </p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${report.resolved ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  padding: '20px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Report Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: `${getErrorTypeColor(report.errorType)}20`,
                        border: `1px solid ${getErrorTypeColor(report.errorType)}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: getErrorTypeColor(report.errorType),
                      }}>
                        {getErrorTypeLabel(report.errorType)}
                      </span>
                      {report.resolved && (
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <CheckCircle size={14} />
                          Resolved
                        </span>
                      )}
                      {report.requestId && (
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(139, 92, 246, 0.2)',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: '#a78bfa',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <Code size={12} />
                          {report.requestId.substring(0, 8)}...
                          <button
                            onClick={() => copyToClipboard(report.requestId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#a78bfa',
                              cursor: 'pointer',
                              padding: '0',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Copy Request ID"
                          >
                            <Copy size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      marginBottom: '8px',
                      wordBreak: 'break-word',
                    }}>
                      {report.errorMessage}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {formatDate(report.createdAt)}
                      </span>
                      {report.context?.endpoint && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ExternalLink size={14} />
                          {report.context.endpoint}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!report.resolved && (
                      <button
                        onClick={() => handleResolve(report.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          borderRadius: '6px',
                          color: '#22c55e',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle size={14} />
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {expandedReport === report.id ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedReport === report.id && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {report.requestId && (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <Code size={14} />
                            Request ID
                          </div>
                          <div style={{
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#a78bfa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <span>{report.requestId}</span>
                            <button
                              onClick={() => copyToClipboard(report.requestId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#a78bfa',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Copy Request ID"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {report.errorCode && (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '4px',
                          }}>
                            Error Code
                          </div>
                          <div style={{
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#f59e0b',
                          }}>
                            {report.errorCode}
                          </div>
                        </div>
                      )}

                      {report.statusCode && (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '4px',
                          }}>
                            Status Code
                          </div>
                          <div style={{
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#ef4444',
                          }}>
                            {report.statusCode}
                          </div>
                        </div>
                      )}

                      {report.stack && (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '4px',
                          }}>
                            Stack Trace
                          </div>
                          <pre style={{
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            overflow: 'auto',
                            maxHeight: '200px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}>
                            {report.stack}
                          </pre>
                        </div>
                      )}

                      {report.context && (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <MessageSquare size={14} />
                            Context
                          </div>
                          <pre style={{
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            overflow: 'auto',
                            maxHeight: '150px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}>
                            {JSON.stringify(report.context, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorReports;

