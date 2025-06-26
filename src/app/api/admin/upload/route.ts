import { NextRequest } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebaseconfig';
import { requireAuth, AuthenticatedUser, getClientIP } from '@/utils/serverAuth';
import { FileUploadSecurity } from '@/app/admin/forms/utils/fileUploadSecurity';
import { UPLOAD_CONFIG, getStandardUploadConfig, isPathAllowed, getCorsHeaders } from '@/app/admin/forms/utils/uploadConfig';

// Standardized CORS headers
const corsHeaders = getCorsHeaders();

export async function OPTIONS(request: NextRequest) {
    console.log('[DEBUG] OPTIONS request received');
    return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
    });
}

async function handleFileUpload(request: NextRequest, user: AuthenticatedUser): Promise<Response> {
    const startTime = Date.now();
    
    try {
        const responseHeaders = new Headers(corsHeaders);
        responseHeaders.set('Content-Type', 'application/json');

        console.log(`[ADMIN] File upload request from user: ${user.email}`);

        // Parse form data
        let formData;
        try {
            formData = await request.formData();
        } catch (parseError) {
            console.error(`[SECURITY] Form data parsing error:`, parseError);
            return new Response(
                JSON.stringify({ 
                    error: 'Bad Request', 
                    message: 'Invalid form data format. Please check your file and try again.'
                }),
                { status: 400, headers: responseHeaders }
            );
        }

        const file = formData.get('file') as File;
        const path = formData.get('path') as string;

        if (!file || !path) {
            console.warn(`[SECURITY] Missing file or path from user: ${user.email}`);
            return new Response(
                JSON.stringify({ error: 'Bad Request', message: 'File and path are required' }),
                { status: 400, headers: responseHeaders }
            );
        }

        console.log(`[ADMIN] Upload request: ${file.name} (${file.size} bytes) to path: ${path}`);

        // File size validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return new Response(
                JSON.stringify({ 
                    error: 'File Too Large', 
                    message: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 10MB`
                }),
                { status: 400, headers: responseHeaders }
            );
        }

        if (file.size === 0) {
            return new Response(
                JSON.stringify({ error: 'Bad Request', message: 'File is empty' }),
                { status: 400, headers: responseHeaders }
            );
        }

        // Enhanced file validation
        let validationResult;
        try {
            validationResult = await FileUploadSecurity.validateFile(file, getStandardUploadConfig());

            if (!validationResult.isValid) {
                console.warn(`[SECURITY] File validation failed for ${file.name} from user: ${user.email}:`, validationResult.errors);
                return new Response(
                    JSON.stringify({ 
                        error: 'File Validation Failed', 
                        message: validationResult.errors.join(', '),
                        warnings: validationResult.warnings.length > 0 ? validationResult.warnings : undefined
                    }),
                    { status: 400, headers: responseHeaders }
                );
            }

            console.log(`[SECURITY] File validation passed for ${file.name} from user: ${user.email}. Security score: ${validationResult.securityScore}/100`);
            
            // Log any warnings for monitoring
            if (validationResult.warnings.length > 0) {
                console.warn(`[SECURITY] File validation warnings for ${file.name}:`, validationResult.warnings);
            }

        } catch (validationError) {
            console.error(`[SECURITY] File validation error for ${file.name} from user: ${user.email}:`, validationError);
            return new Response(
                JSON.stringify({ 
                    error: 'File Validation Failed', 
                    message: 'Unable to validate file. Please ensure the file is not corrupted and try again.'
                }),
                { status: 400, headers: responseHeaders }
            );
        }

        // Path validation
        if (!isPathAllowed(path)) {
            console.error(`[SECURITY] Invalid upload path: ${path} from user: ${user.email}`);
            return new Response(
                JSON.stringify({ 
                    error: 'Invalid Path', 
                    message: `Path not allowed. Must start with one of: ${UPLOAD_CONFIG.ALLOWED_PATHS.join(', ')}`
                }),
                { status: 400, headers: responseHeaders }
            );
        }
        
        // Sanitize path segments
        const pathSegments = path.split('/').filter(segment => segment.length > 0);
        const sanitizedSegments = pathSegments.map(segment => 
            segment.replace(/[^a-zA-Z0-9\-_\.]/g, '_')
        );
        
        // Construct secure path with user isolation
        const sanitizedPath = sanitizedSegments.join('/');
        const userIdentifier = user.uid.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Create unique filename to prevent conflicts
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const sanitizedFileName = baseFileName.replace(/[^a-zA-Z0-9\-_]/g, '_');
        const uniqueFileName = `${sanitizedFileName}_${timestamp}.${fileExtension}`;
        
        const fullPath = `admin-uploads/${userIdentifier}/${sanitizedPath}/${uniqueFileName}`;

        console.log(`[ADMIN] Uploading to Firebase Storage: ${fullPath}`);

        // Upload to Firebase Storage
        const storageRef = ref(storage, fullPath);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        const uploadTime = Date.now() - startTime;
        console.log(`[ADMIN] File uploaded successfully in ${uploadTime}ms: ${downloadURL}`);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    url: downloadURL,
                    path: fullPath,
                    filename: uniqueFileName,
                    size: file.size,
                    type: file.type,
                    uploadTime: uploadTime
                }
            }),
            { status: 200, headers: responseHeaders }
        );

    } catch (error) {
        console.error('[ADMIN] Upload error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Upload Failed', 
                message: 'File upload failed. Please try again or contact support if the problem persists.'
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * 🔒 ENHANCED UPLOAD SECURITY WRAPPER
 * Implements multiple security layers:
 * - Firebase Admin SDK authentication
 * - Rate limiting (in-memory fallback if Redis unavailable)
 * - IP tracking and abuse prevention
 * - File upload specific protections
 */
async function secureUploadWrapper(
    handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>,
    request: NextRequest
): Promise<Response> {
    const startTime = Date.now();
    const ip = getClientIP(request);
    
    try {
        // 1. Authentication Check (Required)
        const user = await import('@/utils/serverAuth').then(m => m.validateFirebaseToken(request));
        
        if (!user) {
            console.warn(`[SECURITY] Unauthorized upload attempt from IP: ${ip}`);
            return new Response(
                JSON.stringify({ 
                    error: 'Authentication required',
                    message: 'Please log in to access this resource'
                }),
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 2. Rate Limiting (In-memory fallback implementation)
        const rateLimitKey = `upload_${ip}_${user.uid}`;
        const rateLimitResult = await checkUploadRateLimit(rateLimitKey);
        
        if (!rateLimitResult.success) {
            console.warn(`[SECURITY] Rate limit exceeded for upload from ${user.email} (IP: ${ip})`);
            return new Response(
                JSON.stringify({ 
                    error: 'Rate limit exceeded',
                    message: 'Too many upload requests. Please wait before trying again.',
                    retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000)
                }),
                { 
                    status: 429,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        // 3. Additional Upload-specific Security Checks
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
            console.warn(`[SECURITY] Upload size limit exceeded by ${user.email} (IP: ${ip}): ${contentLength} bytes`);
            return new Response(
                JSON.stringify({ 
                    error: 'File too large',
                    message: 'File size exceeds 10MB limit'
                }),
                { 
                    status: 413,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 4. Execute the protected handler
        console.log(`[SECURITY] Upload request authorized for ${user.email} from IP: ${ip}`);
        const response = await handler(request, user);
        
        const processingTime = Date.now() - startTime;
        console.log(`[SECURITY] Upload request completed in ${processingTime}ms for ${user.email}`);
        
        return response;

    } catch (error) {
        console.error(`[SECURITY] Upload security wrapper error for IP ${ip}:`, error);
        return new Response(
            JSON.stringify({ 
                error: 'Security check failed',
                message: 'Unable to process request due to security validation error'
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * In-memory rate limiting for upload endpoints
 * Fallback when external rate limiting services are unavailable
 */
const uploadRateLimitStore = new Map<string, { count: number; resetTime: number; violations: number }>();

async function checkUploadRateLimit(key: string): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 20; // 20 uploads per minute
    
    let record = uploadRateLimitStore.get(key);
    
    // Clean up expired records
    if (record && now > record.resetTime) {
        uploadRateLimitStore.delete(key);
        record = undefined;
    }
    
    // Initialize new record
    if (!record) {
        record = {
            count: 0,
            resetTime: now + windowMs,
            violations: 0
        };
        uploadRateLimitStore.set(key, record);
    }
    
    // Check if limit exceeded
    if (record.count >= maxRequests) {
        record.violations++;
        
        // Progressive penalties for repeat violators
        if (record.violations >= 3) {
            const penaltyWindow = windowMs * 3; // 3x penalty for repeat offenders
            record.resetTime = Math.max(record.resetTime, now + penaltyWindow);
        }
        
        return {
            success: false,
            limit: maxRequests,
            remaining: 0,
            reset: new Date(record.resetTime)
        };
    }
    
    // Allow request
    record.count++;
    uploadRateLimitStore.set(key, record);
    
    return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - record.count,
        reset: new Date(record.resetTime)
    };
}

// Cleanup expired rate limit records every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of uploadRateLimitStore.entries()) {
        if (now > record.resetTime + 300000) { // 5 minute grace period
            uploadRateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Protected GET handler for admin health check
async function handleHealthCheck(request: NextRequest, user: AuthenticatedUser): Promise<Response> {
    console.log(`[ADMIN] Upload endpoint health check by: ${user.email}`);
    
    return new Response(
        JSON.stringify({ 
            status: 'ok', 
            message: 'Upload endpoint is ready and secured',
            timestamp: new Date().toISOString(),
            user: user.email,
            security: {
                authentication: 'Firebase Admin SDK',
                rateLimit: 'In-memory fallback',
                fileValidation: 'Enhanced security checks'
            }
        }),
        { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// Export the SECURED route handlers
export const POST = (request: NextRequest) => secureUploadWrapper(handleFileUpload, request);
export const GET = requireAuth(handleHealthCheck); 