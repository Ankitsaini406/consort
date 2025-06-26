/**
 * Standardized Upload Configuration
 * Used across all upload endpoints to ensure consistency
 */

export const UPLOAD_CONFIG = {
  // File size limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Rate limiting
  RATE_LIMIT: {
    requests: 20, // requests per window
    windowMs: 60000, // 1 minute window
  },
  
  // Allowed file types with validation data
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/svg+xml',
    'application/pdf'
  ] as string[],
  
  // Allowed upload paths (security whitelist)
  ALLOWED_PATHS: [
    'solutions',
    'portfolio', 
    'resources',
    'posts',
    'products',
    'news',
    'about',
    'contact',
    'general',
    'temp',
    // Firebase Functions compatibility
    'tags/global',
    'tags/clients', 
    'tags/brands',
    'tags/icons',
    'industries'
  ],
  
  // Timeouts
  UPLOAD_TIMEOUT_MS: 15000, // 15 seconds
  
  // CORS settings
  CORS_ORIGINS: {
    production: 'https://consort--consortdigital-327d9.europe-west4.hosted.app',
    development: 'http://localhost:3000'
  }
} as const;

/**
 * Get file upload configuration for FileUploadSecurity.validateFile()
 */
export function getStandardUploadConfig() {
  return {
    allowedTypes: UPLOAD_CONFIG.ALLOWED_FILE_TYPES,
    maxSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    requireSignatureValidation: true,
    sanitizeFilenames: true
  };
}

/**
 * Check if a path is allowed for uploads
 */
export function isPathAllowed(path: string): boolean {
  // Check for directory traversal
  if (path.includes('../') || path.includes('..\\') || path.includes('~')) {
    return false;
  }
  
  // Validate against allowed paths
  return UPLOAD_CONFIG.ALLOWED_PATHS.some(allowedPath => 
    path.startsWith(allowedPath) && !path.includes('..')
  );
}

/**
 * Get CORS headers for upload endpoints
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? UPLOAD_CONFIG.CORS_ORIGINS.production
      : UPLOAD_CONFIG.CORS_ORIGINS.development,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };
} 