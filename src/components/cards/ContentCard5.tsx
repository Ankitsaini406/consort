'use client';

import { FeatherExternalLink, FeatherCalendar } from '@subframe/core';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ContentCard5Props {
  image?: string;
  title: string;
  date?: string;
  url: string;
  tags?: string[];
  className?: string;
  type?: 'post' | 'resource';
}

export default function ContentCard5({ 
  image, 
  title, 
  date, 
  url, 
  tags = [], 
  className,
  type = 'post'
}: ContentCard5Props) {
  const displayTags = tags.slice(0, 3);

  return (
    <Link
      href={url}
      className={cn(
        "group relative flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden transition-all duration-400 ease-out hover:bg-white/95 hover:shadow-xl hover:shadow-consort-blue/5 hover:border-consort-blue/10 hover:-translate-y-1",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neutral-50/20 to-neutral-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      
      {/* Image Container - Optional */}
      {image && (
        <div className="relative h-40 overflow-hidden">
          <Image
            alt={title}
            src={image}
            fill
            className="object-cover transition-all duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          
          {/* Date overlay on image */}
          {date && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
              <div className="flex items-center gap-1 text-xs font-medium text-neutral-700">
                <FeatherCalendar className="w-3 h-3" />
                <time>{new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</time>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="relative flex flex-col grow p-5 gap-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-consort-blue line-clamp-2 leading-tight group-hover:text-consort-red transition-colors duration-300">
          {title}
        </h3>

        {/* Date (if no image) */}
        {!image && date && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <FeatherCalendar className="w-4 h-4" />
            <time>{new Date(date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</time>
          </div>
        )}

        {/* Tags and Arrow */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag, idx) => (
              <BadgeConsort 
                key={idx} 
                variant="neutral"
                className="text-xs bg-neutral-100/80 backdrop-blur-sm border border-white/40"
              >
                {tag}
              </BadgeConsort>
            ))}
          </div>

          {/* External link icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100/50 backdrop-blur-sm border border-white/40 group-hover:bg-consort-red group-hover:border-consort-red transition-all duration-300">
            <FeatherExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
} 