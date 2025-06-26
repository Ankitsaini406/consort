'use client';

import { FirebaseError } from 'firebase/app';
import { useAlert } from '@/context/AlertContext';
import eventEmitter from '@/lib/eventEmitter';

interface FormError {
    message: string;
    code?: string;
    field?: string;
    type: 'validation' | 'network' | 'firebase' | 'json' | 'unknown';
}

export class FormErrorHandler {
    /**
     * Handles Firebase-specific errors and returns user-friendly messages
     */
    static handleFirebaseError(error: FirebaseError): FormError {
        const errorMap: Record<string, string> = {
            'permission-denied': 'You do not have permission to perform this action.',
            'unavailable': 'Service is temporarily unavailable. Please try again later.',
            'deadline-exceeded': 'Request timed out. Please try again.',
            'resource-exhausted': 'Service is temporarily overloaded. Please try again later.',
            'unauthenticated': 'Authentication required. Please log in.',
            'not-found': 'The requested resource was not found.',
            'already-exists': 'This item already exists.',
            'invalid-argument': 'Invalid data provided. Please check your input.',
        };

        return {
            message: errorMap[error.code] || 'An unexpected error occurred. Please try again.',
            code: error.code,
            type: 'firebase'
        };
    }

    /**
     * Handles validation errors
     */
    static handleValidationError(field: string, message: string): FormError {
        return {
            message,
            field,
            type: 'validation'
        };
    }

    /**
     * Handles network-related errors
     */
    static handleNetworkError(error: Error): FormError {
        if (error.message.includes('Failed to fetch')) {
            return {
                message: 'Network connection failed. Please check your internet connection and try again.',
                type: 'network'
            };
        }

        return {
            message: 'Network error occurred. Please try again.',
            type: 'network'
        };
    }

    /**
     * Handles JSON parsing errors
     */
    static handleJSONError(error: Error): FormError {
        if (error.message.includes('Unexpected token') || 
            error.message.includes('JSON') || 
            error.message.includes('<!DOCTYPE')) {
            return {
                message: 'Invalid response format received. Please try again or contact support.',
                type: 'json'
            };
        }

        return {
            message: 'Data parsing error occurred. Please try again.',
            type: 'json'
        };
    }

    /**
     * Generic error handler that determines error type and routes to appropriate handler
     */
    static handleError(error: unknown): FormError {
        // Handle null/undefined errors
        if (!error) {
            return {
                message: 'An unknown error occurred. Please try again.',
                type: 'unknown'
            };
        }

        // Firebase error
        if (error && typeof error === 'object' && 'code' in error) {
            return this.handleFirebaseError(error as FirebaseError);
        }

        // Handle Error objects
        if (error instanceof Error) {
            // JSON parsing errors
            if (error.message.includes('Unexpected token') || 
                error.message.includes('JSON') || 
                error.message.includes('<!DOCTYPE')) {
                return this.handleJSONError(error);
            }

            // Network errors
            if (error.message.includes('fetch') || 
                error.message.includes('network') || 
                error.message.includes('connection')) {
                return this.handleNetworkError(error);
            }

            // Rate limiting errors
            if (error.message.includes('Rate limit exceeded')) {
                return {
                    message: error.message,
                    type: 'validation'
                };
            }

            // Generic error
            return {
                message: error.message || 'An unexpected error occurred.',
                type: 'unknown'
            };
        }

        // Handle string errors
        if (typeof error === 'string') {
            return {
                message: error,
                type: 'unknown'
            };
        }

        // Unknown error type
        return {
            message: 'An unexpected error occurred. Please try again.',
            type: 'unknown'
        };
    }

    /**
     * Logs errors for debugging and monitoring
     */
    static logError(error: unknown, context: string = 'Unknown'): void {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            context,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
            url: typeof window !== 'undefined' ? window.location.href : 'Server'
        };

        console.error(`[${context}] Error logged:`, errorInfo);

        // In production, you might want to send this to a logging service
        // Example: sendToLoggingService(errorInfo);
    }
}

// A simple component that can access the alert context
const Notifier = ({ type, message }: { type: 'success' | 'error' | 'warning', message: string }) => {
    const { showAlert } = useAlert();
    showAlert(message, type);
    return null; // This component doesn't render anything
};

/**
 * User notification utility for consistent error/success messaging
 */
export class UserNotification {
    static showError(error: FormError | string): void {
        const message = typeof error === 'string' ? error : error.message;
        console.error('User Error:', message);
        eventEmitter.emit('showAlert', { message, type: 'error' });
    }

    static showSuccess(message: string): void {
        console.log('Success:', message);
        eventEmitter.emit('showAlert', { message, type: 'success' });
    }

    static showWarning(message: string): void {
        console.warn('Warning:', message);
        eventEmitter.emit('showAlert', { message, type: 'warning' });
    }
}

/**
 * Input sanitization utilities - Production-ready XSS prevention
 */
export class InputSanitizer {
    // Comprehensive list of dangerous HTML tags
    private static readonly DANGEROUS_TAGS = [
        'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button',
        'link', 'meta', 'style', 'base', 'applet', 'body', 'html', 'head', 'title', 'frame',
        'frameset', 'noframes', 'noscript', 'xml', 'import', 'template'
    ];

    // Dangerous protocols
    private static readonly DANGEROUS_PROTOCOLS = [
        'javascript:', 'data:', 'vbscript:', 'file:', 'about:', 'chrome:', 'chrome-extension:',
        'moz-extension:', 'ms-browser-extension:', 'livescript:', 'mocha:'
    ];

    // Event handlers pattern
    private static readonly EVENT_HANDLERS = /\s*on\w+\s*=/gi;

    /**
     * Validate input type and handle malformed data
     */
    static validateInput(input: unknown): { isValid: boolean; sanitized: string; error?: string } {
        // Handle null/undefined
        if (input === null || input === undefined) {
            return { isValid: true, sanitized: '' };
        }

        // Handle non-string types
        if (typeof input !== 'string') {
            // Try to convert to string safely
            try {
                const converted = String(input);
                return { isValid: true, sanitized: this.sanitizeString(converted) };
            } catch (error) {
                return { 
                    isValid: false, 
                    sanitized: '', 
                    error: `Invalid input type: ${typeof input}. Expected string.` 
                };
            }
        }

        return { isValid: true, sanitized: input };
    }

    /**
     * Sanitize string input to prevent XSS - Enhanced security
     */
    static sanitizeString(input: string): string {
        const validation = this.validateInput(input);
        if (!validation.isValid) return '';
        
        let sanitized = validation.sanitized;

        // Remove all HTML tags completely for plain text fields
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        
        // Remove dangerous protocols
        this.DANGEROUS_PROTOCOLS.forEach(protocol => {
            const regex = new RegExp(protocol.replace(':', '\\s*:\\s*'), 'gi');
            sanitized = sanitized.replace(regex, '');
        });

        // Remove event handlers
        sanitized = sanitized.replace(this.EVENT_HANDLERS, '');

        // Remove HTML entities that could be used for XSS
        sanitized = sanitized
            .replace(/&lt;/g, '')
            .replace(/&gt;/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&#x5C;/g, '\\')
            .replace(/&#96;/g, '`');

        // Remove zero-width characters and other invisible characters
        sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

        return sanitized.trim();
    }

    /**
     * Sanitize HTML content with whitelist approach - Maximum security
     */
    static sanitizeHTML(input: string): string {
        const validation = this.validateInput(input);
        if (!validation.isValid) return '';
        
        let sanitized = validation.sanitized;

        // Remove all dangerous tags completely
        this.DANGEROUS_TAGS.forEach(tag => {
            const regex = new RegExp(`<\\s*\\/?\\s*${tag}\\b[^>]*>`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });

        // Remove dangerous protocols from any remaining attributes
        this.DANGEROUS_PROTOCOLS.forEach(protocol => {
            const regex = new RegExp(`${protocol.replace(':', '\\s*:\\s*')}[^\\s"'>]*`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });

        // Remove all event handlers
        sanitized = sanitized.replace(this.EVENT_HANDLERS, '');

        // Remove style attributes that could contain expressions
        sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

        // Remove any remaining script content between tags
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove comments that could contain malicious code
        sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

        // Remove CDATA sections
        sanitized = sanitized.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

        // Clean up any malformed tags
        sanitized = sanitized.replace(/<[^>]*(?:[^>]>|$)/g, (match) => {
            // Only allow basic formatting tags
            const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            const tagMatch = match.match(/<\s*(\/?)\s*(\w+)/);
            
            if (tagMatch && allowedTags.includes(tagMatch[2].toLowerCase())) {
                // Return clean version of allowed tag
                const isClosing = tagMatch[1] === '/';
                const tagName = tagMatch[2].toLowerCase();
                return isClosing ? `</${tagName}>` : `<${tagName}>`;
            }
            
            return ''; // Remove disallowed tags
        });

        return sanitized.trim();
    }

    /**
     * Sanitize file names
     */
    static sanitizeFileName(fileName: string): string {
        if (!fileName || typeof fileName !== 'string') return '';
        
        return fileName
            .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .substring(0, 255); // Limit length
    }

    /**
     * Validates and sanitizes file uploads
     */
    static validateFile(file: File, allowedTypes: string[], maxSize: number): { isValid: boolean; error?: string } {
        // Check if file is actually a File object
        if (!(file instanceof File)) {
            return {
                isValid: false,
                error: 'Invalid file object provided'
            };
        }

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
            };
        }

        // Check file size
        if (file.size > maxSize) {
            return {
                isValid: false,
                error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
            };
        }

        // Check for empty files
        if (file.size === 0) {
            return {
                isValid: false,
                error: 'File is empty'
            };
        }

        return { isValid: true };
    }

    /**
     * Comprehensive data validation for form data
     */
    static validateFormData(data: unknown): { isValid: boolean; sanitized: any; errors: string[] } {
        const errors: string[] = [];
        
        if (data === null || data === undefined) {
            return { isValid: false, sanitized: {}, errors: ['Form data is required'] };
        }

        if (typeof data !== 'object') {
            return { isValid: false, sanitized: {}, errors: ['Form data must be an object'] };
        }

        const sanitized: any = {};

        try {
            for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
                const result = this.validateAndSanitizeField(key, value);
                if (result.isValid) {
                    sanitized[key] = result.sanitized;
                } else {
                    errors.push(`${key}: ${result.error}`);
                    sanitized[key] = result.sanitized; // Use sanitized fallback
                }
            }
        } catch (error) {
            errors.push('Failed to process form data structure');
            return { isValid: false, sanitized: {}, errors };
        }

        return { 
            isValid: errors.length === 0, 
            sanitized, 
            errors 
        };
    }

    /**
     * Validate and sanitize individual form fields
     */
    static validateAndSanitizeField(fieldName: string, value: unknown): { isValid: boolean; sanitized: any; error?: string } {
        try {
            // Handle arrays (like sections, tags, etc.)
            if (Array.isArray(value)) {
                const sanitizedArray = value.map((item, index) => {
                    if (typeof item === 'string') {
                        return this.sanitizeString(item);
                    } else if (typeof item === 'object' && item !== null) {
                        const result = this.validateFormData(item);
                        return result.sanitized;
                    } else if (item instanceof File) {
                        return item; // Files are validated separately
                    }
                    return item;
                });
                return { isValid: true, sanitized: sanitizedArray };
            }

            // Handle objects (like section items)
            if (typeof value === 'object' && value !== null && !(value instanceof File)) {
                const result = this.validateFormData(value);
                return { 
                    isValid: result.isValid, 
                    sanitized: result.sanitized, 
                    error: result.errors.join(', ') 
                };
            }

            // Handle strings
            if (typeof value === 'string') {
                // Determine if field should allow HTML based on field name
                const htmlFields = ['content', 'description', 'headline', 'sectionContent'];
                const isHtmlField = htmlFields.some(field => 
                    fieldName.toLowerCase().includes(field.toLowerCase())
                );

                const sanitized = isHtmlField 
                    ? this.sanitizeHTML(value)
                    : this.sanitizeString(value);

                return { isValid: true, sanitized };
            }

            // Handle Files
            if (value instanceof File) {
                return { isValid: true, sanitized: value };
            }

            // Handle primitives (numbers, booleans, null)
            if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
                return { isValid: true, sanitized: value };
            }

            // Handle undefined
            if (value === undefined) {
                return { isValid: true, sanitized: null };
            }

            // Unknown type - try to convert safely
            const validation = this.validateInput(value);
            return {
                isValid: validation.isValid,
                sanitized: validation.sanitized,
                error: validation.error
            };

        } catch (error) {
            return {
                isValid: false,
                sanitized: null,
                error: `Failed to process field ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
} 