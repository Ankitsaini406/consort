"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button3 } from '@/ui';
import { FeatherChevronLeft, FeatherChevronRight } from '@subframe/core';
import { ContentCard1 } from '@/components/cards';
import { Posts } from '@/types/types';

interface PostsGridClientProps {
    posts: Posts[];
    postType: string;
}

export default function PostsGridClient({ posts, postType }: PostsGridClientProps) {
    const [page, setPage] = useState(1);
    const [columns, setColumns] = useState(3);
    const [isAnimating, setIsAnimating] = useState(false);

    const rows = 3; // Display 3 rows per page

    // Debug logging
    console.log(`🔍 PostsGridClient: Received ${posts.length} posts for type '${postType}'`);
    console.log(`🔍 PostsGridClient: Posts data:`, posts.map(p => ({ slug: p.slug, title: p.postTitle, type: p.postType })));

    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setColumns(1);
            } else if (width < 1024) {
                setColumns(2);
            } else {
                setColumns(3);
            }
        };

        window.addEventListener('resize', updateLayout);
        updateLayout(); // Set initial layout

        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    const itemsPerPage = useMemo(() => columns * rows, [columns]);
    const totalPages = useMemo(() => Math.ceil(posts.length / itemsPerPage), [posts.length, itemsPerPage]);

    const itemsToDisplay = useMemo(() => {
        return posts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    }, [page, itemsPerPage, posts]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setIsAnimating(true);
            setPage(newPage);
            
            // Reset animation after duration
            setTimeout(() => {
                setIsAnimating(false);
            }, 500);
        }
    };

    // Show empty state if no posts
    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                    No {postType.replace('-', ' ')} posts found
                </div>
                <div className="text-sm text-gray-400">
                    Posts will appear here once they are published by the admin.
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mb-8">
                    <Button3
                        variant="neutral-secondary"
                        size="small"
                        icon={<FeatherChevronLeft />}
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button3>
                    <span className="text-caption-bold font-caption-bold text-consort-blue min-w-[100px] text-center">
                        Page {page} of {totalPages}
                    </span>
                    <Button3
                        variant="neutral-secondary"
                        size="small"
                        iconRight={<FeatherChevronRight />}
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button3>
                </div>
            )}

            {/* Grid for Content Cards with CSS Animation */}
            <div
                key={page}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out ${
                    isAnimating ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'
                }`}
                style={{
                    animation: isAnimating ? 'none' : 'fadeInUp 0.5s ease-in-out'
                }}
            >
                {itemsToDisplay.map((item: Posts, idx: number) => (
                    <div
                        key={`${item.slug}-${page}`}
                        className="animate-fadeIn"
                        style={{
                            animationDelay: `${idx * 0.1}s`,
                            animationFillMode: 'both'
                        }}
                    >
                        <ContentCard1 
                            image={item.heroImageUrl}
                            title={item.postTitle}
                            date={item.date}
                            url={`/posts/${postType}/${item.slug}`}
                            tags={item.globalTags}
                            type="post"
                        />
                    </div>
                ))}
            </div>

            {/* CSS Keyframes */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </>
    );
} 