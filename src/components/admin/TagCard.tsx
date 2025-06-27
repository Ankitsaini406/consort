'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button3 } from '@/ui/components/Button3';
import { FeatherEdit, FeatherTrash2 } from '@subframe/core';

export interface TagItem {
    id: string;
    label: string;
    imageUrl?: string;
    createdAt: Date;
}

interface TagCardProps {
    item: TagItem;
    onEdit?: () => void;
    onDelete?: () => void;
    onConvertToDraft?: () => void;
}

export function TagCard({ item, onEdit, onDelete, onConvertToDraft }: TagCardProps) {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    
    const dateAdded = item.createdAt.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="group flex flex-col bg-white border border-neutral-200 rounded overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all duration-200">
            {/* Prominent Image on Top */}
            {item.imageUrl && (
                <div className="relative h-32 w-full border-neutral-100">
                    {/* Image Loading Skeleton */}
                    {imageLoading && (
                        <div className="absolute inset-0 bg-neutral-100 animate-pulse">
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 bg-neutral-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    )}
                    
                    {!imageError && (
                        <Image
                            src={item.imageUrl}
                            alt={item.label}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'contain' }}
                            className="p-3"
                            unoptimized
                            onLoadingComplete={() => setImageLoading(false)}
                            onError={() => {
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />
                    )}
                    
                    {/* Error State */}
                    {imageError && (
                        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                            <div className="text-neutral-400 text-sm">Failed to load</div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Content Area */}
            <div className="p-4">
                <div className="flex flex-col gap-2 mb-3">
                    <h3 className="line-clamp-2 text-body-bold font-body-bold text-default-font group-hover:text-consort-red transition-colors cursor-pointer" title={item.label}>
                        {item.label}
                    </h3>
                    <p className="text-xs font-caption text-subtext-color">
                        Added {dateAdded}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <Button3 variant="brand-secondary" size="small" icon={<FeatherEdit />} onClick={onEdit}>
                                Edit
                            </Button3>
                        )}
                    </div>
                    {onDelete && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button3 variant="destructive-secondary" size="small" icon={<FeatherTrash2 />} onClick={onDelete} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 