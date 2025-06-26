'use client';

import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getImageForContext } from '@/utils/imageUtils';
import { getSmartBlurDataURL } from '@/utils/blurPlaceholders';

interface ContentCard1Props {
  image?: string;
  title: string;
  date?: string;
  url: string;
  tags?: string[];
  className?: string;
  type?: 'post' | 'resource';
}

export default function ContentCard1({
  image,
  title,
  date,
  url,
  tags = [],
  className,
  type = 'post'
}: ContentCard1Props) {
  const displayTags = tags.slice(0, 3);

  // Get optimized thumbnail URL for grid display
  const thumbnailUrl = image ? getImageForContext(image, 'grid', type === 'post' ? 'post' : 'resource') : '';

  // Get smart blur placeholder based on image URL
  const blurDataURL = thumbnailUrl ? getSmartBlurDataURL(thumbnailUrl, 'article') : '';

  return (
    <Link
      href={url}
      className={cn(
        "group h-full flex flex-col bg-white border border-neutral-200 shadow-md rounded-md overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-neutral-200/50 relative",
        className
      )}
    >
      {/* Image Container - Optional */}
        {thumbnailUrl && (
          <div className="relative h-56 overflow-hidden">
            {/* Skeleton Overlay for Image */}
            <div className="absolute inset-0 skeleton-shimmer skeleton-overlay rounded-md m-2" />
            
            {/* Tags */}
            <div className="absolute z-10 top-5 left-5 flex flex-wrap gap-1 mt-auto skeleton-content">
              {displayTags.map((tag, idx) => (
                <BadgeConsort
                  key={idx}
                  variant2='small'
                  variant={idx === 0 ? 'warning' : 'neutral'}
                >
                  {tag}
                </BadgeConsort>
              ))}
            </div>
            <Image
              alt={title}
              src={thumbnailUrl}
              fill
              className="object-cover p-2 rounded-md z-10 transition-transform duration-500 ease-out skeleton-content"
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col justify-between grow px-5 pb-4 pt-3 gap-3 relative">
          {/* Skeleton Overlays for Text */}
          <div className="skeleton-overlay absolute inset-0 px-5 pb-4 pt-3">
            <div className="skeleton-shimmer h-3 w-full mb-2 rounded" />
            <div className="skeleton-shimmer h-3 w-1/2 rounded" />
            {date && (
              <div className="skeleton-shimmer h-3 w-24 mt-3 rounded" />
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-body font-semibold text-consort-blue line-clamp-3 leading-tight group-hover:text-consort-red transition-colors duration-300 skeleton-content">
            {title}
          </h3>
          {/* Header with Date */}
          {date && (
            <div className="flex items-center justify-between text-xs text-neutral-500 skeleton-content">
              <div className='flex !items-center gap-1'>
                <Calendar className="w-3 h-3" />
                <time>{new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</time>
              </div>

              {/* Arrow Icon */}
              <div className="flex justify-end">
                <ArrowRight className="text-body-lg text-neutral-400 transition-all duration-300 ease-out group-hover:text-consort-red group-hover:translate-x-1" />
              </div>
            </div>
          )}
        </div>
      </Link>
  );
}