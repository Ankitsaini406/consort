"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CaseStudiesSection from "@/components/CaseStudySection";
import SingleRowCompanyLogos from "@/components/SingleRowCompanyLogos";
import RelatedProducts from "@/components/related/RelatedLayout";
import ProductCardSkeleton from "@/components/related/ProductCardSkeleton";
import { ImageRouter } from "@/utils/imageRouter";
import { useRouter, useSearchParams } from "next/navigation";

interface PortfolioItem {
    image: string;
    title: string;
    description: string;
    url: string;
    categoryId: string;
}

interface TabData {
    id: string;
    title: string;
    heroTitle: string;
    description: string;
    image: string;
    stats: { value: string; label: string; }[];
    items: PortfolioItem[];
}

interface Tab {
    id: string;
    title: string;
    image: string;
}

interface CaseStudies {
    items: { image: string; title: string; description: string; url: string; }[];
}

interface CompanyLogo {
    src: string;
    alt: string;
}

interface PortfolioClientWrapperProps {
    tabData: Record<string, TabData>;
    tabs: Tab[];
    caseStudies: CaseStudies;
    companyLogos: CompanyLogo[];
}

// Scroll reveal animation component
const ScrollReveal = ({
    children,
    delay = 0,
    className = "",
    duration = 0.8,
    blurAmount = 8
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    duration?: number;
    blurAmount?: number;
}) => {
    return (
        <motion.div
            className={`${className} relative`}
            initial={{
                opacity: 0,
                y: 50,
                filter: `blur(${blurAmount}px)`
            }}
            whileInView={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)"
            }}
            viewport={{ once: true, margin: "-25%" }}
            transition={{
                duration: duration,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

const TabContent = ({
    categoryId,
    productsByCategory,
    isLoading = false
}: {
    categoryId: string;
    productsByCategory: Record<string, PortfolioItem[]>;
    isLoading?: boolean;
}) => {
    // Simple product filtering with deduplication for "All" tab
    const filteredProducts = useMemo(() => {
        if (categoryId === 'all') {
            // Get all products and remove duplicates by URL (unique identifier)
            const allProducts = Object.values(productsByCategory).flat();
            const uniqueProducts = allProducts.filter((product, index, array) => 
                array.findIndex(p => p.url === product.url) === index
            );
            return uniqueProducts;
        }
        return productsByCategory[categoryId] || [];
    }, [categoryId, productsByCategory]);

    // Show skeleton while loading
    if (isLoading) {
        return (
            <ProductCardSkeleton 
                rows={{ sm: 2, md: 2, lg: 3 }}
                title={null}
                showPagination={true}
                paginationPosition="top"
            />
        );
    }

    return (
        <motion.div
            key={categoryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
        >
            <RelatedProducts
                title={null}
                items={filteredProducts}
                rows={{ sm: 2, md: 2, lg: 3 }}
                paginationPosition="top"
            />
        </motion.div>
    );
};

export default function PortfolioClientWrapper({
    tabData,
    tabs,
    caseStudies,
    companyLogos
}: PortfolioClientWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ✅ PRODUCTION: Safe tab initialization with fallback
    const urlTab = searchParams.get('tab');
    const validTab = urlTab && tabs.some(tab => tab.id === urlTab) ? urlTab : (tabs.length > 0 ? tabs[0].id : 'all');
    const [activeTab, setActiveTab] = useState(validTab);
    const [isTabChanging, setIsTabChanging] = useState(false);

    const activeContent = tabData[activeTab];

    // Update URL when tab changes with loading state
    const handleTabChange = (tabId: string) => {
        if (tabId === activeTab) return;
        
        setIsTabChanging(true);
        setActiveTab(tabId);
        router.push(`/portfolio?tab=${tabId}`, { scroll: false });
        
        // Brief loading state for smooth UX
        setTimeout(() => {
            setIsTabChanging(false);
        }, 300);
    };

    // ✅ PRODUCTION: Enhanced error handling with fallback content
    if (!activeContent) {
        return (
            <div className="w-full min-h-screen bg-default-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Content Loading</h1>
                    <p className="text-body text-subtext-color">Portfolio content is being loaded...</p>
                </div>
            </div>
        );
    }

    // ✅ PRODUCTION: Validate required props
    if (!tabs.length || !Object.keys(tabData).length) {
        return (
            <div className="w-full min-h-screen bg-default-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Portfolio Unavailable</h1>
                    <p className="text-body text-subtext-color">Portfolio data is not available at this time.</p>
                </div>
            </div>
        );
    }

    // Create productsByCategory for TabContent
    const productsByCategory = Object.keys(tabData).reduce((acc, key) => {
        acc[key] = tabData[key].items;
        return acc;
    }, {} as Record<string, PortfolioItem[]>);

    return (
        <div className="w-full min-h-screen bg-default-background relative">
            <div className="max-w-[1024px] mx-auto py-12 px-4 relative">
                {/* Dynamic Hero Section */}
                <ScrollReveal className="flex flex-col items-center gap-6 pb-12 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="flex flex-col items-center gap-4"
                        >
                            {activeContent.id !== 'all' && (
                                <Image
                                    alt={activeContent.title}
                                    src={ImageRouter.forPortfolio(activeContent.image)}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 mobile:h-14 mobile:w-14 mx-auto object-contain"
                                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgZmlsbD0iI2YwZjBmMCIgaGVpZ2h0PSIxMjgiLz48L3N2Zz4="
                                    placeholder="blur"
                                />
                            )}
                            <h1 className="lg:text-heading-1 md:text-heading-1-md mobile:text-heading-1-sm font-heading-1 text-consort-blue text-center">{activeContent.heroTitle}</h1>
                            <p className="lg:max-w-[768px] md:max-w-[80%] lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm font-body-xl text-subtext-color text-center mobile:px-4">
                                {activeContent.description}
                            </p>
                            {/* Stats */}
                            <div className="flex w-full flex-col items-center justify-center pt-4">
                                <div className="flex w-full max-w-[576px] flex-wrap justify-center gap-6">
                                    {activeContent.stats.map((stat, i) => (
                                        <React.Fragment key={i}>
                                            <div className="flex max-w-[176px] flex-col items-center gap-1.5">
                                                <h3 className="lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm font-heading-3 text-consort-blue">{stat.value}</h3>
                                                <p className="text-body font-body text-subtext-color !leading-tight text-center">{stat.label}</p>
                                            </div>
                                            {i < activeContent.stats.length - 1 && (
                                                <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border mobile:hidden" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </ScrollReveal>

                <ScrollReveal>
                    {/* Tab Navigation */}
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-2 mb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative flex flex-col items-center justify-end gap-3 lg:p-4 md:p-2 mobile:py-2 mobile:px-1 transition-all duration-200 ${activeTab === tab.id
                                    ? 'text-consort-red'
                                    : 'text-subtext-color hover:bg-neutral-50 hover:text-consort-red'
                                    }`}
                            >
                                <Image src={ImageRouter.forPortfolio(tab.image)} alt={tab.title} width={36} height={36}
                                    className="h-9 w-9 mobile:h-7 mobile:w-7 object-contain"
                                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgZmlsbD0iI2YwZjBmMCIgaGVpZ2h0PSIxMjgiLz48L3N2Zz4="
                                    placeholder="blur"
                                />
                                <p className="whitespace-nowrap text-body font-caption-bold">{tab.title}</p>
                                {activeTab === tab.id && (
                                    <motion.div
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-consort-red"
                                        layoutId="underline"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="w-full">
                        <TabContent categoryId={activeTab} productsByCategory={productsByCategory} isLoading={isTabChanging} />
                    </div>
                </ScrollReveal>

                {/* Lower Sections */}
                <ScrollReveal className="my-16">
                    <CaseStudiesSection title="Portfolio Case Studies" items={caseStudies.items} />
                </ScrollReveal>
                <ScrollReveal className="my-10">
                    <SingleRowCompanyLogos logos={companyLogos} title="Trusted By Industry Leaders" />
                </ScrollReveal>
            </div>
        </div>
    );
} 