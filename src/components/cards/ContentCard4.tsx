'use client';

import { FeatherArrowRight } from '@subframe/core';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ContentCard4Props {
  image?: string;
  title: string;
  date?: string;
  url: string;
  tags?: string[];
  className?: string;
  type?: 'post' | 'resource';
}

export default function ContentCard4({ 
  image, 
  title, 
  date, 
  url, 
  tags = [], 
  className,
  type = 'post'
}: ContentCard4Props) {
  const displayTags = tags.slice(0, 2);

  return (
    <Link
      href={url}
      className={cn(
        "group flex flex-col bg-white border-l-4 border-l-neutral-200 transition-all duration-300 ease-out hover:border-l-consort-red hover:shadow-lg hover:shadow-neutral-100",
        className
      )}
    >
      {/* Content */}
      <div className="flex flex-col p-6 gap-4 min-h-[200px]">
        {/* Tags at top */}
        <div className="flex gap-2">
          {displayTags.map((tag, idx) => (
            <BadgeConsort 
              key={idx} 
              variant={idx === 0 ? 'warning' : 'neutral'}
              className="text-xs"
            >
              {tag}
            </BadgeConsort>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-consort-blue line-clamp-3 leading-snug tracking-tight group-hover:text-consort-red transition-colors duration-300 flex-grow">
          {title}
        </h3>

        {/* Bottom section */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          {/* Date */}
          {date ? (
            <time className="text-sm text-neutral-500 font-medium">
              {new Date(date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </time>
          ) : <div />}

          {/* Arrow */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-consort-red transition-colors duration-300">
            <FeatherArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Optional Image at bottom */}
      {image && (
        <div className="relative h-32 overflow-hidden">
          <Image
            alt={title}
            src={image}
            fill
            className="object-cover opacity-80 transition-all duration-300 ease-out group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
      )}
    </Link>
  );
} 