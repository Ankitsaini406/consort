import { fetchPostsByType } from '@/lib/firebase-actions';
import dynamic from 'next/dynamic';

// Dynamic import for client component
const PostsGridClient = dynamic(() => import('@/components/client/PostsGridClient'), {
    ssr: true, // Enable SSR to avoid hydration issues
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
    'blog-post': {
        title: 'Blog Posts',
        description: 'Read our latest blog posts and insights from Consort Digital.'
    },
    'news': {
        title: 'News',
        description: 'Stay updated with the latest news and announcements from Consort Digital.'
    },
    'events': {
        title: 'Events', 
        description: 'Discover upcoming events and past conferences from Consort Digital.'
    },
    'announcements': {
        title: 'Announcements',
        description: 'Important announcements and company updates from Consort Digital.'
    }
} as const;

// ISR Configuration - Cache for 1 hour, but allow on-demand revalidation
export const revalidate = 3600; // 1 hour

// Generate static params for all post types
export async function generateStaticParams() {
    return [
        { type: 'blog-post' },
        { type: 'news' },
        { type: 'events' },
        { type: 'announcements' }
    ];
}

interface Props {
    params: Promise<{ type: string }>;
}

export default async function PostsTypePage({ params }: Props) {
    const resolvedParams = await params;
    const postType = resolvedParams.type as keyof typeof typeConfig;
    
    const config = typeConfig[postType];
    if (!config) {
        return <div>Post type not found</div>;
    }

    // Fetch posts data server-side (ISR)
    const posts = await fetchPostsByType(postType);
    
    // Debug logging
    console.log(`🔍 PostsTypePage: Fetching posts for type '${postType}'`);
    console.log(`🔍 PostsTypePage: Found ${posts.length} posts`);
    console.log(`🔍 PostsTypePage: Posts:`, posts.map(p => ({ slug: p.slug, title: p.postTitle, type: p.postType, isDraft: p.isDraft })));

    return (
        <div className="bg-gradient-to-b from-white via-neutral-100 to-white">
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
                <PostsGridClient posts={posts} postType={postType} />
            </div>
        </div>
    );
} 