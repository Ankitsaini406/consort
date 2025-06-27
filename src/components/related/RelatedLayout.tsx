'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { FeatherChevronLeft, FeatherChevronRight } from '@subframe/core';
import { Button3 } from '@/ui';
import { FeatherArrowRight } from '@subframe/core';
import Link from "next/link"; // make sure it's imported
import { getValidImageUrl, createImageErrorHandler, createImageLoadingCompleteHandler } from '@/utils/imageUtils';
import { getSmartBlurDataURL } from '@/utils/blurPlaceholders';
import { ImageRouter } from '@/utils/imageRouter';


interface RelatedItem {
    image: string;
    title: string;
    description: string;
    url: string;
}

type ResponsiveRows = {
    sm?: number;
    md?: number;
    lg?: number;
};

export default function RelatedLayout({
    items,
    rows = 1,
    title = "Related Products & Accessories",
    paginationPosition = 'bottom',
}: {
    items: RelatedItem[];
    rows?: number | ResponsiveRows;
    title?: string | null;
    paginationPosition?: 'top' | 'bottom';
}) {
    const [page, setPage] = useState(1);
    const [columns, setColumns] = useState(4);
    const [currentRowCount, setCurrentRowCount] = useState(typeof rows === 'number' ? rows : 1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            
            let newColumns = 4;
            if (width < 768) newColumns = 2;
            else if (width < 1024) newColumns = 3;

            let newRowCount = 1;
            if (typeof rows === 'object') {
                if (width < 768) { // Mobile
                    newRowCount = rows.sm || rows.md || rows.lg || 1;
                } else if (width < 1024) { // Tablet
                    newRowCount = rows.md || rows.lg || 1;
                } else { // Desktop
                    newRowCount = rows.lg || 1;
                }
            } else { // rows is a number
                newRowCount = rows;
            }

            if (newColumns !== columns || newRowCount !== currentRowCount) {
                setColumns(newColumns);
                setCurrentRowCount(newRowCount);
                setPage(1);
            }
        };

        window.addEventListener('resize', updateLayout);
        updateLayout();

        return () => window.removeEventListener('resize', updateLayout);
    }, [rows, columns, currentRowCount]);

    const itemsPerPage = columns * currentRowCount;
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

    const paginationControls = totalPages > 1 && (
        <div className="flex mx-auto items-center justify-center gap-4 pt-2">
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
    );

    return (
        <div className="flex w-full flex-col items-start gap-8 shadow rounded-lg p-6 mobile:p-1 mobile:gap-2 mobile:px-1 mobile:pb-4 my-6 bg-neutral-50">
            {title && (
                <h4 className="w-full font-heading-3 lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm text-consort-blue text-center md:mt-4 mobile:mt-6 mobile:mb-2">
                    {title}
                </h4>
            )}

            {paginationPosition === 'top' && paginationControls}

            {/* Cards Container with Slide Animation */}
            <div className="w-full overflow-hidden">
                <div
                    className={`grid w-full items-start justify-center gap-1 p-1 transition-all duration-300 ease-out ${isAnimating
                            ? slideDirection === 'right'
                                ? 'transform -translate-x-4 opacity-80'
                                : 'transform translate-x-4 opacity-80'
                            : 'transform translate-x-0 opacity-100'
                        } grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}
                >
                    {itemsToDisplay.map((item, index) => (
                        <Link
                            key={`${page}-${index}`}
                            href={item.url ?? "#"} // fallback to "#" if url is missing
                            className="group flex flex-col mobile:p-1 items-center self-stretch rounded-md hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer relative"
                        >
                            {/* Fixed dimension container to prevent layout shift - responsive width */}
                            <div className="relative h-56 mobile:h-40 w-full max-w-52 flex-shrink-0 rounded-md overflow-hidden">
                                <Image
                                    alt={item.title}
                                    className="duration-300 ease-out py-6 group-hover:-translate-y-[4px] transition-transform object-contain w-full h-full"
                                    src={ImageRouter.forThumbnail(getValidImageUrl(item.image))}
                                    fill
                                    sizes="(max-width: 768px) 208px, 208px"
                                    onError={createImageErrorHandler()}
                                    onLoad={createImageLoadingCompleteHandler()}
                                    blurDataURL={getSmartBlurDataURL(item.image)}
                                    placeholder="blur"
                                    loading="eager"
                                />
                            </div>
                            <div className="w-full px-4 pb-3 text-center">
                                <h5 className="text-body-blog font-body-blog mb-1 line-clamp-2 !leading-tight text-consort-blue line-clamp-2 group-hover:text-consort-red">
                                    {item.title}
                                </h5>
                                <p className="text-caption font-caption text-subtext-color line-clamp-3 !leading-tight">
                                    {item.description}
                                </p>
                            </div>
                            {/* Optional View Details Button */}
                            {/* <Button3
                                variant="neutral-tertiary"
                                size="small"
                                iconRight={<FeatherArrowRight />}
                                className="mt-2"
                            >
                                View Details
                            </Button3> */}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Pagination Controls */}
            {paginationPosition === 'bottom' && paginationControls}
        </div>
    );
}
