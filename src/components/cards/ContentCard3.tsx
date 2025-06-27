'use client';

import { FeatherArrowUpRight, FeatherCalendar } from '@subframe/core';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ContentCard3Props {
  image?: string;
  title: string;
  date?: string;
  url: string;
  tags?: string[];
  className?: string;
  type?: 'post' | 'resource';
}

export default function ContentCard3({ 
  image, 
  title, 
  date, 
  url, 
  tags = [], 
  className,
  type = 'post'
}: ContentCard3Props) {
  const displayTags = tags.slice(0, 3);

  return (
    <Link
      href={url}
      className={cn(
        "group relative flex flex-col bg-gradient-to-br from-white to-neutral-50/50 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-neutral-900/10 hover:from-white hover:to-brand-50/30",
        className
      )}
    >
      {/* Subtle border that appears on hover */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-neutral-200/60 group-hover:ring-consort-blue/20 transition-all duration-300" />
      
      {/* Image Container - Optional */}
      {image && (
        <div className="relative h-44 overflow-hidden rounded-t-2xl">
          <Image
            alt={title}
            src={image}
            fill
            className="object-cover transition-all duration-500 ease-out group-hover:scale-102"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/5 to-transparent" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative flex flex-col grow p-6 gap-3">
        {/* Date Badge */}
        {date && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 bg-white/80 rounded-full px-3 py-1.5 w-fit shadow-sm">
            <FeatherCalendar className="w-3 h-3" />
            <time>{new Date(date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}</time>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-consort-blue line-clamp-2 leading-tight tracking-tight group-hover:text-consort-red transition-colors duration-300 mb-1">
          {title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
          {displayTags.map((tag, idx) => (
            <BadgeConsort 
              key={idx} 
              variant="neutral"
              className="text-xs bg-white/70 hover:bg-white/90 transition-colors duration-200"
            >
              {tag}
            </BadgeConsort>
          ))}
        </div>

        {/* Arrow Icon - positioned absolutely */}
        <FeatherArrowUpRight className="w-5 h-5 text-neutral-400 transition-all duration-300 ease-out group-hover:text-consort-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 self-end" />
      </div>
    </Link>
  );
} 