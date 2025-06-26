'use client';

import { FeatherArrowRight } from '@subframe/core';
import Link from 'next/link';
import { BadgeConsort } from '@/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NewsCardMinimalProps {
    image: string;
    title: string;
    description: string;
    url: string;
    tags?: string[];
    className?: string;
}

function NewsCardMinimal({ image, title, description, url, tags, className }: NewsCardMinimalProps) {
    return (
        <Link
            href={url}
            className={cn(
                "group relative overflow-hidden rounded bg-default-background shadow-md hover:shadow-lg transition-all duration-300",
                className
            )}
        >
            {/* Full Background Image */}
            <div className="relative h-96 w-full">
                <Image
                    alt={title}
                    src={image}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover scale-[1.02] transition-all duration-300 ease-out group-hover:scale-[1.01]"
                />

                {/* Gradient Overlay for text legibility */}
                <div className="absolute inset-0 bg-blue-900/20" />

                {/* Arrow at top-right */}
                <div className="absolute top-6 right-6">
                    <FeatherArrowRight className="text-3xl text-white/90 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-white" />
                </div>

                {/* Tags at top-left */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    {(tags ?? []).slice(0, 2).map((tag, idx) => (
                        <BadgeConsort
                            key={idx}
                            variant={idx === 0 ? 'warning' : undefined}
                        >
                            {tag}
                        </BadgeConsort>
                    ))}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end text-white">
                    {/* Main Content */}
                    <div className="space-y-1">

                        <div className="w-full backdrop-blur-sm rounded-sm p-6">
                            <p className="autotext-sm px-2 text-amber-200/90 line-clamp-2 leading-relaxed">
                                {description}
                            </p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white line-clamp-3 leading-tight transition-colors duration-300">
                                {title}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default NewsCardMinimal; 