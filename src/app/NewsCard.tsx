'use client';

import { FeatherArrowRight } from '@subframe/core';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NewsCardProps {
  image: string;
  title: string;
  description: string;
  url: string;
  tags?: string[];
  className?: string;
}

function NewsCard({ image, title, description, url, tags, className }: NewsCardProps) {
  return (
    <Link
      href={url}
      className={cn(
        "group flex flex-col self-stretch rounded bg-default-background shadow-md overflow-hidden hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {/* Image Container */}
      <div className="mobile:h-48 md:h-56">
        <Image
          alt={title}
          src={image}
          width={448}
          height={360}
          className="h-full w-full object-cover scale-[1.03] transition-all duration-300 ease-out group-hover:scale-[1.01]"
        />
      </div>
      
      {/* Content Container */}
      <div className="flex flex-col grow justify-between gap-3 px-6 py-6 mobile:px-5">
        {/* Text Content */}
        <div className="space-y-2">
          <p className="text-caption font-caption text-subtext-color line-clamp-2 sm:line-clamp-3 leading-snug">
            {description}
          </p>
          <h3 className="text-lg sm:text-xl font-bold font-body text-consort-blue line-clamp-2 !tracking-tight !leading-snug group-hover:text-consort-red transition-colors duration-300">
            {title}
          </h3>
        </div>
        
        {/* Footer with Tags and Arrow */}
        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-wrap gap-1 max-w-[calc(100%-3rem)]">
            {(tags ?? []).map((tag, idx) => (
              <BadgeConsort key={idx} variant={idx === 0 ? 'warning' : undefined}>
                {tag}
              </BadgeConsort>
            ))}
          </div>
          <FeatherArrowRight className="text-xl sm:text-2xl text-neutral-500 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-consort-red flex-shrink-0 ml-2" />
        </div>
      </div>
    </Link>
  );
}

export default NewsCard;
