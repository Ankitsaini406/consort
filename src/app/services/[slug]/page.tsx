import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button3 } from '@/ui/components/Button3';
import { BadgeConsort } from '@/ui/components/BadgeConsort';
import { FeatherArrowRight, FeatherCheckCheck, FeatherPhone } from '@subframe/core';
import { SERVICES_DATA, getServiceSlugs, getServiceBySlug } from '@/config/servicesConfig';
import SafeImage from '@/components/SafeImage';

// Using unified service configuration

// Generate static params for all services
export async function generateStaticParams() {
    return getServiceSlugs().map((slug) => ({
        slug: slug,
    }));
}

// Generate comprehensive metadata for each service
export async function generateMetadata({ params }: { params: { slug: string } }) {
    const service = getServiceBySlug(params.slug);
    
    if (!service) {
        return {
            title: 'Service Not Found | Consort',
            description: 'The requested service could not be found.',
        };
    }

    const serviceUrl = `https://consort.com/services/${service.slug}`;
    const pageTitle = `${service.title} - Mission-Critical Services | Consort`;
    const metaDescription = `${service.overview.substring(0, 155)}...`;

    return {
        title: pageTitle,
        description: metaDescription,
        keywords: `${service.title.toLowerCase()}, mission critical communication, ${service.benefits.slice(0, 3).join(', ').toLowerCase()}, consort services`,
        openGraph: {
            title: pageTitle,
            description: metaDescription,
            type: 'website',
            url: serviceUrl,
            images: [
                {
                    url: service.heroImage.startsWith('http') ? service.heroImage : `https://consort.com${service.heroImage}`,
                    width: 1200,
                    height: 630,
                    alt: `${service.title} - Mission-Critical Communication Service`,
                }
            ],
            siteName: 'Consort',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: metaDescription,
            images: [service.heroImage.startsWith('http') ? service.heroImage : `https://consort.com${service.heroImage}`],
            creator: '@ConsortComms',
            site: '@ConsortComms',
        },
        alternates: {
            canonical: serviceUrl,
        },
        robots: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
        other: {
            'application-name': 'Consort Services',
            'apple-mobile-web-app-title': 'Consort Services',
            'format-detection': 'telephone=no',
        },
    };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
    const service = getServiceBySlug(params.slug);

    if (!service) {
        console.error(`[ServicePage] Service not found for slug: ${params.slug}`);
        notFound();
    }

    return (
        <div className="flex w-full mx-auto max-w-[1024px] flex-col items-center gap-1 py-12 px-4">
            {/* Hero Section */}
            <div className="relative lg:h-96 md:h-80 mobile:h-48 w-full max-w-[1024px] mb-8">
                <SafeImage
                    alt={service.title}
                    fill
                    className="flex-none rounded-md object-cover -z-[1]"
                    src={service.heroImage}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4K"
                />
                <div className="absolute inset-0 bg-black/40 rounded-md" />
                <div className="absolute lg:bottom-6 md:bottom-4 mobile:bottom-4 left-1/2 -translate-x-1/2 text-center">
                    {/* <BadgeConsort className="mb-3">Services</BadgeConsort> */}
                    <h1 className="lg:text-heading-2 md:text-heading-2-md mobile:text-heading-2-sm font-heading-2 text-white text-center backdrop-blur-sm">
                        {service.title}
                    </h1>
                </div>
            </div>

            {/* Overview Section */}
            <div className="flex w-full flex-col items-center gap-6 mb-8">
                <h2 className="lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm font-heading-3 text-consort-blue text-center">
                    Overview
                </h2>
                <p className="max-w-[768px] lg:text-body-lg md:text-body-lg mobile:text-body font-body-lg text-subtext-color text-center leading-relaxed">
                    {service.overview}
                </p>
                <p className="max-w-[768px] lg:text-body-lg md:text-body-lg mobile:text-body font-body-lg text-subtext-color text-center leading-relaxed">
                    {service.description}
                </p>
            </div>

            {/* Benefits Section */}
            <div className="flex w-full flex-col items-center gap-6 rounded-md bg-neutral-100 px-6 mobile:px-4 py-10 mb-8">
                <h3 className="lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm font-heading-3 text-consort-blue text-center">
                    Key Benefits
                </h3>
                <div className="w-full max-w-[768px]">
                    <ul className="space-y-4">
                        {service.benefits.map((benefit: string, index: number) => (
                            <li key={index} className="flex items-start">
                                <FeatherCheckCheck className="w-6 h-6 text-consort-blue mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-body font-body text-subtext-color leading-relaxed">
                                    {benefit}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 