/**
 * 🔒 SECURE ERROR LOGGING UTILITY
 * 
 * Prevents information disclosure through error logs while maintaining
 * debugging capabilities for development and correlation IDs for production
 */

import crypto from 'crypto';

// Error code mapping for known security errors
const SECURITY_ERROR_CODES = {
  // Authentication errors
  'VALIDATION_FAILED': 'AUTH_001',
  'INVALID_JSON': 'AUTH_002', 
  'PAYLOAD_TOO_LARGE': 'AUTH_003',
  'CSRF_FAILED': 'AUTH_004',
  'IP_ATTACK_DETECTED': 'AUTH_005',
  'USER_NOT_FOUND': 'AUTH_006',
  'INVALID_PASSKEY': 'AUTH_007',
  'INVALID_PASSWORD': 'AUTH_008',
  'ACCOUNT_LOCKED': 'AUTH_009',
  'ACCOUNT_NOT_CONFIGURED': 'AUTH_010',
  'TOKEN_VERIFICATION_FAILED': 'AUTH_011',
  'INVALID_TOKEN_STEP': 'AUTH_012',
  'PASSWORD_NOT_CONFIGURED': 'AUTH_013',
  'MISSING_CREDENTIALS': 'AUTH_014',
  
  // Security utility errors
  'CSRF_GENERATION_ERROR': 'SEC_001',
  'CSRF_VERIFICATION_ERROR': 'SEC_002',
  'SECURE_COMPARISON_ERROR': 'SEC_003',
  'LOCKOUT_UPDATE_ERROR': 'SEC_004',
  'AUDIT_LOG_ERROR': 'SEC_005',
  
  // Generic errors
  'UNKNOWN_ERROR': 'GEN_001',
  'INTERNAL_ERROR': 'GEN_002'
} as const;

type SecurityErrorCode = keyof typeof SECURITY_ERROR_CODES;

interface SecureLogEntry {
  correlationId: string;
  errorCode: string;
  context: string;
  timestamp: string;
  sanitizedMessage?: string;
}

/**
 * Generate a correlation ID for tracking errors across logs
 */
function generateCorrelationId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Sanitize error message to remove sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  // Remove file paths
  let sanitized = message.replace(/\/[^\s]*\.ts/g, '[FILE_PATH]');
  sanitized = sanitized.replace(/\/[^\s]*\.js/g, '[FILE_PATH]');
  
  // Remove line numbers
  sanitized = sanitized.replace(/:\d+:\d+/g, '[LINE_NUM]');
  
  // Remove stack trace references
  sanitized = sanitized.replace(/at\s+[^\s]+\s+\([^)]+\)/g, '[STACK_TRACE]');
  
  // Remove internal module paths
  sanitized = sanitized.replace(/node_modules\/[^\s]*/g, '[NODE_MODULE]');
  
  // Remove potential connection strings or URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');
  sanitized = sanitized.replace(/mongodb:\/\/[^\s]+/g, '[DB_URL]');
  
  return sanitized;
}

/**
 * Map error message to security error code
 */
function getErrorCode(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  // Check for known error codes
  for (const [key, code] of Object.entries(SECURITY_ERROR_CODES)) {
    if (message.includes(key)) {
      return code;
    }
  }
  
  // Check for common error patterns
  if (message.toLowerCase().includes('csrf')) return SECURITY_ERROR_CODES.CSRF_VERIFICATION_ERROR;
  if (message.toLowerCase().includes('token')) return SECURITY_ERROR_CODES.TOKEN_VERIFICATION_FAILED;
  if (message.toLowerCase().includes('lockout')) return SECURITY_ERROR_CODES.LOCKOUT_UPDATE_ERROR;
  if (message.toLowerCase().includes('audit')) return SECURITY_ERROR_CODES.AUDIT_LOG_ERROR;
  
  return SECURITY_ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * 🔒 SECURE ERROR LOGGER
 * Logs errors without exposing sensitive information
 */
export function logSecurityError(
  context: string,
  error: Error | string,
  additionalContext?: Record<string, any>
): string {
  const correlationId = generateCorrelationId();
  const errorCode = getErrorCode(error);
  const message = typeof error === 'string' ? error : error.message;
  const sanitizedMessage = sanitizeErrorMessage(message);
  
  const logEntry: SecureLogEntry = {
    correlationId,
    errorCode,
    context,
    timestamp: new Date().toISOString(),
    sanitizedMessage: process.env.NODE_ENV === 'development' ? sanitizedMessage : undefined
  };
  
  // Production logging - minimal information
  if (process.env.NODE_ENV === 'production') {
    console.error(`[SECURITY] ${context}: ${errorCode} | Correlation: ${correlationId}`);
    
    // Log additional context if provided (but sanitized)
    if (additionalContext) {
      const sanitizedContext = Object.keys(additionalContext).reduce((acc, key) => {
        // Only log safe context keys
        if (['ip', 'userAgent', 'method', 'path'].includes(key)) {
          acc[key] = typeof additionalContext[key] === 'string' 
            ? additionalContext[key].substring(0, 50) + '...'
            : '[REDACTED]';
        }
        return acc;
      }, {} as Record<string, string>);
      
      if (Object.keys(sanitizedContext).length > 0) {
        console.error(`[SECURITY] Context ${correlationId}:`, sanitizedContext);
      }
    }
  } 
  // Development logging - more detailed but still sanitized
  else {
    console.error(`[SECURITY] ${context}: ${errorCode}`);
    console.error(`[SECURITY] Correlation: ${correlationId}`);
    console.error(`[SECURITY] Sanitized message: ${sanitizedMessage}`);
    
    if (additionalContext) {
      console.error(`[SECURITY] Context:`, additionalContext);
    }
  }
  
  return correlationId;
}

/**
 * 🔒 SECURE GENERAL ERROR LOGGER
 * For non-security errors that still need sanitization
 */
export function logSecureError(
  context: string,
  error: Error | string,
  level: 'error' | 'warn' | 'info' = 'error'
): string {
  const correlationId = generateCorrelationId();
  const message = typeof error === 'string' ? error : error.message;
  const sanitizedMessage = sanitizeErrorMessage(message);
  
  const logFn = level === 'error' ? console.error : 
                level === 'warn' ? console.warn : console.log;
  
  if (process.env.NODE_ENV === 'production') {
    logFn(`[${level.toUpperCase()}] ${context}: Error occurred | Correlation: ${correlationId}`);
  } else {
    logFn(`[${level.toUpperCase()}] ${context}: ${sanitizedMessage} | Correlation: ${correlationId}`);
  }
  
  return correlationId;
}

/**
 * 🔒 AUDIT SAFE ERROR LOGGER
 * For audit logging that needs to be completely sanitized
 */
export function logAuditError(
  operation: string,
  error: Error | string,
  userId?: string
): string {
  const correlationId = generateCorrelationId();
  const errorCode = getErrorCode(error);
  
  // Never log user IDs in production, only correlation
  const userRef = userId ? `User:${userId.substring(0, 8)}***` : 'Unknown';
  
  console.error(`[AUDIT] ${operation} failed: ${errorCode} | ${userRef} | Correlation: ${correlationId}`);
  
  return correlationId;
}

export { SECURITY_ERROR_CODES };
export type { SecurityErrorCode, SecureLogEntry }; 