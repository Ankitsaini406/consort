/**
 * Validates an image URL and provides a fallback if the URL is invalid or known to be broken
 * @param imageUrl - The image URL to validate
 * @param fallbackUrl - The fallback URL to use if the image is invalid (default: '/icons/Placeholder.png')
 * @returns A valid image URL
 */
export function getValidImageUrl(imageUrl: string | undefined | null, fallbackUrl: string = '/icons/Placeholder.png'): string {
    // If no URL provided, use fallback
    if (!imageUrl) {
        return fallbackUrl;
    }

    // List of known broken Firebase storage file IDs
    const brokenFileIds = [
        '1749323389797',
        '1749324790461'
    ];

    // Check if the URL contains any known broken file IDs
    const isBrokenUrl = brokenFileIds.some(id => imageUrl.includes(id));
    
    if (isBrokenUrl) {
        return fallbackUrl;
    }

    // Additional validation for Firebase storage URLs
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
        // Check if URL has proper structure
        const hasValidStructure = imageUrl.includes('alt=media') && imageUrl.includes('token=');
        if (!hasValidStructure) {
            return fallbackUrl;
        }
    }

    return imageUrl;
}

/**
 * Creates an error handler for Next.js Image components
 * @param fallbackUrl - The fallback URL to use when image fails to load
 * @returns An error handler function
 */
export function createImageErrorHandler(fallbackUrl: string = '/icons/Placeholder.png') {
    return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== fallbackUrl) {
            target.src = fallbackUrl;
        }
    };
}

/**
 * Creates a load handler for Next.js Image components (replaces deprecated onLoadingComplete)
 * @param fallbackUrl - The fallback URL to use when image fails to load properly
 * @returns A load handler function
 */
export function createImageLoadingCompleteHandler(fallbackUrl: string = '/icons/Placeholder.png') {
    return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = event.target as HTMLImageElement;
        if (target.naturalWidth === 0 || target.naturalHeight === 0) {
            // Image failed to load properly
            target.src = fallbackUrl;
        }
    };
}

/**
 * Image URL utilities for handling thumbnails and optimized images
 * Works with the imageOptimizer.ts patterns
 */

/**
 * Convert a main image URL to its corresponding thumbnail URL
 * Based on actual Firebase storage patterns:
 * - Posts/Resources hero: posts/{slug}/hero/{slug}_hero.webp → posts/{slug}/hero-thumb/{slug}_hero-thumb.webp
 * - Product gallery: portfolio/{id}/gallery/main/slot_N.webp → portfolio/{id}/gallery/thumbnails/slot_N.webp
 * - Legacy optimized: filename-940.webp → filename-320.webp (fallback)
 */
export function getImageThumbnailUrl(mainImageUrl: string): string {
  if (!mainImageUrl) return mainImageUrl;
  
  // Check if this is already a thumbnail URL
  if (mainImageUrl.includes('hero-thumb') || mainImageUrl.includes('thumbnails') || mainImageUrl.includes('-320.webp')) {
    return mainImageUrl;
  }
  
  // Handle Posts/Resources hero images with simplified paths
  // posts/{slug}/hero.webp → posts/{slug}/thumb.webp
  // resources/{slug}/hero.webp → resources/{slug}/thumb.webp
  if ((mainImageUrl.includes('/posts/') || mainImageUrl.includes('/resources/')) && 
      mainImageUrl.includes('/hero.')) {
    return mainImageUrl.replace('/hero.', '/thumb.');
  }
  
  // Legacy pattern: posts/{slug}/hero/{slug}_hero.webp → posts/{slug}/hero-thumb/{slug}_hero-thumb.webp
  if (mainImageUrl.includes('/hero/') && mainImageUrl.includes('_hero.webp')) {
    return mainImageUrl
      .replace('/hero/', '/hero-thumb/')
      .replace('_hero.webp', '_hero-thumb.webp');
  }
  
  // Handle Product gallery images
  // portfolio/{id}/gallery/main/slot_N.webp → portfolio/{id}/gallery/thumbnails/slot_N.webp
  if (mainImageUrl.includes('/gallery/main/')) {
    return mainImageUrl.replace('/gallery/main/', '/gallery/thumbnails/');
  }
  
  // Legacy pattern support (for backward compatibility)
  if (mainImageUrl.includes('-940.webp')) {
    // Hero image: 940px → 320px
    return mainImageUrl.replace('-940.webp', '-320.webp');
  }
  
  if (mainImageUrl.includes('-720.webp')) {
    // Product/Section image: 720px → 320px
    return mainImageUrl.replace('-720.webp', '-320.webp');
  }
  
  // For non-optimized images, try to construct thumbnail URL
  // This handles legacy images that might not follow the pattern
  if (mainImageUrl.includes('.webp') || mainImageUrl.includes('.jpg') || 
      mainImageUrl.includes('.jpeg') || mainImageUrl.includes('.png')) {
    
    // Try to insert -320 before the file extension
    const lastDotIndex = mainImageUrl.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const basePath = mainImageUrl.substring(0, lastDotIndex);
      const extension = mainImageUrl.substring(lastDotIndex);
      
      // Check if we can create a thumbnail URL
      if (extension === '.webp') {
        return `${basePath}-320.webp`;
      }
    }
  }
  
  // Fallback: return original URL if no pattern matches
  return mainImageUrl;
}

/**
 * Get the main (high-resolution) image URL from a thumbnail URL
 * Useful for detail pages that need the full-size image
 */
export function getImageMainUrl(thumbnailUrl: string, contentType: 'hero' | 'product' | 'section' = 'hero'): string {
  if (!thumbnailUrl) return thumbnailUrl;
  
  // Handle Posts/Resources hero thumbnails with simplified paths
  // posts/{slug}/thumb.webp → posts/{slug}/hero.webp
  // resources/{slug}/thumb.webp → resources/{slug}/hero.webp
  if ((thumbnailUrl.includes('/posts/') || thumbnailUrl.includes('/resources/')) && 
      thumbnailUrl.includes('/thumb.')) {
    return thumbnailUrl.replace('/thumb.', '/hero.');
  }
  
  // Legacy pattern: posts/{slug}/hero-thumb/{slug}_hero-thumb.webp → posts/{slug}/hero/{slug}_hero.webp
  if (thumbnailUrl.includes('/hero-thumb/') && thumbnailUrl.includes('_hero-thumb.webp')) {
    return thumbnailUrl
      .replace('/hero-thumb/', '/hero/')
      .replace('_hero-thumb.webp', '_hero.webp');
  }
  
  // Handle Product gallery thumbnails
  // portfolio/{id}/gallery/thumbnails/slot_N.webp → portfolio/{id}/gallery/main/slot_N.webp
  if (thumbnailUrl.includes('/gallery/thumbnails/')) {
    return thumbnailUrl.replace('/gallery/thumbnails/', '/gallery/main/');
  }
  
  // Legacy pattern support (for backward compatibility)
  if (thumbnailUrl.includes('-320.webp')) {
    switch (contentType) {
      case 'hero':
        return thumbnailUrl.replace('-320.webp', '-940.webp');
      case 'product':
      case 'section':
        return thumbnailUrl.replace('-320.webp', '-720.webp');
      default:
        return thumbnailUrl.replace('-320.webp', '-940.webp');
    }
  }
  
  // Already a main URL or unrecognized pattern
  return thumbnailUrl;
}

/**
 * Check if an image URL is a thumbnail
 */
export function isImageThumbnail(imageUrl: string): boolean {
  return imageUrl.includes('/thumb.') ||
         imageUrl.includes('hero-thumb') || 
         imageUrl.includes('thumbnails') || 
         imageUrl.includes('-320.webp');
}

/**
 * Check if an image URL is optimized (follows our naming pattern)
 */
export function isImageOptimized(imageUrl: string): boolean {
  return imageUrl.includes('/thumb.') ||
         imageUrl.includes('/hero.') ||
         imageUrl.includes('hero-thumb') || 
         imageUrl.includes('thumbnails') || 
         imageUrl.includes('/hero/') ||
         imageUrl.includes('/gallery/main/') ||
         imageUrl.includes('-320.webp') || 
         imageUrl.includes('-720.webp') || 
         imageUrl.includes('-940.webp');
}

/**
 * Get the appropriate image URL for a given context
 * @param imageUrl - The original image URL
 * @param context - The usage context
 * @returns The optimized URL for the context
 */
export function getImageForContext(
  imageUrl: string, 
  context: 'grid' | 'detail' | 'hero',
  contentType: 'post' | 'resource' | 'product' = 'post'
): string {
  if (!imageUrl) return imageUrl;
  
  switch (context) {
    case 'grid':
      // Always use thumbnails for grid cards (320px)
      return getImageThumbnailUrl(imageUrl);
      
    case 'detail':
      // Use main images for detail pages
      if (contentType === 'product') {
        return getImageMainUrl(imageUrl, 'product'); // 720px
      } else {
        return getImageMainUrl(imageUrl, 'section'); // 720px for sections
      }
      
    case 'hero':
      // Use hero size for hero sections
      return getImageMainUrl(imageUrl, 'hero'); // 940px
      
    default:
      return imageUrl;
  }
} 