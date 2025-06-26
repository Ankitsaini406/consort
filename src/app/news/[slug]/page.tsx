import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BadgeConsort } from '@/ui';
import { allUpdates, Update } from '@/data/newsData';
import Questions from '@/components/CommonCTA';
import RelatedProducts from "@/components/related/RelatedLayout";
import { FeatherCheckSquare } from '@subframe/core';

// Mock data for related products - replace with actual data logic
const relatedProducts = {
    items: [
        { image: "https://res.cloudinary.com/subframe/image/upload/v1747848342/uploads/12970/u0tk28pkkpioi7q93ttq.webp", title: "RCP 5310A", description: "Professional DMR Portable Radio", url: "/products/rcp-5310a" },
        { image: "https://res.cloudinary.com/subframe/image/upload/v1747848354/uploads/12970/vtcfr9rxn4fvrwchhmsq.webp", title: "RCP 5310A Radio Tetra Solution", description: "RCP 5310A", url: "/products/rcp-5310a" },
        { image: "https://res.cloudinary.com/subframe/image/upload/v1747848368/uploads/12970/j2n6x1mwljgoky9no6er.webp", title: "RCP 5310A Radio Tetra Solution", description: "RCP 5310A", url: "/products/rcp-5310a" },
    ]
};

// Generate static params for SSG compatibility
export async function generateStaticParams() {
    // Generate static params from all available news articles
    return allUpdates.map((article) => ({
        slug: article.url.split('/').pop() || '',
    }));
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const article = allUpdates.find((item) => item.url.split('/').pop() === resolvedParams.slug);

    if (!article) {
        notFound();
    }

    const formattedDate = new Date(article.publishDate).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white">
            <div className="max-w-[1024px] mx-auto py-12 px-4">
                {/* Article Header */}
                <div className="flex flex-col items-center justify-center gap-2 text-center pb-10">

                    <time dateTime={article.publishDate} className="text-body font-body text-subtext-color my-2">
                        Published on {formattedDate}
                    </time>
                    <h1 className="lg:text-heading-1 md:text-heading-2-md mobile:text-heading-2-sm font-heading-1 text-consort-blue">
                        {article.title}
                    </h1>
                    <div className="flex justify-center gap-2 mb-4">
                        {(article.tags ?? []).map((tag: string, idx: number) => (
                            <BadgeConsort key={idx} variant={idx === 0 ? 'warning' : 'neutral'}>
                                {tag}
                            </BadgeConsort>
                        ))}
                    </div>
                </div>

                {/* Main Image */}
                <div className="w-full h-auto mb-12">
                    <Image
                        src={article.image}
                        alt={article.title}
                        width={1024}
                        height={480}
                        className="w-full lg:h-144 md:h-96 mobile:h-40 object-cover rounded-lg shadow-lg"
                    />
                </div>

                {/* Article Content */}
                <div className="max-w-[768px] mx-auto md:px-4 mobile:px-2">
                    <div className="prose lg:prose-xl prose-neutral max-w-none font-body">
                        {article.content.map((block: any, index: number) => {
                            switch (block.type) {
                                case 'heading':
                                    return <h2 key={index} className="text-consort-blue">{block.text}</h2>;
                                case 'paragraph':
                                    return <p key={index}>{block.text}</p>;
                                case 'image':
                                    return <Image key={index} src={block.src!} alt={block.alt!} width={768} height={432} className="w-full h-auto rounded-lg" />;
                                case 'list':
                                    return (
                                        <ul key={index} className="list-none p-0">
                                            {block.items!.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 my-2">
                                                    <FeatherCheckSquare className="text-consort-red mt-1 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
} 