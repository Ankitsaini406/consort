'use client';

import React from 'react';

type ResponsiveRows = {
  sm?: number;
  md?: number;
  lg?: number;
};

interface ProductCardSkeletonProps {
  rows?: number | ResponsiveRows;
  title?: string | null;
  showPagination?: boolean;
  paginationPosition?: 'top' | 'bottom';
}

// Individual skeleton card that matches RelatedLayout card structure exactly
const SkeletonCard = () => (
  <div className="group flex flex-col mobile:p-1 items-center self-stretch rounded-md relative">
    {/* Fixed dimension container skeleton - matches: relative h-56 mobile:h-40 w-full max-w-52 */}
    <div className="relative h-56 mobile:h-40 w-full max-w-52 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse" />
    
    {/* Text content skeleton - matches: w-full px-4 pb-3 text-center */}
    <div className="w-full px-4 pb-3 text-center mt-2">
      {/* Title skeleton - matches: text-body-blog line-clamp-2 */}
      <div className="space-y-1 mb-2">
        <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4 mx-auto" />
        <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2 mx-auto" />
      </div>
      
      {/* Description skeleton - matches: text-caption line-clamp-3 */}
      <div className="space-y-1">
        <div className="h-3 bg-neutral-100 rounded animate-pulse w-full" />
        <div className="h-3 bg-neutral-100 rounded animate-pulse w-5/6 mx-auto" />
        <div className="h-3 bg-neutral-100 rounded animate-pulse w-3/4 mx-auto" />
      </div>
    </div>
  </div>
);

// Pagination skeleton
const PaginationSkeleton = () => (
  <div className="flex mx-auto items-center justify-center gap-4">
    <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
    <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
    <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
  </div>
);

export default function ProductCardSkeleton({
  rows = 1,
  title = "Related Products & Accessories",
  showPagination = true,
  paginationPosition = 'bottom'
}: ProductCardSkeletonProps) {
  // Calculate skeleton cards based on responsive rows (matches RelatedLayout logic)
  const getSkeletonCount = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    // Match RelatedLayout column logic
    let columns = 4;
    if (width < 768) columns = 2;      // Mobile: 2 columns
    else if (width < 1024) columns = 3; // Tablet: 3 columns
    
    // Match RelatedLayout row logic
    let rowCount = 1;
    if (typeof rows === 'object') {
      if (width < 768) {
        rowCount = rows.sm || rows.md || rows.lg || 1;
      } else if (width < 1024) {
        rowCount = rows.md || rows.lg || 1;
      } else {
        rowCount = rows.lg || 1;
      }
    } else {
      rowCount = rows;
    }
    
    return columns * rowCount;
  };

  const skeletonCount = getSkeletonCount();

  return (
    <div className="flex w-full flex-col items-start gap-8 shadow rounded-lg p-6 mobile:p-1 mobile:gap-2 mobile:px-1 mobile:pb-4 my-6 bg-neutral-50">
      {/* Title skeleton */}
      {title && (
        <div className="w-full text-center md:mt-4 mobile:mt-6 mobile:mb-2">
          <div className="h-7 bg-neutral-200 rounded animate-pulse w-64 mx-auto" />
        </div>
      )}

      {/* Top pagination skeleton */}
      {showPagination && paginationPosition === 'top' && <PaginationSkeleton />}

      {/* Cards grid skeleton - matches RelatedLayout grid classes */}
      <div className="w-full overflow-hidden">
        <div className="grid w-full items-start justify-center gap-1 p-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>

      {/* Bottom pagination skeleton */}
      {showPagination && paginationPosition === 'bottom' && <PaginationSkeleton />}
    </div>
  );
} 