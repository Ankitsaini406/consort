/**
 * Input sanitization utilities to prevent XSS and other injection attacks
 */

/**
 * Sanitize email input
 * Removes potentially dangerous characters while preserving valid email format
 * NOTE: This only sanitizes, it does NOT validate. Use isValidEmail() for validation.
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    
    // Remove dangerous characters but preserve email-typing experience
    let sanitized = email
        .trim()
        .toLowerCase()
        // Remove HTML tags and dangerous characters
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/onload/gi, '')
        .replace(/onerror/gi, '')
        .replace(/onclick/gi, '');
    
    // Limit length to prevent buffer overflow attacks
    if (sanitized.length > 254) {
        sanitized = sanitized.substring(0, 254);
    }
    
    // Only keep characters that are valid in email addresses
    // This allows partial emails while typing (like "john" or "john@gm")
    sanitized = sanitized.replace(/[^a-zA-Z0-9._%+-@]/g, '');
    
    return sanitized;
}

/**
 * Sanitize password input
 * Removes dangerous characters while preserving password complexity
 */
export function sanitizePassword(password: string): string {
    if (!password || typeof password !== 'string') return '';
    
    // Remove HTML tags and dangerous script-related content
    let sanitized = password
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/onload/gi, '')
        .replace(/onerror/gi, '')
        .replace(/onclick/gi, '');
    
    // Limit length to prevent buffer overflow attacks
    if (sanitized.length > 128) {
        sanitized = sanitized.substring(0, 128);
    }
    
    return sanitized;
}

/**
 * Sanitize general text input
 * For use with form fields that accept text
 */
export function sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/data:/gi, '') // Remove data: protocols
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols
        .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
        return { isValid: false, message: 'Password is too long' };
    }
    
    return { isValid: true };
}

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Remove potential SQL injection patterns (though not needed for Firebase)
 * Included for completeness and future compatibility
 */
export function sanitizeSQLInjection(input: string): string {
    return input
        .replace(/('|(\\))/g, "\\$1")
        .replace(/(;|--|\|)/g, '')
        .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '');
} 