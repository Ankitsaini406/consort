import { fetchResourcesByType } from '@/lib/firebase-actions';
import dynamic from 'next/dynamic';

// Dynamic import for client component
const ResourcesGridClient = dynamic(() => import('@/components/client/ResourcesGridClient'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                </div>
            ))}
        </div>
    )
});

// Type mappings
const typeConfig = {
    'case-study': {
        title: 'Case Studies',
        description: 'Explore real-world implementations and success stories from Consort Digital.'
    },
    'whitepaper': {
        title: 'Whitepapers',
        description: 'In-depth technical papers and research from Consort Digital experts.'
    },
    'client-review': {
        title: 'Client Reviews',
        description: 'Testimonials and reviews from our valued clients and partners.'
    }
} as const;

// ISR Configuration - Cache for 1 hour, but allow on-demand revalidation
export const revalidate = 3600; // 1 hour

// Generate static params for all resource types
export async function generateStaticParams() {
    return [
        { type: 'case-study' },
        { type: 'whitepaper' },
        { type: 'client-review' }
    ];
}

interface Props {
    params: Promise<{ type: string }>;
}

export default async function ResourcesTypePage({ params }: Props) {
    const resolvedParams = await params;
    const resourceType = resolvedParams.type as keyof typeof typeConfig;
    
    const config = typeConfig[resourceType];
    if (!config) {
        return <div>Resource type not found</div>;
    }

    // Fetch resources data server-side (ISR)
    const resources = await fetchResourcesByType(resourceType);

    return (
        <div className="bg-gradient-to-t from-neutral-100 to-white">
            <div className="max-w-[1080px] mx-auto py-16 px-4">
                {/* Page Header */}
                <div className="text-center pb-12">
                    <h1 className="lg:text-heading-1 md:text-heading-1-md mobile:text-heading-1-sm font-heading-1 text-consort-blue">
                        {config.title}
                    </h1>
                    <p className="lg:max-w-[768px] md:max-w-[80%] mx-auto lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm font-body-xl text-subtext-color mt-4">
                        {config.description}
                    </p>
                </div>

                {/* Client-side Grid with Pagination */}
                <ResourcesGridClient resources={resources} resourceType={resourceType} />
            </div>
        </div>
    );
} 