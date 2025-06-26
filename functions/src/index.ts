import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import cors from 'cors';

// Export scheduled cleanup functions for auth management
export { cleanupExpiredAuth, manualAuthCleanup } from './scheduledCleanup';

// Initialize Firebase Admin
initializeApp();

const corsHandler = cors({
  origin: [
    "https://consort--consortdigital-327d9.europe-west4.hosted.app",
    "https://consortdigital-327d9.web.app", 
    "https://consortdigital.com",
    "http://localhost:3000",
    "https://localhost:3000"
  ],
  credentials: true,
});

// Standardized file validation (matching Next.js API)
const ALLOWED_FILE_TYPES = {
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], signature: [0xFF, 0xD8, 0xFF] },
  'image/png': { extensions: ['.png'], signature: [0x89, 0x50, 0x4E, 0x47] },
  'image/gif': { extensions: ['.gif'], signature: [0x47, 0x49, 0x46, 0x38] },
  'image/webp': { extensions: ['.webp'], signature: [0x52, 0x49, 0x46, 0x46] },
  'image/avif': { extensions: ['.avif'], signature: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] }, // ftyp box
  'image/svg+xml': { extensions: ['.svg'], signature: [0x3C, 0x73, 0x76, 0x67] },
  'application/pdf': { extensions: ['.pdf'], signature: [0x25, 0x50, 0x44, 0x46] }
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Simple rate limiting (in-memory, suitable for Functions)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = { requests: 5, windowMs: 60000 }; // 5 uploads per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = uploadAttempts.get(ip);
  
  if (!attempts || now > attempts.resetTime) {
    uploadAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }
  
  if (attempts.count >= RATE_LIMIT.requests) {
    return false;
  }
  
  attempts.count++;
  return true;
}

function validateAvifSignature(buffer: Buffer): boolean {
  // AVIF files are based on ISO Base Media File Format
  // They start with a file type box (ftyp) that contains the brand "avif"
  
  if (buffer.length < 20) {
    return false;
  }
  
  // Check for ftyp box at the beginning (after size field)
  const ftypSignature = [0x66, 0x74, 0x79, 0x70]; // 'ftyp' in ASCII
  const ftypIndex = 4; // ftyp starts at byte 4 (after 4-byte size field)
  
  // Verify ftyp box signature
  for (let i = 0; i < ftypSignature.length; i++) {
    if (buffer[ftypIndex + i] !== ftypSignature[i]) {
      return false;
    }
  }
  
  // Check for "avif" brand in the major brand field (bytes 8-11)
  const avifBrand = [0x61, 0x76, 0x69, 0x66]; // 'avif' in ASCII
  const brandIndex = 8;
  
  for (let i = 0; i < avifBrand.length; i++) {
    if (buffer[brandIndex + i] !== avifBrand[i]) {
      return false;
    }
  }
  
  return true;
}

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  // Special handling for AVIF files
  if (mimeType === 'image/avif') {
    return validateAvifSignature(buffer);
  }
  
  // Standard signature validation for other formats
  const fileType = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  if (!fileType) return false;
  
  const signature = fileType.signature;
  return signature.every((byte, index) => buffer[index] === byte);
}

function validateFileName(fileName: string, mimeType: string): boolean {
  const fileType = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  if (!fileType) return false;
  
  const lowerName = fileName.toLowerCase();
  return fileType.extensions.some(ext => lowerName.endsWith(ext));
}

function sanitizePath(path: string): string | null {
  const allowedPaths = [
    'tags/global', 'tags/clients', 'tags/brands', 'tags/icons',
    'solutions', 'products', 'industry', 'posts', 'resources'
  ];
  
  // Check for directory traversal
  if (path.includes('../') || path.includes('..\\')) {
    return null;
  }
  
  // Validate against allowed paths
  const isValid = allowedPaths.some(allowedPath => 
    path.startsWith(allowedPath) && !path.includes('..')
  );
  
  return isValid ? path : null;
}

export const uploadFile = onRequest({
  cors: true,
  timeoutSeconds: 60,
  memory: "512MiB" // Increased for better performance
}, async (request, response) => {
  return new Promise((resolve) => {
    corsHandler(request, response, async () => {
      try {
        const ip = request.ip || 'unknown';
        
        // Rate limiting
        if (!checkRateLimit(ip)) {
          response.status(429).json({ 
            error: 'Rate Limit Exceeded',
            message: 'Too many upload attempts. Please try again later.'
          });
          return resolve(undefined);
        }

        // Method validation
        if (request.method !== 'POST') {
          response.status(405).json({ error: 'Method not allowed' });
          return resolve(undefined);
        }

        // Authentication (keeping Firebase ID token for Functions compatibility)
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          response.status(401).json({ error: 'Unauthorized' });
          return resolve(undefined);
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        if (!decodedToken.uid) {
          response.status(401).json({ error: 'Invalid token' });
          return resolve(undefined);
        }

        // Enhanced admin verification
        const userRecord = await getAuth().getUser(decodedToken.uid);
        let isAdmin = userRecord.customClaims?.admin === true;
        
        if (!isAdmin) {
          try {
            const { getFirestore } = await import('firebase-admin/firestore');
            const db = getFirestore();
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              isAdmin = userData?.role === 'Admin';
            }
          } catch (firestoreError) {
            console.error('Firestore admin check failed:', firestoreError);
          }
        }

        if (!isAdmin) {
          console.log(`[SECURITY] Upload denied for user ${decodedToken.uid} - not admin`);
          response.status(403).json({ error: 'Admin privileges required' });
          return resolve(undefined);
        }

        // Extract and validate request data
        const { fileData, path, fileName, mimeType } = request.body;
        if (!fileData || !path || !fileName || !mimeType) {
          response.status(400).json({ 
            error: 'Missing required fields: fileData, path, fileName, mimeType' 
          });
          return resolve(undefined);
        }

        // Validate path
        const sanitizedPath = sanitizePath(path);
        if (!sanitizedPath) {
          response.status(403).json({ error: 'Invalid upload path' });
          return resolve(undefined);
        }

        // Validate filename format
        const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!fileNameRegex.test(fileName)) {
          response.status(400).json({ error: 'Invalid file name format' });
          return resolve(undefined);
        }

        // Convert and validate file
        const buffer = Buffer.from(fileData, 'base64');
        
        // File size validation
        if (buffer.length > MAX_FILE_SIZE) {
          response.status(413).json({ 
            error: `File size ${(buffer.length / 1024 / 1024).toFixed(2)}MB exceeds 10MB limit` 
          });
          return resolve(undefined);
        }

        if (buffer.length === 0) {
          response.status(400).json({ error: 'File is empty' });
          return resolve(undefined);
        }

        // MIME type validation
        if (!Object.keys(ALLOWED_FILE_TYPES).includes(mimeType)) {
          response.status(400).json({ 
            error: `File type '${mimeType}' not allowed. Only images and PDF files are permitted.`
          });
          return resolve(undefined);
        }

        // File extension validation
        if (!validateFileName(fileName, mimeType)) {
          const fileType = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
          response.status(400).json({ 
            error: `File extension must match MIME type ${mimeType}. Expected: ${fileType.extensions.join(', ')}`
          });
          return resolve(undefined);
        }

        // File signature validation (magic number checking)
        if (!validateFileSignature(buffer, mimeType)) {
          response.status(400).json({ 
            error: 'File signature does not match declared type - possible spoofing attempt'
          });
          return resolve(undefined);
        }

        // Upload to Firebase Storage
        const bucket = getStorage().bucket();
        const timestamp = Date.now();
        const extension = fileName.split('.').pop() || 'bin';
        const uniqueFileName = `${timestamp}.${extension}`;
        const fullPath = `${sanitizedPath}/${uniqueFileName}`;
        const file = bucket.file(fullPath);

        await file.save(buffer, {
          metadata: {
            contentType: mimeType,
            metadata: {
              uploadedBy: decodedToken.uid,
              uploadedAt: new Date().toISOString(),
              originalName: fileName,
              ipAddress: ip,
              validationMethod: 'enhanced'
            }
          },
        });

        // Make file publicly readable
        await file.makePublic();
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fullPath}`;

        console.log(`[UPLOAD SUCCESS] User ${decodedToken.uid} uploaded "${fileName}" to "${fullPath}" (${buffer.length} bytes, IP: ${ip})`);

        response.status(200).json({ 
          downloadURL,
          path: fullPath,
          method: 'firebase-functions-v2'
        });
        resolve(undefined);

      } catch (error) {
        console.error('Upload error:', error);
        response.status(500).json({ 
          error: 'Upload failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        resolve(undefined);
      }
    });
  });
}); 