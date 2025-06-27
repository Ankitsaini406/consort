import { Metadata } from "next";
import { fetchAllIndustries, getIndustryBySlug, getSolutionsByIndustry } from "./action";
import { ArrowRight, ArrowUpRight, FileText } from "react-feather";
import Image from "next/image";
import Link from "next/link";
import { Button3 } from "@/ui";
import React from "react";
import ScrollReveal from "@/app/portfolio/[slug]/components/ScrollReveal";
import { ClientLogosSection } from "@/app/portfolio/[slug]/page";
import PDFButton from "@/utils/PdfButton";
import KeyFeature from "@/app/portfolio/[slug]/components/KeyFeatures";
import { BadgeConsort } from "@/ui";
import { getAllClientLogos, getClientLogosByNames } from "@/utils/getSSGClientLogos";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const industry = await getIndustryBySlug(slug);
    
    if (!industry) {
        return {
            title: 'Industry Not Found - MCX ONE™ by Consort Digital',
            description: 'The requested industry page could not be found.',
        };
    }

    return {
        title: `${industry.industryName} - MCX ONE™ by Consort Digital`,
        description: industry.industryOverview || industry.industryBriefDescription || `Discover ${industry.industryName} solutions and services.`,
        openGraph: {
            title: `${industry.industryName} - MCX ONE™ by Consort Digital`,
            description: industry.industryOverview || industry.industryBriefDescription || `Discover ${industry.industryName} solutions and services.`,
            images: industry.industryImageUrl ? [industry.industryImageUrl] : undefined,
        },
    };
}

export async function generateStaticParams() {
    try {
        const industries = await fetchAllIndustries();
        // Filter out draft industries to match menu behavior
        const publishedIndustries = industries.filter(industry => !industry.isDraft);
        
        // Validate slugs to prevent 404s
        const validIndustries = publishedIndustries.filter(industry => 
            industry.slug && 
            industry.slug.trim() !== '' &&
            industry.industryName && 
            industry.industryName.trim() !== ''
        );
        
        console.log(`[generateStaticParams] Generated ${validIndustries.length} industry routes`);
        return validIndustries.map((industry) => ({ slug: industry.slug }));
    } catch (error) {
        console.error('[generateStaticParams] Failed to generate industry routes:', error);
        // Return empty array to prevent build failure
        return [];
    }
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    const industry = await getIndustryBySlug(slug);
    const solutions = await getSolutionsByIndustry(slug); // Fetch solutions for this industry

    if (!industry) {
        return <div>Industry not found</div>;
    }

    // Fetch client logos for industry leaders
    const allClientLogos = await getAllClientLogos();
    const clients = getClientLogosByNames(industry.industryLeaders || [], allClientLogos);

    return (
        <div className="flex w-full mx-auto max-w-[1024px] flex-col items-center gap-1 py-12 px-4">
            {/* Hero Section */}
            <div className="relative lg:h-96 md:h-80 mobile:h-48 w-full max-w-[1024px]">
                <Image
                    alt={industry.industryName}
                    fill
                    className="flex-none rounded-md object-cover -z-[1]"
                    src={industry.industryImageUrl || "/placeholder-industry.jpg"}
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgZmlsbD0iI2YwZjBmMCIgaGVpZ2h0PSIxMjgiLz48L3N2Zz4="
                    placeholder="blur"
                />
                <h1 className="w-auto whitespace-pre absolute lg:bottom-6 md:bottom-4 mobile:bottom-4 left-1/2 -translate-x-1/2 text-body mobile:text-body-bold font-body-xl text-white text-center backdrop-blur-md rounded-lg px-4 py-2">
                    {industry.industryName}
                </h1>
            </div>

            {/* Industry Details */}
            <div className="flex w-full max-w-[1024px] flex-col items-center gap-6 pt-8">
                {industry.industryIconUrl && (
                    <div className="flex w-full items-center justify-center mt-4">
                        <Image
                            alt={industry.industryName}
                            src={industry.industryIconUrl}
                            width={100}
                            height={100}
                            className="md:w-20 mobile:h-16 mx-auto"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgZmlsbD0iI2YwZjBmMCIgaGVpZ2h0PSIxMjgiLz48L3N2Zz4="
                            placeholder="blur"
                        />
                    </div>
                )}
                
                <h1 className="lg:text-heading-1 md:text-heading-1-md mobile:text-heading-1-sm font-heading-1 text-consort-blue text-center">
                    {industry.industryName}
                </h1>
                
                <h2 className="max-w-[768px] lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm font-body-xl text-subtext-color text-center mobile:px-4">
                    {industry.industryOverview}
                </h2>

                {/* Stats */}
                {industry.industryStatistics && industry.industryStatistics.length > 0 && (
                    <div className="flex w-full flex-col items-center justify-center my-4">
                        <div className="flex w-full max-w-[576px] flex-wrap mobile:flex-col justify-center gap-6">
                            {industry.industryStatistics.map((stat: any, i: number) => (
                                <React.Fragment key={i}>
                                    <div className="flex max-w-[176px] mobile:max-w-full flex-col items-center gap-1.5">
                                        <h3 className="lg:text-heading-3 md:text-heading-3-md mobile:text-heading-3 font-heading-3 text-consort-blue">
                                            {stat.value}
                                        </h3>
                                        <p className="text-body font-body text-subtext-color !leading-tight text-center">
                                            {stat.description}
                                        </p>
                                    </div>
                                    {i < industry.industryStatistics.length - 1 && (
                                        <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border mobile:hidden" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features Section */}
                <div className="flex w-full flex-col items-center gap-6 rounded-md bg-neutral-50 shadow px-12 mobile:px-3 pt-10 pb-6">
                    <h3 className="w-full font-heading-3 lg:text-heading-3-md md:text-heading-3-md mobile:text-heading-3-sm text-consort-blue text-center">
                        {industry.industryDescription}
                    </h3>
                    
                    <p className="max-w-[768px] text-body-lg font-body-lg mobile:text-body mobile:leading-snug text-subtext-color text-center mobile:px-2">
                        {industry.industryBriefDescription}
                    </p>

                    {/* Key Features */}
                    {industry.industryFeatures && industry.industryFeatures.length > 0 && (
                        <div className="flex w-full flex-wrap items-start gap-4 mt-2 mobile:gap-3">
                            <KeyFeature type="industry" features={industry.industryFeatures} />
                        </div>
                    )}

                    {/* Product Resources */}
                    <div className="flex w-full flex-col items-center gap-4 rounded-md px-4 pt-4 pb-6 mobile:px-4 mobile:py-4">
                        <span className="text-body-bold font-body-bold text-default-font">
                            Resources for {industry.industryName}
                        </span>
                        <div className="flex w-full flex-wrap items-center justify-center gap-2 mobile:flex-col mobile:gap-3">
                            {industry.brochureUrl && <PDFButton url={industry.brochureUrl} />}
                            
                            {industry.caseStudyUrl && <PDFButton url={industry.caseStudyUrl} />}
                            <div className="hidden mobile:flex w-full h-px bg-neutral-border my-2" />
                            <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border mx-3 mobile:hidden" />
                            <Button3
                                className="mobile:w-full"
                                disabled={false}
                                variant="destructive-primary"
                                iconRight={<ArrowRight />}
                                loading={false}
                            // onClick={() => router.push('/cta')}
                            >
                                Speak to Expert
                            </Button3>
                        </div>
                    </div>
                </div>

                {/* Company Logos */}
                {clients && clients.length > 0 && (
                    <ClientLogosSection 
                        clientLogos={clients.map(client => ({
                            slug: client.slug,
                            label: client.label,
                            imageUrl: client.imageUrl
                        }))}
                    />
                )}

                {/* Dynamic Solutions Section */}
                {solutions && solutions.length > 0 && (
                    <div className="flex w-full flex-col items-start gap-12 mobile:gap-6 rounded-md p-8 mobile:p-3 my-6 bg-neutral-50 shadow">
                        <h4 className="w-full text-heading-3 whitespace-pre-line font-heading-3 lg:text-heading-3-md md:text-heading-3-md mobile:text-heading-3-sm text-consort-blue text-center">
                            Strategic Solutions for {industry.industryName}
                        </h4>

                        {/* Solutions Container */}
                        <div className="w-full">
                            <div className="w-full grid grid-cols-1 gap-6 mobile:gap-4">
                                {solutions.map((solution: any) => (
                                    <Link
                                        key={solution.id}
                                        href={`/solution/${solution.slug}`}
                                        className="group flex w-full lg:min-w-[320px] mobile:min-w-[260px] items-center overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-consort-blue/20 bg-white mobile:h-auto mobile:w-full mobile:flex-col mobile:flex-nowrap mobile:gap-0"
                                    >
                                        {/* Image Section */}
                                        <div className="w-full overflow-hidden h-80 basis-[60%] mobile:h-32 mobile:w-full flex-shrink-0">
                                            <Image
                                                alt={solution.solutionName || "Solution"}
                                                src={solution.heroImage || "/placeholder-solution.jpg"}
                                                width={280}
                                                height={192}
                                                className="h-full w-full object-cover scale-[1.02] transition-all duration-300 ease-out group-hover:scale-[1.0]"
                                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgZmlsbD0iI2YwZjBmMCIgaGVpZ2h0PSIxMjgiLz48L3N2Zz4="
                                                placeholder="blur"
                                            />
                                        </div>

                                        {/* Content Section */}
                                        <div className="w-full relative flex flex-1 flex-col items-start !h-full justify-end px-8 py-6 mobile:w-full mobile:px-6 mobile:py-5">
                                            <div className="flex w-full flex-col items-start justify-between gap-2">
                                                {/* Solution Name */}
                                                <h3 className="w-full lg:text-3xl md:text-heading-3-md mobile:text-heading-4-sm font-heading-3 text-consort-blue -tracking-[0.03em] group-hover:text-consort-red transition-colors">
                                                    {solution.solutionName}
                                                </h3>
                                                
                                                {/* Solution Headline */}
                                                <span className="w-full text-caption font-caption text-subtext-color -tracking-[0.01em] leading-snug mb-2">
                                                    {solution.headline || solution.solutionOverview}
                                                </span>
                                                
                                                {/* Global Tags */}
                                                {solution.globalTags && solution.globalTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {solution.globalTags.slice(0, 3).map((tag: string, index: number) => (
                                                            <BadgeConsort
                                                            className="h-5"
                                                             key={index}>
                                                                {tag}
                                                            </BadgeConsort>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="absolute top-7 right-7 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-consort-red duration-300 mobile:hidden">
                                                <ArrowUpRight className="text-heading-3 text-consort-blue group-hover:text-consort-red duration-300" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
