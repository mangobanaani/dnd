'use client';

import { Skeleton, CampaignCardSkeleton, CharacterCardSkeleton } from '@/app/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318] p-4">
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4 pt-8">
          <Skeleton className="h-10 w-1/3" variant="text" />
          <Skeleton className="h-6 w-1/2" variant="text" />
        </div>

        {/* Grid of content skeletons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CharacterCardSkeleton />
          <CharacterCardSkeleton />
          <CharacterCardSkeleton />
        </div>

        {/* Alternative simple spinner centered */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass rounded-full p-8">
            <div className="animate-spin">
              <svg
                className="h-12 w-12 text-[#8b5cf6]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
