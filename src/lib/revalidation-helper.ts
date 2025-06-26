/**
 * Helper function to trigger on-demand revalidation for ISR pages
 */
export async function triggerRevalidation(paths: string[]): Promise<void> {
    const revalidationSecret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET;
    
    if (!revalidationSecret) {
        console.warn('REVALIDATION_SECRET not found, skipping revalidation');
        return;
    }

    try {
        const revalidationPromises = paths.map(async (path) => {
            const response = await fetch('/api/revalidate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path,
                    secret: revalidationSecret
                })
            });

            if (!response.ok) {
                console.error(`Failed to revalidate ${path}:`, await response.text());
            } else {
                console.log(`✅ Successfully revalidated: ${path}`);
            }
        });

        await Promise.all(revalidationPromises);
    } catch (error) {
        console.error('Error during revalidation:', error);
    }
}

/**
 * Helper to get all paths that need revalidation for a post
 */
export function getPostRevalidationPaths(postType: string, slug: string): string[] {
    const paths = [
        `/posts/${postType}`,           // Grid page
        `/posts/${postType}/${slug}`,   // Individual page
    ];
    
    // If it's news or events, also revalidate home page
    if (postType === 'news' || postType === 'events') {
        paths.push('/');                // Home page
    }
    
    return paths;
}

/**
 * Helper to get all paths that need revalidation for a resource
 */
export function getResourceRevalidationPaths(resourceType: string, slug: string): string[] {
    return [
        `/resources/${resourceType}`,           // Grid page
        `/resources/${resourceType}/${slug}`,   // Individual page
    ];
}

/**
 * Helper to get all paths that need revalidation for a portfolio product
 */
export function getPortfolioRevalidationPaths(slug: string): string[] {
    return [
        `/portfolio`,                           // Portfolio grid page
        `/portfolio/${slug}`,                   // Individual product page
    ];
} 