import React, { Suspense } from "react";
import { generateStaticPortfolioData, StaticPortfolioData } from "./action";
import PortfolioClientWrapper from "./components/PortfolioClientWrapper";
import { Metadata } from "next";
import { PORTFOLIO_TABS } from "@/config/portfolioConfig";

// ISR Configuration - Cache for 4 hours, but allow on-demand revalidation
export const revalidate = 14400;

// ✅ PRODUCTION: Add proper metadata for SEO
export const metadata: Metadata = {
    title: "Product Portfolio | Consort Digital - Mission-Critical Communication Solutions",
    description: "Explore our comprehensive portfolio of rugged devices, apps, platforms, networks, and industry extensions. Built on open standards for mission-critical operations.",
    keywords: [
        'Consort Digital',
        'product portfolio',
        'MCX devices',
        'TETRA LTE 5G solutions',
        'rugged devices',
        'mission critical communication',
        'public safety equipment',
        'enterprise solutions',
        'dispatch console',
        'mobile radio systems',
    ],
    openGraph: {
        title: "Product Portfolio | Consort Digital",
        description: "Integrated ecosystem of hardware, software, and network solutions for mission-critical operations.",
        url: 'https://www.consortdigital.com/portfolio',
        siteName: 'Consort Digital',
        type: "website",
        images: [
            {
                url: '/consort_OG.jpg',
                width: 1200,
                height: 630,
                alt: 'Consort Digital product portfolio – mission-critical communication solutions',
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Product Portfolio | Consort Digital",
        description: "Mission-critical communication solutions portfolio – devices, platforms, and networks.",
        images: ['/consort_OG.jpg'],
    },
};

// Use shared portfolio tabs configuration
const tabMetadata = PORTFOLIO_TABS;

const caseStudies = {
    items: [
        { image: "https://res.cloudinary.com/subframe/image/upload/v1747756912/uploads/12970/sfmokcbeuk8r2ljvfzh2.avif", title: "TETRA Radio Use in Metro Trains", description: "Case study for TETRA radio.", url: "/case-studies/oil-rig" },
        { image: "https://res.cloudinary.com/subframe/image/upload/v1747759080/uploads/12970/ungklbj1eovabr3qlpuq.avif", title: "Mobile Radio in Multiple Metros", description: "Case study for mobile radio.", url: "/case-studies/oil-rig" },
        { image: "https://res.cloudinary.com/subframe/image/upload/v1747848163/uploads/12970/ejamcjl6w1pulyubod5y.avif", title: "Mobile Radio for Mass Transit", description: "Case study for mass transit.", url: "/case-studies/oil-rig" }
    ],
};

const companyLogos = [
    { src: "/logos/ESSAR.jpg", alt: "Logo 1" },
    { src: "/logos/OPAL.webp", alt: "Logo 2" },
    { src: "/logos/Suzuki.webp", alt: "Logo 3" },
    { src: "/logos/BARC.webp", alt: "Logo 4" },
    { src: "/logos/adani.webp", alt: "Logo 5" },
    { src: "/logos/Shell.webp", alt: "Logo 6" },
    { src: "/logos/Tata.webp", alt: "Logo 7" },
    { src: "/logos/jsw.png", alt: "Logo 8" },
    { src: "/logos/Nayara.webp", alt: "Logo 9" },
    { src: "/logos/alstom1.png", alt: "Logo 10" },
    { src: "/logos/nagpur.jpg", alt: "Logo 11" },
    { src: "/logos/siemens1.png", alt: "Logo 12" },
    { src: "/logos/ongc.jpg", alt: "Logo 13" },
    { src: "/logos/crrc2.png", alt: "Logo 14" },
    { src: "/logos/mmrda.webp", alt: "Logo 15" },
    { src: "/logos/mauritiusmetro.webp", alt: "Logo 16" },
    { src: "/logos/noida.svg", alt: "Logo 17" },
    { src: "/logos/caf.png", alt: "Logo 18" },
];

// ✅ PRODUCTION: Proper TypeScript interfaces
interface TabMetadata {
    id: string;
    title: string;
    heroTitle: string;
    description: string;
    image: string;
    stats: { value: string; label: string; }[];
}

interface PortfolioItem {
    image: string;
    title: string;
    description: string;
    url: string;
    categoryId: string;
}

interface CaseStudyItem {
    image: string;
    title: string;
    description: string;
    url: string;
}

interface CompanyLogo {
    src: string;
    alt: string;
}

// Loading component for Suspense
function PortfolioLoading() {
    return (
        <div className="w-full min-h-screen bg-default-background flex items-center justify-center">
            <div className="text-center">
                <div className="animate-pulse h-8 bg-neutral-200 rounded w-64 mx-auto mb-4"></div>
                <div className="animate-pulse h-4 bg-neutral-200 rounded w-48 mx-auto"></div>
            </div>
        </div>
    );
}

export default async function PortfolioPage() {
    try {
        // ✅ BUILD-TIME: Generate static data at build time for SSG
        // This fetches latest products during build and creates static content
        const staticData = await generateStaticPortfolioData();
        
        // ✅ CRITICAL FIX: Handle the case where staticData might be null/undefined
        if (!staticData || !staticData.productsByCategory) {
            console.warn('[PortfolioPage] 🔧 Build-time data not available, using fallback');
            return (
                <div className="w-full min-h-screen bg-default-background flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Portfolio Coming Soon</h1>
                        <p className="text-body text-subtext-color">Our product portfolio is being updated. Please check back soon.</p>
                    </div>
                </div>
            );
        }
        
        const { productsByCategory, availableCategories } = staticData;
        console.log(`[PortfolioPage] 🎯 Using build-time data: ${staticData.productCount || 0} products from ${staticData.buildTimestamp || 'unknown'}`);

        // ✅ PRODUCTION: Ensure we have data before proceeding
        if (!availableCategories || !availableCategories.length) {
            return (
                <div className="w-full min-h-screen bg-default-background flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Portfolio Coming Soon</h1>
                        <p className="text-body text-subtext-color">Our product portfolio is being updated. Please check back soon.</p>
                    </div>
                </div>
            );
        }

        // Create dynamic tab data by combining static metadata with dynamic products
        const dynamicTabData: Record<string, TabMetadata & { items: any[] }> = {};
        
        // Only include available categories with validation
        availableCategories.forEach((categoryId: string) => {
            const metadata = tabMetadata[categoryId as keyof typeof tabMetadata];
            if (metadata) {
                dynamicTabData[categoryId] = {
                    ...metadata,
                    items: productsByCategory[categoryId] || [],
                };
            }
        });

        // Generate tabs for available categories only
        const availableTabs = availableCategories
            .map((categoryId: string) => {
                const metadata = tabMetadata[categoryId as keyof typeof tabMetadata];
                return metadata ? {
                    id: categoryId,
                    title: metadata.title,
                    image: metadata.image,
                } : null;
            })
            .filter((tab): tab is { id: string; title: string; image: string; } => tab !== null);

        // ✅ PRODUCTION: Ensure we have at least one tab
        if (!availableTabs.length) {
            throw new Error('No valid portfolio categories found');
        }

        return (
            <Suspense fallback={<PortfolioLoading />}>
                <PortfolioClientWrapper
                    tabData={dynamicTabData}
                    tabs={availableTabs}
                    caseStudies={caseStudies}
                    companyLogos={companyLogos}
                />
            </Suspense>
        );
    } catch (error) {
        console.error('Error loading portfolio page:', error);
        // ✅ PRODUCTION: Graceful fallback UI
        return (
            <div className="w-full min-h-screen bg-default-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Portfolio Unavailable</h1>
                    <p className="text-body text-subtext-color">We're experiencing technical difficulties. Please try again later.</p>
                </div>
            </div>
        );
    }
} 