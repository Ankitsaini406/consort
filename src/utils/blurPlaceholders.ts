/**
 * Smart Blur Placeholder Generator
 * Generates proper blur data URLs for different contexts instead of using static /placeholder.png
 */

// Base64 encoded 1x1 pixel images for different contexts
export const BLUR_DATA_URLS = {
  // Neutral gray for general products
  product: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwOCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2U1ZTdlYjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg==",
  
  // Brand blue gradient for Consort products
  consort: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwOCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWZmNmZmO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2RiZWFmZTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg==",
  
  // Lighter variant for case studies/articles
  article: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwOCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmJmY2ZkO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y3ZjhmYTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg==",
  
  // Warm variant for company logos
  logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwOCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmVmZWZlO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y5ZmJmZjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjA4IiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg==",
};

export type BlurPlaceholderType = keyof typeof BLUR_DATA_URLS;

/**
 * Get the appropriate blur data URL based on content type
 * @param type - The type of content (product, consort, article, logo)
 * @param customDimensions - Optional custom dimensions for the placeholder
 * @returns Base64 encoded blur data URL
 */
export function getBlurDataURL(
  type: BlurPlaceholderType = 'product',
  customDimensions?: { width: number; height: number }
): string {
  // Return the pre-generated blur data URL
  const baseURL = BLUR_DATA_URLS[type];
  
  // For now, return the base URL (customDimensions can be used for future enhancement)
  return baseURL;
}

/**
 * Smart placeholder selection based on image URL patterns
 * @param imageUrl - The actual image URL
 * @returns The most appropriate blur placeholder type
 */
export function detectPlaceholderType(imageUrl: string): BlurPlaceholderType {
  if (!imageUrl || imageUrl.includes('placeholder')) {
    return 'product';
  }
  
  // Detect Consort-related images
  if (imageUrl.toLowerCase().includes('consort') || 
      imageUrl.includes('firebasestorage.googleapis.com')) {
    return 'consort';
  }
  
  // Detect logo images  
  if (imageUrl.toLowerCase().includes('logo') || 
      imageUrl.includes('/logos/')) {
    return 'logo';
  }
  
  // Detect article/case study images
  if (imageUrl.toLowerCase().includes('case') || 
      imageUrl.toLowerCase().includes('article') ||
      imageUrl.includes('cloudinary.com')) {
    return 'article';
  }
  
  return 'product';
}

/**
 * Enhanced function that combines URL detection with manual override
 * @param imageUrl - The actual image URL
 * @param forceType - Optional type to force (overrides auto-detection)
 * @returns Optimized blur data URL
 */
export function getSmartBlurDataURL(
  imageUrl: string, 
  forceType?: BlurPlaceholderType
): string {
  const type = forceType || detectPlaceholderType(imageUrl);
  return getBlurDataURL(type);
} 