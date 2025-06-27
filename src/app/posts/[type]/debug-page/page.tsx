import { fetchPostsByType, fetchAllBlogs } from '@/lib/firebase-actions';

interface Props {
    params: Promise<{ type: string }>;
}

export default async function DebugPostsPage({ params }: Props) {
    try {
        console.log('🚀 DEBUG PAGE: Starting debug page load...');
        
        const resolvedParams = await params;
        const postType = resolvedParams.type;
        
        console.log(`🔍 Debug: Fetching posts for type: ${postType}`);
        
        // Simple test first
        console.log('🔍 Debug: About to fetch all blogs...');
        
        // Fetch all posts to see what exists
        const allPosts = await fetchAllBlogs();
        console.log(`🔍 Debug: Total posts found: ${allPosts.length}`);
        console.log(`🔍 Debug: All posts:`, allPosts.map(p => ({ 
            slug: p.slug, 
            title: p.postTitle, 
            type: p.postType, 
            isDraft: p.isDraft 
        })));
        
        // Fetch posts by type
        const postsByType = await fetchPostsByType(postType);
        console.log(`🔍 Debug: Posts for type '${postType}': ${postsByType.length}`);
        console.log(`🔍 Debug: Posts by type:`, postsByType.map(p => ({ 
            slug: p.slug, 
            title: p.postTitle, 
            type: p.postType, 
            isDraft: p.isDraft 
        })));

        return (
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-red-600">🔍 DEBUG PAGE LOADED SUCCESSFULLY</h1>
                <p className="text-lg mb-4">Debug Posts for Type: <strong>{postType}</strong></p>
                
                <div className="mb-8 border-2 border-blue-500 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-2 text-blue-600">All Posts ({allPosts.length} total)</h2>
                    <div className="bg-gray-100 p-4 rounded">
                        <pre className="text-sm overflow-x-auto">{JSON.stringify(allPosts.map(p => ({ 
                            slug: p.slug, 
                            title: p.postTitle, 
                            type: p.postType, 
                            isDraft: p.isDraft,
                            hasHeroImage: !!p.heroImageUrl 
                        })), null, 2)}</pre>
                    </div>
                </div>

                <div className="mb-8 border-2 border-green-500 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-2 text-green-600">Posts for Type '{postType}' ({postsByType.length} found)</h2>
                    <div className="bg-gray-100 p-4 rounded">
                        <pre className="text-sm overflow-x-auto">{JSON.stringify(postsByType.map(p => ({ 
                            slug: p.slug, 
                            title: p.postTitle, 
                            type: p.postType, 
                            isDraft: p.isDraft,
                            hasHeroImage: !!p.heroImageUrl 
                        })), null, 2)}</pre>
                    </div>
                </div>

                <div className="text-sm text-gray-600 border-2 border-gray-300 p-4 rounded">
                    <p><strong>Debug Info:</strong></p>
                    <p>• URL: /posts/{postType}/debug-page</p>
                    <p>• This debug page shows what posts are being fetched from Firebase.</p>
                    <p>• Check the browser console for additional debug information.</p>
                    <p>• If you see this page, the route is working correctly.</p>
                </div>
            </div>
        );
    } catch (error) {
        console.error('🚨 DEBUG PAGE ERROR:', error);
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-red-600">🚨 DEBUG PAGE ERROR</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p><strong>Error occurred:</strong></p>
                    <pre className="mt-2 text-sm">{error instanceof Error ? error.message : String(error)}</pre>
                </div>
            </div>
        );
    }
} 