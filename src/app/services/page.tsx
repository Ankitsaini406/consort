import React from 'react';
import ServicesGrid from '@/components/ServicesGrid';
import { SERVICES_DATA, validateServicesIntegrity } from '@/config/servicesConfig';

// ✅ BUILD-TIME: Validate services data integrity
if (!validateServicesIntegrity()) {
    throw new Error('CRITICAL: Services data validation failed! Check console for details.');
}

export const metadata = {
    title: 'Services - Comprehensive Communication Solutions | Consort Digital',
    description: 'Professional communication services including design & engineering, coverage analysis, integration, installation, project management, and ongoing support.',
    keywords: [
        'Consort Digital',
        'mission critical communication services',
        'design engineering',
        'coverage analysis',
        'integration services',
        'project management',
        'support services',
        'TETRA installation',
        'MCX deployment',
        'radio network design',
    ],
    openGraph: {
        title: 'Services - Mission-Critical Communication Solutions | Consort Digital',
        description: 'Comprehensive communication services from design to ongoing support for mission-critical operations.',
        url: 'https://www.consortdigital.com/services',
        siteName: 'Consort Digital',
        type: 'website',
        images: [
            {
                url: '/consort_OG.jpg',
                width: 1200,
                height: 630,
                alt: 'Consort Digital services – mission-critical communication solutions',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Services - Mission-Critical Communication Solutions | Consort Digital',
        description: 'Professional communication services for mission-critical operations – from design to ongoing support.',
        images: ['/consort_OG.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: '/services',
    },
};

export default function ServicesPage() {
    // ✅ SSG: Static data passed at build time
    return (
        <div className="flex w-full mx-auto max-w-[1024px] flex-col items-center gap-1 py-12 px-4">
            <ServicesGrid services={SERVICES_DATA} />
        </div>
    );
} 