import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_CONFIG } from '@/utils/authUtils';

// Use consistent cookie name from authUtils
const FIREBASE_TOKEN_COOKIE = AUTH_COOKIE_CONFIG.FIREBASE_TOKEN;

/**
 * Enhanced Firebase ID token structure validation for Edge Runtime
 * Validates JWT structure and Firebase-specific claims without cryptographic verification
 * This provides better security than basic string checks while remaining Edge-compatible
 */
function validateFirebaseTokenStructure(token: string): { isValid: boolean; reason?: string } {
    try {
        // 1. Basic JWT structure validation
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { isValid: false, reason: 'Invalid JWT structure - must have 3 parts' };
        }
        
        // 2. Decode header without verification (structure check only)
        let header: any;
        try {
            const headerDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
            header = JSON.parse(headerDecoded);
        } catch (error) {
            return { isValid: false, reason: 'Invalid JWT header encoding' };
        }
        
        // 3. Firebase ID token header validation
        if (header.alg !== 'RS256') {
            return { isValid: false, reason: 'Invalid algorithm - Firebase uses RS256' };
        }
        if (!header.kid || typeof header.kid !== 'string' || header.kid.length < 10) {
            return { isValid: false, reason: 'Missing or invalid key ID (kid)' };
        }
        
        // 4. Decode payload for basic structure validation
        let payload: any;
        try {
            const payloadDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            payload = JSON.parse(payloadDecoded);
        } catch (error) {
            return { isValid: false, reason: 'Invalid JWT payload encoding' };
        }
        
        // 5. Firebase ID token payload structure validation
        if (!payload.iss || !payload.iss.startsWith('https://securetoken.google.com/')) {
            return { isValid: false, reason: 'Invalid issuer - must be Firebase securetoken' };
        }
        if (!payload.aud || typeof payload.aud !== 'string' || payload.aud.length < 3) {
            return { isValid: false, reason: 'Missing or invalid audience (project ID)' };
        }
        if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length < 10) {
            return { isValid: false, reason: 'Missing or invalid subject (user ID)' };
        }
        if (!payload.exp || !payload.iat || typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
            return { isValid: false, reason: 'Missing or invalid expiry/issued times' };
        }
        
        // 6. Basic expiry check (not cryptographically secure but better than nothing)
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp <= now) {
            return { isValid: false, reason: 'Token has expired' };
        }
        if (payload.iat > now + 300) { // Allow 5 min clock skew
            return { isValid: false, reason: 'Token issued in future (clock skew)' };
        }
        
        // 7. Token age validation (Firebase ID tokens are valid for 1 hour)
        const tokenAge = now - payload.iat;
        if (tokenAge > 3600) { // 1 hour
            return { isValid: false, reason: 'Token is too old (>1 hour)' };
        }
        
        // 8. Project ID validation (if available in environment)
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            const expectedIssuer = `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`;
            if (payload.iss !== expectedIssuer) {
                return { isValid: false, reason: 'Token issuer does not match project' };
            }
            if (payload.aud !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
                return { isValid: false, reason: 'Token audience does not match project' };
            }
        }
        
        // 9. Additional Firebase-specific validations
        if (payload.firebase && typeof payload.firebase !== 'object') {
            return { isValid: false, reason: 'Invalid firebase claims structure' };
        }
        
        // 10. Validate auth_time if present
        if (payload.auth_time && (typeof payload.auth_time !== 'number' || payload.auth_time > now)) {
            return { isValid: false, reason: 'Invalid authentication time' };
        }
        
        return { isValid: true };
    } catch (error) {
        return { isValid: false, reason: `Token validation error: ${(error as Error).message}` };
    }
}

// Enhanced security headers for all responses
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': process.env.NODE_ENV === 'production'
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https: http: https://res.cloudinary.com https://firebasestorage.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net https://firebaseinstallations.googleapis.com https://res.cloudinary.com https://www.google-analytics.com https://analytics.google.com wss: ws: http://localhost:* https://localhost:*",
        "media-src 'self' https: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "worker-src 'self' blob:",
        "manifest-src 'self'"
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https: http: https://res.cloudinary.com https://firebasestorage.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net https://firebaseinstallations.googleapis.com https://res.cloudinary.com https://www.google-analytics.com https://analytics.google.com wss: ws: http://localhost:* https://localhost:*",
        "media-src 'self' https: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "worker-src 'self' blob:",
        "manifest-src 'self'"
      ].join('; ')
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const startTime = Date.now(); // Basic timing for audit trails

  // Bot detection and blocking
  const suspiciousBots = [
    'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'seznambot',
    'yandexbot', 'bingbot', 'slurp', 'facebookexternalhit',
    'crawler', 'spider', 'scraper', 'wget', 'curl'
  ];

  const isSuspiciousBot = suspiciousBots.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  // Block malicious requests (only in production)
  if (isSuspiciousBot && !pathname.startsWith('/api/') && process.env.NODE_ENV === 'production') {
    console.warn(`[SECURITY] Blocked suspicious bot: ${userAgent} from ${ip} (${Date.now() - startTime}ms)`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Update allowed origins for production
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://consortdigital.com', 'https://www.consortdigital.com']
    : ['http://localhost:3000', 'https://localhost:3000'];

  // Skip auth checks for public routes
  const publicRoutes = ['/auth', '/api/auth', '/', '/about', '/contact', '/services', '/products'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Admin PAGE protection - enhanced token validation
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    // Get Firebase token from cookie (set by AuthGuard)
    const firebaseToken = request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
    
    if (!firebaseToken) {
      console.warn(`[SECURITY] No Firebase token for admin access: ${pathname}`);
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // ENHANCED token structure validation (Edge Runtime compatible)
    const validation = validateFirebaseTokenStructure(firebaseToken);
    if (!validation.isValid) {
      console.warn(`[SECURITY] Invalid Firebase token for: ${pathname} - ${validation.reason}`);
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    console.log(`[SECURITY] Enhanced token validation passed for: ${pathname}`);
    // AuthGuard will handle detailed Firebase validation client-side
    // API routes will handle detailed server-side validation with Firebase Admin SDK
  }

  // Admin API routes protection - with circuit breaker
  if (pathname.startsWith('/api/admin/') || (pathname.startsWith('/api/admin/') && pathname.endsWith('/'))) {
    // Normalize the pathname for consistent processing (remove trailing slash if present)
    const normalizedPath = pathname.endsWith('/') && pathname.length > '/api/admin/'.length 
      ? pathname.slice(0, -1) 
      : pathname;
    
    console.log(`[MIDDLEWARE] Processing admin API route: ${pathname} (normalized: ${normalizedPath})`);

    // Handle preflight requests for admin APIs
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          ...securityHeaders,
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'null',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '3600', // 1 hour
          'Vary': 'Origin', // Prevent caching CORS responses with different origins
        },
      });
    }

    // Let the API routes handle their own auth verification
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins.includes(origin || '') ? origin! : 'null');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // Public API routes (auth, etc.)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/public/')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          ...securityHeaders,
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'null',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '3600',
          'Vary': 'Origin', // Prevent caching CORS responses with different origins
        },
      });
    }

    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins.includes(origin || '') ? origin! : 'null');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }

  // All other routes
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 