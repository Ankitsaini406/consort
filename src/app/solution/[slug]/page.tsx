import { Metadata } from "next";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { Button3 } from "@/ui/components/Button3";
import { fetchAllSolutions, getSolutionBySlug } from "./action";
import { FeatherArrowRight } from "@subframe/core";
import Image from "next/image";
import PDFButton from "@/utils/PdfButton";
import ShareButton from "@/utils/ShareButton";

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const solution = await getSolutionBySlug(params.slug);
    
    if (!solution) {
        return {
            title: 'Solution Not Found - MCX ONE™ by Consort Digital',
            description: 'The requested solution could not be found.',
        };
    }

    return {
        title: `${solution.solutionTitle} - MCX ONE™ by Consort Digital`,
        description: solution.description || `Discover ${solution.solutionTitle} and explore our innovative solutions.`,
        openGraph: {
            title: `${solution.solutionTitle} - MCX ONE™ by Consort Digital`,
            description: solution.description || `Discover ${solution.solutionTitle} and explore our innovative solutions.`,
            images: solution.heroImage ? [solution.heroImage] : undefined,
        },
    };
}

export async function generateStaticParams() {
    try {
        const solutions = await fetchAllSolutions();
        // ✅ PRODUCTION: Filter out solutions without required fields for static generation
        const validSolutions = solutions.filter(solution =>
            solution.slug &&
            solution.solutionTitle &&
            solution.heroImage
        );
        return validSolutions.map((solution) => ({ slug: solution.slug }));
    } catch (error) {
        console.error('Error generating static params for solutions:', error);
        // ✅ PRODUCTION: Return empty array to prevent build failure
        return [];
    }
}

export default async function SolutionPage({ params }: Props) {
    try {
        const solution = await getSolutionBySlug(params.slug);

        if (!solution) {
            return (
                <div className="flex w-full max-w-[1024px] mx-auto flex-col items-center justify-center min-h-[400px] px-6 py-6">
                    <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Solution Not Found</h1>
                    <p className="text-body text-subtext-color">The requested solution could not be found.</p>
                </div>
            );
        }

        // ✅ PRODUCTION: Ensure required fields have fallbacks
        const safeSolution = {
            ...solution,
            globalTags: solution.globalTags || [],
            contentSections: solution.contentSections || [],
        };

        return (
            <div className="flex w-full max-w-[1024px] mx-auto flex-col items-start gap-6 rounded-md px-6 py-6 mobile:border mobile:border-solid mobile:border-neutral-border mobile:bg-transparent mobile:px-2 mobile:pt-0 mobile:pb-4">
                <div className="flex w-full flex-col items-start gap-2 px-1 lg:pt-12 md:pt-8 mobile:px-1 mobile:pt-8 mobile:pb-1">
                    <div className="flex w-full flex-col items-start justify-center gap-4">
                        <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-6">
                            <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-2 px-1 py-1">
                                {safeSolution.globalTags.map((badge, index) => (
                                    <BadgeConsort
                                        key={index}
                                        className="h-7 w-auto flex-none"
                                        variant="neutral"
                                        // icon={badge.icon ? iconMap[badge.icon] : undefined}
                                        iconRight={null}
                                    >
                                        {badge}
                                    </BadgeConsort>
                                ))}
                            </div>
                            <ShareButton />
                        </div>
                    </div>
                    <h1 className="w-full max-w-[768px] lg:text-heading-2 md:text-heading-2-md mobile:text-heading-2-sm font-heading-2 text-consort-blue ml-1.5">
                        {safeSolution.solutionTitle}
                    </h1>
                    <p className="max-w-[768px] text-body-lg font-body-lg text-subtext-color ml-1.5">
                        {safeSolution.description}
                    </p>
                    {/* <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border mt-1 mb-1.5" /> */}
                    <div className="flex w-full flex-wrap items-start gap-2 pl-1.5">
                        {safeSolution.brochure && <PDFButton url={safeSolution.brochure} />}
                        <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border mx-3 mobile:hidden" />
                        <Button3
                            disabled={false}
                            variant="destructive-primary"
                            iconRight={<FeatherArrowRight />}
                            loading={false}
                        // onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                        >
                            Speak to Expert
                        </Button3>
                    </div>
                    <Image
                        width={1000}
                        height={1000}
                        alt={safeSolution.solutionTitle}
                        className="max-h-[320px] w-full grow shrink-0 basis-0 rounded-md object-cover mt-4"
                        src={safeSolution.heroImage}
                    />
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-12 w-full px-12">
                    {safeSolution.contentSections.map((point, index) => (
                        <div
                            key={index}
                            className={`
            flex w-full items-start
            ${index === safeSolution.contentSections.length - 1 ? 'bg-neutral-100 rounded-md shadow-md' : ''}
            px-12 py-12 lg:flex-row md:flex-col md:gap-8
            mobile:flex-col mobile:flex-nowrap mobile:gap-6
            mobile:px-6 mobile:py-6
        `}
                        >
                            {/* Left Sidebar Title */}
                            <div className="flex w-60 flex-none items-start gap-6 lg:sticky top-10 mobile:static">
                                <h3 className="lg:text-heading-3 lg:font-heading-3 md:text-heading-4 md:font-heading-4 mobile:text-heading-4 mobile:font-heading-4 text-consort-blue">
                                    {point.title}
                                </h3>
                            </div>

                            {/* Content Area */}
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                                {point.sectionImage && (
                                    <div className="flex relative h-[400px] w-full flex-col items-start gap-2 overflow-hidden rounded-md bg-white px-4 py-4 shadow-sm">
                                        <Image
                                            fill
                                            className="w-full grow shrink-0 basis-0 object-contain"
                                            src={point.sectionImage}
                                            alt={point.title}
                                        />
                                    </div>
                                )}

                                {point.subheading && (
                                    <h2 className="text-body-lg font-body-lg mobile:text-body mobile:font-body mobile:leading-snug text-consort-blue">
                                        {point.subheading}
                                    </h2>
                                )}

                                {point.content && (
                                    <p className="text-body font-body mobile:leading-snug text-subtext-color">
                                        {point.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                </div>

                {/* Company Logos Carousel */}
                {/* <SingleRowCompanyLogos 
                logos={resourceData.companyLogos} 
                title="Trusted by Transportation Leaders"
                delay={2400}
            /> */}

                {/* Related Products */}
                {/* <RelatedProducts items={resourceData.relatedProducts.items} /> */}

                {/* Case Studies */}
                {/* <CaseStudiesSection items={resourceData.caseStudies.items} /> */}

            </div>
        );
    } catch (error) {
        console.error('Error rendering solution page:', error);
        return (
            <div className="flex w-full max-w-[1024px] mx-auto flex-col items-center justify-center min-h-[400px] px-6 py-6">
                <h1 className="text-heading-2 font-heading-2 text-consort-blue mb-4">Error</h1>
                <p className="text-body text-subtext-color">An error occurred while rendering the solution page.</p>
            </div>
        );
    }
}
