import { fetchAllProducts, getProductBySlug } from "./action";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { Button3 } from "@/ui/components/Button3";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import PDFButton from "@/utils/PdfButton";
import ShareButton from "@/utils/ShareButton";
import ServerTargetIndustries from "./components/ServerTargetIndustries";
import RelatedProducts from "@/components/related/RelatedProducts";
import SingleRowCompanyLogos from "@/components/SingleRowCompanyLogos";
import KeyFeature from "./components/KeyFeatures";
import RichTextPreview from "@/app/demo/RichTextPreview";
import ProductCarousel from "./components/ProductCarousel";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ScrollReveal from "./components/ScrollReveal";
import { ImageRouter } from "@/utils/imageRouter";

import EnhancedCaseStudy from "./components/EnhancedCaseStudy";

// ISR Configuration - Cache for 4 hours, but allow on-demand revalidation
export const revalidate = 14400;

// Export metadata generation function
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const product = await getProductBySlug(resolvedParams.slug);

        if (!product) {
            return {
                title: "Product Not Found",
                description: "The requested product could not be found.",
                robots: {
                    index: false,
                    follow: false,
                },
            };
        }

        const title = product.productName || "Product";
        const description = product.productOverview || product.briefDescription || product.productBrief || "Product information";

        return {
            title: `${title} | Consort`,
            description: description.length > 160 ? description.substring(0, 157) + "..." : description,
            keywords: [
                ...(product.globalTags || []),
                ...(product.category || []),
                product.productName,
            ].filter(Boolean).join(", "),
            openGraph: {
                title: title,
                description: description,
                type: "website",
                images: product.productGalleryUrls && product.productGalleryUrls.length > 0
                    ? [{ url: product.productGalleryUrls[0] }]
                    : undefined,
            },
            twitter: {
                card: "summary_large_image",
                title: title,
                description: description,
                images: product.productGalleryUrls && product.productGalleryUrls.length > 0
                    ? [product.productGalleryUrls[0]]
                    : undefined,
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: "Product | Consort",
            description: "Product information",
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}

type Props = {
    params: Promise<{ slug: string }>;
};

// Static component for client logos using pre-fetched data
export function ClientLogosSection({ clientLogos }: { clientLogos: { slug: string; label: string; imageUrl: string; }[] }) {
    if (!clientLogos || clientLogos.length === 0) {
        return null;
    }

    return (
        <SingleRowCompanyLogos
            logos={clientLogos.map(client => ({
                src: client.imageUrl,
                alt: client.label
            }))}
        />
    );
};

export async function generateStaticParams() {
    try {
        const products = await fetchAllProducts();
        // ✅ PRODUCTION: Filter out products without required fields for static generation
        const validProducts = products.filter(product =>
            product.id &&
            product.productName &&
            product.productGalleryUrls?.length > 0
        );
        return validProducts.map((product) => ({ slug: product.id }));
    } catch (error) {
        console.error('Error generating static params for portfolio:', error);
        // ✅ PRODUCTION: Return empty array to prevent build failure
        return [];
    }
}

export default async function ProductPage({ params }: Props) {
    try {
        const resolvedParams = await params;
        const product = await getProductBySlug(resolvedParams.slug);

        if (!product) {
            notFound();
        }

        // Use pre-computed industry data from build time
        const industriesData = product.targetIndustriesData || [];
        const clientLogosData = product.clientCompaniesData || [];

        // Ensure required fields have fallbacks
        const safeProduct = {
            ...product,
            productGalleryUrls: product.productGalleryUrls || [],
            globalTags: product.globalTags || [],
            keyFeatures: product.keyFeatures || [],
            marketingHighlights: product.marketingHighlights || [],
            clientCompanies: product.clientCompanies || [],
            targetIndustries: product.targetIndustries || [],
            technicalSpecifications: product.technicalSpecifications || [],
        };

        return (
            <div className="w-full max-w-[1080px] mx-auto space-y-12 bg-default-background px-4 py-6">
                {/* Product Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mobile:px-2 md:px-6 lg:px-0">
                    {/* Product Image Carousel */}
                    <ScrollReveal delay={0} immediate={true} className="rounded-md bg-neutral-50 p-4">
                        <div className="relative w-full">
                            <ProductCarousel
                                images={safeProduct.productGalleryUrls}
                                productName={safeProduct.productName}
                            />
                        </div>
                    </ScrollReveal>

                    {/* Product Details */}
                    <ScrollReveal delay={0.1} immediate={true} className="space-y-4">
                        {/* Product Title */}
                        <h1 className="lg:text-heading-2 md:text-heading-2-md mobile:text-heading-3-md font-heading-2 text-consort-blue">
                            {safeProduct.productName}
                        </h1>

                        <div className="flex w-full items-center justify-between mobile:flex-col mobile:gap-4 mobile:items-start">
                            {/* Global Tags */}
                            <div className="flex flex-wrap gap-2">
                                {safeProduct.globalTags.map((tag) => (
                                    <BadgeConsort key={tag}
                                        variant="neutral"
                                        iconRight={null}
                                    >
                                        {tag}
                                    </BadgeConsort>
                                ))}
                            </div>
                            {/* Share Button */}
                            <ShareButton />
                        </div>

                        {/* Marketing Tagline */}
                        {safeProduct.marketingTagline && (
                            <h2 className="text-body-lg font-body-lg text-subtext-color">
                                {safeProduct.marketingTagline}
                            </h2>
                        )}

                        {/* Product Overview */}
                        {safeProduct.productOverview && (
                            <h2 className="text-body-lg font-body-lg text-subtext-color">
                                {safeProduct.productOverview}
                            </h2>
                        )}

                        {/* Product Resources Quicklinks */}
                        <div className="border-t border-neutral-border pt-4 hidden lg:block" />
                        <div className="flex flex-wrap gap-2">
                            {safeProduct.brochureUrl && <PDFButton url={safeProduct.brochureUrl} />}
                            <PDFButton url="/contact?request=datasheet" />
                            <div className="border-l border-neutral-border mx-2 hidden lg:block" />
                            <Button3
                                variant="destructive-primary"
                                size="medium"
                                iconRight={<ArrowRight className="w-4 h-4" />}
                            >
                                Speak to Expert
                            </Button3>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Application Industries from Global List*/}
                {industriesData.length > 0 && (
                    <ScrollReveal
                        delay={0.25}
                        className="w-full rounded-md border border-brand-border bg-default-background px-4 py-6 shadow-sm mt-3">
                        <ServerTargetIndustries industries={industriesData} />
                    </ScrollReveal>
                )}

                {/* Product Brief Text Content*/}
                <div className="grid w-full px-6 pt-6 pb-2 gap-14 md:grid-cols-1 lg:grid-cols-[62%_auto] md:gap-8 mobile:px-2 mobile:py-6">
                    <ScrollReveal delay={0.3} className="flex lg:max-w-full lg:w-full lg:max-w-[576px] flex-col items-start gap-6 mobile:h-auto mobile:w-auto mobile:flex-none">
                        <h2 className="w-full lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm font-heading-3 text-consort-blue">
                            Product Brief
                        </h2>
                        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

                        {safeProduct.productDescription && (
                            <RichTextPreview content={safeProduct.productDescription} />
                        )}
                    </ScrollReveal>

                    {/* Product Brief Icon Grid - Key Features */}
                    {safeProduct.keyFeatures.length > 0 && (
                        <ScrollReveal delay={0.6} className="flex flex-col items-start gap-5 mobile:h-auto mobile:w-full mobile:flex-none mobile:px-0 mobile:pt-6 mobile:pb-0">
                            <span className="w-full lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3-sm font-heading-3 text-consort-blue">
                                Key Features
                            </span>
                            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
                            <div className="flex w-full grow shrink-0 basis-0 flex-wrap items-start gap-3 mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0 mobile:flex-row mobile:flex-wrap">
                                <div className="flex w-full grow shrink-0 basis-0 flex-wrap items-start gap-4">
                                    <KeyFeature type="product" features={safeProduct.keyFeatures} />
                                </div>
                            </div>
                        </ScrollReveal>
                    )}
                </div>

                {/* Product Resources */}
                <ScrollReveal delay={0.2} className="flex w-full flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 pt-4 pb-6 shadow-sm mobile:px-4 mobile:py-4">
                    <span className="text-body-bold font-body-bold text-default-font">
                        Product Resources
                    </span>
                    <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-4 mobile:flex-col mobile:flex-wrap mobile:gap-4">
                        {safeProduct.brochureUrl && <PDFButton url={safeProduct.brochureUrl} />}
                        <PDFButton url="/contact?request=datasheet" />
                        {safeProduct.caseStudyUrl && <PDFButton url={safeProduct.caseStudyUrl} />}
                        <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border mx-3 mobile:hidden md:hidden lg:flex" />
                        <Button3
                            className="mobile:h-auto mobile:grow mobile:shrink-0 mobile:basis-0 mobile:mt-1"
                            disabled={false}
                            size="medium"
                            variant="destructive-primary"
                            iconRight={<ArrowRight className="w-4 h-4" />}
                            loading={false}
                        >
                            Speak to Expert
                        </Button3>
                    </div>
                </ScrollReveal>

                {/* Company Logos from Global List - Single Row Carousel */}
                {clientLogosData.length > 0 && (
                    <ScrollReveal delay={0.4}>
                        <ClientLogosSection clientLogos={clientLogosData} />
                    </ScrollReveal>
                )}

                {/* Product Highlights */}
                {safeProduct.marketingHighlights.length > 0 && (
                    <div className="w-full max-w-[1024px] mx-auto space-y-12 px-4 py-6">
                        <ScrollReveal delay={0.2}>
                            <h2 className="text-heading-3 font-heading-3 text-consort-blue">
                                Highlights
                            </h2>
                        </ScrollReveal>

                        {safeProduct.marketingHighlights.map((highlight, index) => (
                            <ScrollReveal key={index} highlightIndex={index}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mobile:gap-8">
                                    {/* Image Column - Alternates position on md/lg, always first on mobile */}
                                    <div className={`${index % 2 !== 0 ? 'md:order-2' : 'md:order-1'} mobile:order-1`}>
                                        {highlight.visualUrls && highlight.visualUrls[0] && (
                                            <Image
                                                alt="Product Highlight"
                                                className="w-full h-auto lg:max-h-[380px] rounded-md md:p-6 mobile:p-4 bg-neutral-50 object-contain md:max-h-[320px] mobile:max-h-[260px]"
                                                src={ImageRouter.forHighlight(highlight.visualUrls[0])}
                                                width={500}
                                                height={400}
                                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgZmlsbD0iI2YwZjBmMCIgaGVpZ2h0PSIxMjgiLz48L3N2Zz4="
                                                placeholder="blur"
                                            />
                                        )}
                                    </div>

                                    {/* Text Column - Alternates position on md/lg, always second on mobile */}
                                    <div className={`space-y-4 ${index % 2 !== 0 ? 'md:order-1' : 'md:order-2'} mobile:order-2`}>
                                        <h3 className="text-heading-4 font-heading-4 text-consort-blue">
                                            {highlight.headline}
                                        </h3>
                                        <p className="text-body-lg font-body !leading-snug text-subtext-color leading-relaxed">
                                            {highlight.description}
                                        </p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}

                {/* Technical Specifications */}
                {safeProduct.technicalSpecifications && safeProduct.technicalSpecifications.length > 0 && (
                    <div className="flex w-full max-w-[1024px] flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-9 shadow-sm mobile:flex-col mobile:flex-nowrap mobile:gap-6 mobile:rounded-none mobile:border-none mobile:bg-transparent mobile:px-3 mobile:py-0 mobile:shadow-none">
                        <ScrollReveal delay={0.2}>
                            <div className="flex w-full items-center gap-1 mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-1">
                                <h2 className="lg:text-heading-3-md md:text-heading-3-md mobile:text-heading-3-sm font-heading-3 text-left text-consort-blue ml-2">
                                    Technical Specifications
                                </h2>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={0.3}>
                            <div className="flex !w-full max-w-[1024px] items-start gap-6 px-1 py-1 mobile:flex-col mobile:flex-nowrap mobile:gap-2">
                                <div className="w-full flex grow shrink-0 basis-0 flex-col items-start gap-2">
                                    {safeProduct.technicalSpecifications.map((spec: any, index: number) => (
                                        <div key={spec.id || index} className={`flex w-full max-w-[1024px] items-start gap-2 ${index > 0 ? 'border-t border-solid border-neutral-border' : ''} px-1 pt-3 pb-2 mobile:flex-col mobile:flex-nowrap mobile:gap-2 mobile:px-1 mobile:pt-3 mobile:pb-2`}>
                                            <span className="max-w-[256px] !leading-snug grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font mobile:h-auto mobile:w-full mobile:flex-none mobile:text-caption-bold mobile:font-caption-bold">
                                                {spec.parameter}
                                            </span>
                                            <div className="flex max-w-[384px] grow shrink-0 basis-0 flex-col items-start gap-2">
                                                <span className="text-body font-body text-subtext-color mobile:h-auto mobile:w-full mobile:flex-none mobile:text-caption mobile:font-caption">
                                                    {spec.specification}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                )}

                {/* Related Products */}
                {safeProduct.globalTags.length > 0 && (
                    <ScrollReveal delay={0.3}>
                        <RelatedProducts tags={safeProduct.globalTags} />
                    </ScrollReveal>
                )}

                {/* Case Study Section */}
                {safeProduct.globalTags.length > 0 && (
                    <ScrollReveal delay={0.3}>
                        <EnhancedCaseStudy globalTags={safeProduct.globalTags} productName={safeProduct.productName} />
                    </ScrollReveal>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error loading product page:', error);
        notFound();
    }
}



