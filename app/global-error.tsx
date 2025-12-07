'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#0a0a0f',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Critical Error
          </h2>
          <p style={{
            color: '#a1a1aa',
            marginBottom: '24px'
          }}>
            A critical error occurred. Please refresh the page.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#f87171',
                wordBreak: 'break-all'
              }}>
                {error.message}
              </div>
              {error.digest && (
                <div style={{
                  fontSize: '12px',
                  color: '#a1a1aa',
                  marginTop: '8px'
                }}>
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#8b5cf6',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                backgroundColor: 'transparent',
                color: '#fafafa',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
