'use client';

import { useEffect } from 'react';
import { Button } from '@/app/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="max-w-md w-full">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#fafafa] mb-2">
            Something went wrong
          </h2>
          <p className="text-[#a1a1aa] mb-6">
            An unexpected error occurred. This has been logged for investigation.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-left">
              <div className="text-xs font-mono text-red-400 break-all">
                {error.message}
              </div>
              {error.digest && (
                <div className="text-xs text-[#a1a1aa] mt-2">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => reset()}
            >
              Try again
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
            >
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
