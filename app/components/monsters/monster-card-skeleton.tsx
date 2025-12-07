export function MonsterCardSkeleton() {
  return (
    <div className="glass rounded-lg p-4 border border-[#27272a] animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Name skeleton */}
          <div className="h-6 w-3/4 bg-[#27272a] rounded mb-2"></div>
          {/* Type and size badges skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-[#27272a] rounded"></div>
            <div className="h-4 w-16 bg-[#27272a] rounded"></div>
          </div>
        </div>
        {/* CR skeleton */}
        <div className="text-right ml-2">
          <div className="h-3 w-8 bg-[#27272a] rounded mb-1"></div>
          <div className="h-8 w-12 bg-[#27272a] rounded"></div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-5 bg-[#27272a] rounded"></div>
        <div className="h-5 bg-[#27272a] rounded"></div>
      </div>

      {/* Special traits badges skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-24 bg-[#27272a] rounded"></div>
        <div className="h-6 w-20 bg-[#27272a] rounded"></div>
      </div>

      {/* Environments skeleton */}
      <div className="mb-3">
        <div className="h-3 w-24 bg-[#27272a] rounded mb-1"></div>
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-[#27272a] rounded"></div>
          <div className="h-5 w-16 bg-[#27272a] rounded"></div>
          <div className="h-5 w-16 bg-[#27272a] rounded"></div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-[#27272a]">
        <div className="h-3 w-20 bg-[#27272a] rounded"></div>
        <div className="h-8 w-16 bg-[#27272a] rounded"></div>
      </div>
    </div>
  );
}
