// send-otp.ts
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { ProductFormData } from "@/app/admin/products/form/types";
import { auth, storage } from "./firebaseconfig";

declare global {
    interface Window {
        recaptchaVerifier: import("firebase/auth").RecaptchaVerifier;
        confirmationResult: import("firebase/auth").ConfirmationResult;
        lastOtpSent?: number; // Add timestamp for rate limiting
    }
}

// Rate limiting: Allow OTP every 30 seconds
const OTP_RATE_LIMIT_MS = 30000;

export const sendOTP = async (phoneNumber: string) => {
    const fullNumber = `+91${phoneNumber}`;
    
    // Rate limiting check
    const now = Date.now();
    if (window.lastOtpSent && (now - window.lastOtpSent) < OTP_RATE_LIMIT_MS) {
        const remainingSeconds = Math.ceil((OTP_RATE_LIMIT_MS - (now - window.lastOtpSent)) / 1000);
        return { 
            success: false, 
            error: `Please wait ${remainingSeconds} seconds before requesting another OTP` 
        };
    }
    
    console.log(`This is phone and recaptchaVerifier`, window.recaptchaVerifier);
    try {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: () => {
                        console.log("reCAPTCHA solved");
                    },
                    "expired-callback": () => {
                        console.warn("reCAPTCHA expired");
                    },
                },
            );
        }

        const appVerifier = window.recaptchaVerifier;

        console.log(`appVerifier`, appVerifier);

        return signInWithPhoneNumber(auth, fullNumber, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                window.lastOtpSent = Date.now(); // Set timestamp for rate limiting
                return { success: true };
            })
            .catch((error) => {
                console.log(`recaptchaVerifier`, error);
                return { success: false, error: error.message };
            });
    } catch (error) {
        console.error(error);
        return { success: false, error: "Something went wrong" };
    }
};

export const verifyOTP = async (otp: string) => {
    try {
        // Check if confirmationResult exists and hasn't expired (Firebase default is 5 minutes)
        if (!window.confirmationResult) {
            return { success: false, error: 'No OTP request found. Please request a new OTP.' };
        }

        // Check if OTP was sent more than 5 minutes ago (Firebase timeout)
        const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
        if (window.lastOtpSent && (Date.now() - window.lastOtpSent) > OTP_EXPIRY_MS) {
            return { success: false, error: 'OTP has expired. Please request a new OTP.' };
        }

        const result = await window.confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();
        return { success: true, idToken, phoneNumber: firebaseUser.phoneNumber };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};

/**
 * Get the current user's Firebase ID token for server-side API calls
 */
export const getAuthToken = async (): Promise<string | null> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn('[AUTH] No authenticated user found');
            return null;
        }

        const token = await user.getIdToken();
        
        return token;
    } catch (error) {
        console.error('[AUTH] Failed to get Firebase ID token:', error);
        return null;
    }
};

/**
 * Make authenticated API request with Firebase token
 * Fixed: Normalize URLs to prevent trailing slash redirect loops
 */
export const makeAuthenticatedRequest = async (
    url: string, 
    options: RequestInit = {}
): Promise<Response> => {
    const token = await getAuthToken();
    
    const headers = new Headers(options.headers);
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    // 🔧 FIX: Normalize all URLs to prevent trailing slash redirect loops
    // Remove trailing slash for any URL to match Next.js trailingSlash: false config
    let normalizedUrl = url;
    if (url.endsWith('/') && url.length > 1) {
        normalizedUrl = url.slice(0, -1);
        console.log(`[API] Normalized URL: ${url} → ${normalizedUrl}`);
    }
    
    return fetch(normalizedUrl, {
        ...options,
        headers,
    });
};

export const uploadDoc = async (path: string, file: File): Promise<string> => {
    if (!file || typeof file.name !== 'string') {
        throw new Error("Invalid file provided for upload");
    }

    try {
        console.log('[DEBUG] Starting client-side upload...');
        
        // Check if user is authenticated
        const { auth } = await import('@/firebase/firebaseconfig');
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to upload files");
        }
        
        console.log('[DEBUG] User authenticated:', auth.currentUser.email);
        
        // Import Firebase Storage functions
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('@/firebase/firebaseconfig');
        
        // Sanitize path segments
        const pathSegments = path.split('/').filter(segment => segment.length > 0);
        const sanitizedSegments = pathSegments.map(segment => 
            segment.replace(/[^a-zA-Z0-9\-_\.]/g, '_')
        );
        
        // Create unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const sanitizedFileName = baseFileName.replace(/[^a-zA-Z0-9\-_]/g, '_');
        const uniqueFileName = `${sanitizedFileName}_${timestamp}.${fileExtension}`;
        
        // Construct the full path
        const sanitizedPath = sanitizedSegments.join('/');
        const userIdentifier = auth.currentUser.uid.replace(/[^a-zA-Z0-9]/g, '_');
        const fullPath = `${sanitizedPath}/${uniqueFileName}`;
        
        console.log('[DEBUG] Uploading to path:', fullPath);
        
        // Upload directly to Firebase Storage
        const storageRef = ref(storage, fullPath);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        console.log('[DEBUG] Upload successful:', downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error('[DEBUG] Upload failed:', error);
        throw error;
    }
};

// Legacy function for backward compatibility - now uses direct client-side upload
export const uploadImage = uploadDoc;

export function removeFileObjects<T extends Record<string, unknown>>(obj: T): T {
    const clone: Record<string, unknown> = { ...obj };

    for (const key in clone) {
        const value = clone[key];

        if (value instanceof File) {
            // Remove the key if it's a File object
            delete clone[key];
        } else if (Array.isArray(value)) {
            // Recursively process arrays
            clone[key] = value.map((item) => {
                if (typeof item === "object" && item !== null && !(item instanceof File)) {
                    return removeFileObjects(item);
                }
                return item;
            }).filter(item => !(item instanceof File)); // Also filter out files from the array itself
        } else if (typeof value === "object" && value !== null) {
            // Recursively process nested objects
            clone[key] = removeFileObjects(value as Record<string, unknown>);
        }
    }

    return clone as T;
}

function isProductFormData(obj: unknown): obj is ProductFormData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'productName' in obj &&
        'marketingTagline' in obj &&
        'productOverview' in obj
    );
}

