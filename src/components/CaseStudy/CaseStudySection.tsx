'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FeatherChevronLeft, FeatherChevronRight, FeatherArrowRight } from '@subframe/core';
import { BadgeConsort, Button3 } from '@/ui';
import Link from 'next/link';

interface CaseStudyItem {
    heroImage: string;
    resourceTitle: string;
    headline: string;
    globalTags?: string[];
    slug: string;
}

export default function CaseStudiesSection({
    title,
    items
}: {
    title?: string;
    items: CaseStudyItem[];
}) {
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        const updateItemsPerPage = () => {
            const w = window.innerWidth;
            const n = w < 768 ? 1 : w < 1024 ? 2 : 3;
            if (n !== itemsPerPage) {
                setItemsPerPage(n);
                setPage(1);
            }
        };
        window.addEventListener('resize', updateItemsPerPage);
        updateItemsPerPage();
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, [itemsPerPage]);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const itemsToDisplay = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage === page || isAnimating) return;
        setSlideDirection(newPage > page ? 'right' : 'left');
        setIsAnimating(true);
        setTimeout(() => {
            setPage(newPage);
            setTimeout(() => setIsAnimating(false), 200);
        }, 100);
    };

    return (
        <div className="flex w-full flex-col items-start gap-12 rounded-lg p-8 mobile:p-2 my-6 bg-neutral-50">
            <h4 className="w-full text-heading-3 font-heading-3 text-consort-blue text-center mt-4">
                {title?.trim() || 'Recent Case Studies'}
            </h4>

            <div className="w-full overflow-hidden">
                <div className={`flex w-full gap-6 transition-all duration-300 ease-out ${isAnimating
                        ? slideDirection === 'right'
                            ? 'transform -translate-x-4 opacity-80'
                            : 'transform translate-x-4 opacity-80'
                        : 'transform translate-x-0 opacity-100'
                    } ${itemsPerPage === 1 ? 'flex-col' : 'flex-wrap'} 
             ${itemsPerPage === 2 ? 'md:flex-row md:justify-center' : ''} 
             ${itemsPerPage === 3 ? 'lg:flex-row lg:justify-start' : ''} mobile:flex-col`}>

                    {itemsToDisplay.map((item, idx) => (
                        <div
                            key={`${page}-${idx}`}
                            className={`flex flex-col rounded-md bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${itemsPerPage === 1 ? 'w-full max-w-full' : ''
                                } ${itemsPerPage === 2 ? 'flex-1 min-w-[280px] max-w-[calc(50%-0.75rem)]' : ''}
                ${itemsPerPage === 3 ? 'flex-1 min-w-[280px] max-w-[calc(33.333%-1rem)]' : ''}
                mobile:max-w-full`}
                        >
                            <Link href={`/resources/${item.slug}`} key={`${page}-${idx}`} target='_blank' >
                            <Image
                                alt={item.resourceTitle || 'Case Study'}
                                className="h-48 w-full object-cover"
                                src={item.heroImage || '/Consort-Blue.svg'}
                                placeholder='blur'
                                blurDataURL='/Consort-Blue.svg'
                                width={448}
                                height={360}
                            />
                            <div className="px-6 py-6">
                                <h3 className="text-body-blog font-body-blog mb-1 line-clamp-2">
                                    {item.resourceTitle || 'Untitled Case Study'}
                                </h3>
                                <p className="text-caption font-caption text-subtext-color line-clamp-2 leading-5">
                                    {item.headline}
                                </p>
                                <div className="flex w-full items-end justify-between">
                                    <div className="flex w-full items-start gap-2 pt-4 overflow-hidden">
                                        {item.globalTags?.map((tag) => (
                                            <BadgeConsort variant="warning" key={tag}>{tag}</BadgeConsort>
                                        ))}
                                    </div>
                                    <FeatherArrowRight className="text-body-xl font-body-xl text-consort-red" />
                                </div>
                            </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex w-full items-center justify-center gap-6">
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
