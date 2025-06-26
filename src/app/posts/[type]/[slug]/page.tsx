import { Metadata } from "next";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { Button3 } from "@/ui/components/Button3";
import { FeatherShare } from "@subframe/core";
import Image from "next/image";
import RichTextPreview from "@/app/demo/RichTextPreview";
import { fetchAllBlogs, getPostBySlug } from "@/lib/firebase-actions";
import { getImageForContext } from "@/utils/imageUtils";
import { getSmartBlurDataURL } from "@/utils/blurPlaceholders";

// ISR Configuration - Cache for 1 hour, but allow on-demand revalidation
export const revalidate = 3600; // 1 hour

type Props = {
    params: Promise<{ type: string; slug: string }>;
};

// Generate static params for all posts at build time
export async function generateStaticParams() {
    // This will fetch from Firebase at build time and generate all possible routes
    const allPosts = await fetchAllBlogs();
    
    const params = [];
    for (const post of allPosts) {
        params.push({
            type: post.postType,
            slug: post.slug
        });
    }
    
    return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type, slug } = await params;
    const post = await getPostBySlug(slug);
    
    if (!post) {
        return {
            title: 'Post Not Found - MCX ONE™ by Consort Digital',
            description: 'The requested post could not be found.',
        };
    }

    return {
        title: `${post.postTitle} - MCX ONE™ by Consort Digital`,
        description: post.headline || `Read about ${post.postTitle} and discover more insights.`,
        openGraph: {
            title: `${post.postTitle} - MCX ONE™ by Consort Digital`,
            description: post.headline || `Read about ${post.postTitle} and discover more insights.`,
            images: post.heroImageUrl ? [post.heroImageUrl] : undefined,
        },
    };
}

export default async function PostPage({ params }: Props) {
    const { type, slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return <div className="p-8">Post not found</div>;
    }

    // Get optimized image URLs
    const heroImageUrl = post.heroImageUrl ? getImageForContext(post.heroImageUrl, 'hero', 'post') : '';
    const heroBlurDataURL = heroImageUrl ? getSmartBlurDataURL(heroImageUrl, 'article') : '';

    return (
        <div className="flex w-full max-w-[1024px] mx-auto flex-col items-start gap-6 rounded-md px-6 py-6 mobile:border mobile:border-solid mobile:border-neutral-border mobile:bg-transparent mobile:px-2 mobile:pt-0 mobile:pb-4">
            <div className="flex w-full flex-col items-start gap-2 px-1 lg:pt-12 md:pt-8 mobile:px-1 mobile:pt-8 mobile:pb-1">
                <div className="flex w-full flex-col items-start justify-center gap-4">
                    <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-6">
                        <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-2 px-1 py-1">
                            {post.globalTags.map((tag: string, index: number) => (
                                <BadgeConsort
                                    key={index}
                                    className="h-7 w-auto flex-none"
                                    variant="neutral"
                                    iconRight={null}
                                >
                                    {tag}
                                </BadgeConsort>
                            ))}
                        </div>
                        <Button3
                            variant="destructive-tertiary"
                            size="small"
                            icon={<FeatherShare />}
                        >
                            Share
                        </Button3>
                    </div>
                </div>
                <h2 className="w-full max-w-[768px] lg:text-heading-2 lg:font-heading-2 md:text-heading-3 md:font-heading-3 mobile:text-body-xl-bold mobile:font-body-xl-bold text-consort-blue ml-1.5 ">
                    {post.postTitle}
                </h2>
                <p className="max-w-[768px] text-body-lg font-body-lg text-subtext-color ml-1.5">
                    {post.headline}
                </p>
                {heroImageUrl && (
                    <Image
                        width={1000}
                        height={1000}
                        alt={post.postTitle}
                        className="max-h-[320px] w-full grow shrink-0 basis-0 rounded-md object-cover mt-4"
                        src={heroImageUrl}
                        placeholder={heroBlurDataURL ? "blur" : "empty"}
                        blurDataURL={heroBlurDataURL}
                        priority={true}
                        sizes="(max-width: 1024px) 100vw, 1024px"
                    />
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-12">
                {post.sections.map((section: any, index: number) => (
                    <div
                        key={index}
                        className={`flex w-full items-start gap-8} 
                        px-12 py-12 lg:flex-row md:flex-col md:gap-8 mobile:flex-col mobile:flex-nowrap mobile:gap-6 mobile:px-6 mobile:py-6`}>
                        {/* Left Sidebar Title */}
                        <div className="flex w-60 flex-none items-start gap-6 lg:sticky top-10 mobile:static">
                            <h3 className="lg:text-heading-3 lg:font-heading-3 md:text-heading-4 md:font-heading-4 mobile:text-heading-4 mobile:font-heading-4 text-consort-blue">
                                {section.sectionTitle}
                            </h3>
                        </div>

                        {/* Content Area */}
                        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                            {/* Image Box */}
                            {section.sectionImageUrl && (() => {
                                const sectionImageUrl = getImageForContext(section.sectionImageUrl, 'detail', 'post');
                                const sectionBlurDataURL = getSmartBlurDataURL(sectionImageUrl, 'article');
                                
                                return (
                                    <div className="flex max-h-[768px] w-full flex-col items-start gap-2 overflow-hidden rounded-md bg-white px-4 py-4 shadow-sm">
                                        <Image
                                            width={1000}
                                            height={1000}
                                            className="w-full grow shrink-0 basis-0 object-contain"
                                            src={sectionImageUrl}
                                            alt={section.sectionTitle}
                                            placeholder={sectionBlurDataURL ? "blur" : "empty"}
                                            blurDataURL={sectionBlurDataURL}
                                            sizes="(max-width: 1024px) 100vw, 720px"
                                        />
                                    </div>
                                );
                            })()}
                            {/* Rich Text Content */}
                            {section.sectionContent && 
                            <RichTextPreview 
                                content={section.sectionContent}
                                className="w-full"
                            />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 