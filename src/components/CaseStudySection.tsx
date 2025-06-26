'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { FeatherChevronLeft, FeatherChevronRight, FeatherArrowRight } from '@subframe/core';
import { BadgeConsort } from '@/ui/components/BadgeConsort';
import { Button3 } from '@/ui/components/Button3';
import { IconButton } from '@/ui/components/IconButton';
import Link from "next/link";

interface CaseStudyItem {
    image: string;
    title: string;
    description: string;
    url: string; // ✅ must be defined
    badges?: { text: string; variant?: string }[];
}




export default function CaseStudiesSection({
    title,
    items
}: {
    title?: string;
    items: CaseStudyItem[];
}) {
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3); // Default to desktop
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

    // Responsive items per page logic
    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
            let newItemsPerPage;

            if (width < 768) {
                newItemsPerPage = 1; // Mobile: 1 card
            } else if (width < 1024) {
                newItemsPerPage = 2; // md: 2 cards
            } else {
                newItemsPerPage = 3; // Desktop: 3 cards
            }

            if (newItemsPerPage !== itemsPerPage) {
                setItemsPerPage(newItemsPerPage);
                setPage(1); // Reset to first page when screen size changes
            }
        };

        // Set initial value
        updateItemsPerPage();

        // Add event listener
        window.addEventListener('resize', updateItemsPerPage);

        // Cleanup
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, [itemsPerPage]);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const itemsToDisplay = items.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Handle pagination with smooth slide animation
    const handlePageChange = (newPage: number) => {
        if (newPage === page || isAnimating) return;

        // Determine slide direction
        const direction = newPage > page ? 'right' : 'left';
        setSlideDirection(direction);
        setIsAnimating(true);

        // Small delay for smooth transition
        setTimeout(() => {
            setPage(newPage);
            setTimeout(() => {
                setIsAnimating(false);
            }, 200);
        }, 100);
    };

    if (items.length === 0) return null;

    return (
        <div className="flex w-full flex-col items-start gap-8 shadow rounded-lg p-8 mobile:p-1 mobile:gap-2 mobile:px-1 mobile:pb-4 bg-neutral-50">
            <h4 className="w-full font-heading-3 lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm text-consort-blue text-center md:mt-4 mobile:mt-6 mobile:mb-2">
                {title?.trim() ? `Case Studies for ${title}` : `Recent Case Studies`}
            </h4>

            {/* Cards Container with Slide Animation */}
            <div className="w-full overflow-hidden">
                <div
                    className={`flex w-full gap-3 transition-all duration-300 p-2 ease-out ${isAnimating
                        ? slideDirection === 'right'
                            ? 'transform -translate-x-4 opacity-80'
                            : 'transform translate-x-4 opacity-80'
                        : 'transform translate-x-0 opacity-100'
                        } ${itemsPerPage === 1 ? 'flex-col' : 'flex-wrap'} ${itemsPerPage === 2 ? 'md:flex-row md:justify-center' : ''} ${itemsPerPage === 3 ? 'lg:flex-row lg:justify-start' : ''} mobile:flex-col`}
                >
                    {itemsToDisplay.map((item, index) => (
                        <Link
                            key={`${page}-${index}`}
                            href={item?.url || "#"} // ✅ prevents runtime error
                            className={`relative group flex flex-col rounded bg-white shadow overflow-hidden hover:shadow-md transition-all duration-200
                            ${itemsPerPage === 1 ? 'w-full max-w-full' : ''} 
                            ${itemsPerPage === 2 ? 'flex-1 min-w-[280px] max-w-[calc(50%-0.75rem)] md:max-w-[calc(50%-0.75rem)]' : ''}
                            ${itemsPerPage === 3 ? 'flex-1 min-w-[280px] max-w-[calc(33.333%-1rem)] lg:max-w-[calc(33.333%-0.5rem)]' : ''}
                            mobile:max-w-full`}
                        >
                            {/* Case Study Image */}
                            <div className="overflow-hidden w-full h-48">
                                <Image
                                    alt={item.title || "Case Study"}
                                    src={item.image} // ✅ must be defined
                                    width={448}
                                    height={360}
                                    className="h-full w-full !origin-center object-cover scale-[1.03] transition-all duration-300 ease-out group-hover:scale-[1.01]"
                                />
                            </div>
                            {/* Case Study Content */}
                            <div className="flex flex-col grow justify-between gap-y-2 px-5 py-6">
                                <div>
                                    <h3 className="text-body-blog font-body-blog mb-1.5 line-clamp-2 !leading-tight group-hover:text-consort-red">
                                        {item.title || "Untitled Case Study"}
                                    </h3>
                                    <p className="text-caption font-caption text-subtext-color line-clamp-3 !leading-snug">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="flex w-full items-end justify-between">
                                    <div className="flex w-full flex-wrap items-start gap-x-1 gap-y-2 pt-2 -ml-0.5 mr-5">
                                        {item.badges?.map((badge, i) => (
                                            <BadgeConsort key={i} variant={badge.variant as any}>
                                                {badge.text}
                                            </BadgeConsort>
                                        ))}
                                    </div>
                                    <FeatherArrowRight className="absolute bottom-6 right-4 text-2xl text-neutral-500 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-consort-red" />
                                </div>
                            </div>

                        </Link>
                    ))}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex mx-auto items-center justify-center gap-4">
                    <Button3
                        variant="neutral-secondary"
                        size="small"
                        icon={<FeatherChevronLeft />}
                        onClick={() => handlePageChange(Math.max(page - 1, 1))}
                        disabled={page === 1 || isAnimating}
                    >
                        Prev
                    </Button3>
                    <span className="text-caption-bold font-caption-bold text-consort-blue min-w-[80px] text-center">
                        Page {page} of {totalPages}
                    </span>
                    <Button3
                        variant="neutral-secondary"
                        size="small"
                        iconRight={<FeatherChevronRight />}
                        onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                        disabled={page === totalPages || isAnimating}
                    >
                        Next
                    </Button3>
                </div>
            )}
        </div>
    );
}
