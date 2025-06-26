// Smart Image Router - Serves optimized images based on usage context
// Routes to thumbnail (320px) or main (720px) versions automatically

interface ImageContext {
  isThumbnail?: boolean;
  isCarousel?: boolean;
  context?: 'related' | 'portfolio' | 'carousel' | 'highlight';
}

/**
 * Smart image router that serves the appropriate optimized image
 * Based on filename patterns and context hints
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  context: ImageContext = {}
): string {
  // Don't process external URLs or non-portfolio images
  if (!originalUrl || !originalUrl.includes('portfolio/')) {
    return originalUrl;
  }

  // Determine if we need thumbnail based on context
  const needsThumbnail = 
    context.isThumbnail ||
    context.context === 'related' ||
    context.context === 'portfolio';

  // Determine if we need main/carousel size
  const needsMain = 
    context.isCarousel || 
    context.context === 'carousel' ||
    context.context === 'highlight';

  // Route to appropriate optimized version using directory structure
  if (needsThumbnail) {
    // Route from main to thumbnails directory
    return originalUrl.replace('/gallery/main/', '/gallery/thumbnails/');
  }
  
  if (needsMain) {
    // Ensure we're using main directory (in case URL is already thumbnail)
    return originalUrl.replace('/gallery/thumbnails/', '/gallery/main/');
  }

  // Default to main size for unknown contexts
  return originalUrl.replace('/gallery/thumbnails/', '/gallery/main/');
}

/**
 * Context-aware image URL getters for specific components
 */
export const ImageRouter = {
  // For RelatedProducts and PortfolioClientWrapper - SAME thumbnail size (320px)
  forThumbnail: (url: string) => getOptimizedImageUrl(url, { isThumbnail: true }),
  
  // For ProductCarousel and main image displays (720px)
  forCarousel: (url: string) => getOptimizedImageUrl(url, { isCarousel: true }),
  
  // For portfolio grid thumbnails - SAME as forThumbnail (320px)
  forPortfolio: (url: string) => getOptimizedImageUrl(url, { isThumbnail: true }),
  
  // For marketing highlight images - use main size (720px)
  forHighlight: (url: string) => getOptimizedImageUrl(url, { isCarousel: true }),
  
  // Smart auto-detection based on usage patterns
  smart: (url: string, sizes?: string) => {
    // Analyze Next.js sizes prop for context hints
    if (sizes) {
      // Small sizes indicate thumbnail usage
      if (sizes.includes('208px') || sizes.includes('240px') || sizes.includes('320px')) {
        return getOptimizedImageUrl(url, { isThumbnail: true });
      }
      // Larger sizes indicate main/carousel usage
      if (sizes.includes('448px') || sizes.includes('720px') || sizes.includes('100vw')) {
        return getOptimizedImageUrl(url, { isCarousel: true });
      }
    }
    
    // Default to main size
    return getOptimizedImageUrl(url, { isCarousel: true });
  }
};

/**
 * Enhanced image utility that combines validation with smart routing
 */
export function getSmartImageUrl(url: string, context: ImageContext = {}): string {
  // Fallback for invalid URLs
  if (!url || url === '/icons/Placeholder.png') {
    return '/icons/Placeholder.png';
  }
  
  // Route to optimized version if available
  return getOptimizedImageUrl(url, context);
} 