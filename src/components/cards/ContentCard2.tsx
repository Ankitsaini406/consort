'use client';

import { FeatherArrowRight, FeatherClock } from '@subframe/core';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ContentCard2Props {
  image?: string;
  title: string;
  date?: string;
  url: string;
  tags?: string[];
  className?: string;
  type?: 'post' | 'resource';
}

export default function ContentCard2({ 
  image, 
  title, 
  date, 
  url, 
  tags = [], 
  className,
  type = 'post'
}: ContentCard2Props) {
  const displayTags = tags.slice(0, 2);

  return (
    <Link
      href={url}
      className={cn(
        "group flex bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-consort-blue/5 hover:border-consort-blue/20",
        className
      )}
    >
      {/* Image Container - Optional */}
      {image && (
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
          <Image
            alt={title}
            src={image}
            fill
            className="object-cover transition-all duration-300 ease-out group-hover:brightness-110"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="flex flex-col justify-between p-5 min-h-[128px] flex-grow">
        {/* Title */}
        <div>
          <h3 className="text-base font-semibold text-consort-blue line-clamp-2 leading-snug mb-2 group-hover:text-consort-red transition-colors duration-300">
            {title}
          </h3>
          
          {/* Date */}
          {date && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
              <FeatherClock className="w-3.5 h-3.5" />
              <time>{new Date(date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}</time>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Tags */}
          <div className="flex gap-1.5">
            {displayTags.map((tag, idx) => (
              <BadgeConsort 
                key={idx} 
                variant="neutral"
                className="text-xs px-2 py-1"
              >
                {tag}
              </BadgeConsort>
            ))}
          </div>

          {/* Arrow */}
          <FeatherArrowRight className="w-4 h-4 text-neutral-400 transition-all duration-300 ease-out group-hover:text-consort-red group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
} 