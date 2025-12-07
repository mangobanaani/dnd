/**
 * Skeleton Loading Component
 * Provides animated loading placeholder UI
 */

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[#27272a]';

  const variantClasses = {
    text: 'h-4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  return (
    <div
      className={baseClasses + ' ' + variantClasses[variant] + ' ' + className}
      aria-label="Loading..."
    />
  );
}

/**
 * Campaign Card Skeleton
 */
export function CampaignCardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <Skeleton className="h-40 rounded-none" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" variant="text" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" variant="text" />
            <Skeleton className="h-6 w-16" variant="text" />
          </div>
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-2/3" variant="text" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Skeleton className="h-3 w-12 mb-1" variant="text" />
            <Skeleton className="h-4 w-20" variant="text" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-1" variant="text" />
            <Skeleton className="h-4 w-16" variant="text" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-1" variant="text" />
            <Skeleton className="h-4 w-16" variant="text" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-1" variant="text" />
            <Skeleton className="h-4 w-20" variant="text" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Character Card Skeleton
 */
export function CharacterCardSkeleton() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16" variant="circle" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/2" variant="text" />
          <Skeleton className="h-4 w-2/3" variant="text" />
        </div>
      </div>
      <Skeleton className="h-px w-full mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Skeleton className="h-3 w-16 mb-1" variant="text" />
          <Skeleton className="h-4 w-20" variant="text" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" variant="text" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 glass rounded-lg">
      <Skeleton className="w-12 h-12" variant="circle" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" variant="text" />
        <Skeleton className="h-3 w-1/2" variant="text" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
