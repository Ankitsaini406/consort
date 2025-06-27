/**
 * 🛡️ CLIENT-SIDE INPUT VALIDATION
 * 
 * Mirrors server-side military-grade validation for immediate user feedback
 * This is the FIRST line of defense - server validation is the FINAL line
 */

export class ClientValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientValidationError';
  }
}

// 🔒 EMAIL VALIDATION (matches server-side)
export function validateEmailClient(email: string): { valid: boolean; error?: string } {
  try {
    // 1. Type validation
    if (typeof email !== 'string') {
      return { valid: false, error: 'Email must be text' };
    }

    // 2. Empty check
    if (!email || email.trim().length === 0) {
      return { valid: false, error: 'Email is required' };
    }

    // 3. Length validation
    if (email.length > 254) {
      return { valid: false, error: 'Email is too long (max 254 characters)' };
    }

    if (email.length < 3) {
      return { valid: false, error: 'Email is too short (min 3 characters)' };
    }

    // 4. Format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }

    // 5. Additional security checks
    if (email.includes('..')) {
      return { valid: false, error: 'Invalid email format' };
    }

    if (email.startsWith('.') || email.endsWith('.')) {
      return { valid: false, error: 'Invalid email format' };
    }

    // 6. Check for dangerous characters
    const dangerousChars = /[<>'"\\]/;
    if (dangerousChars.test(email)) {
      return { valid: false, error: 'Email contains invalid characters' };
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, error: 'Email validation failed' };
  }
}

// 🔒 PASSKEY VALIDATION (matches server-side)
export function validatePasskeyClient(passkey: string): { valid: boolean; error?: string } {
  try {
    // 1. Type validation
    if (typeof passkey !== 'string') {
      return { valid: false, error: 'Passkey must be text' };
    }

    // 2. Empty check
    if (!passkey || passkey.length === 0) {
      return { valid: false, error: 'Passkey is required' };
    }

    // 3. Length validation (bcrypt max 72 chars)
    if (passkey.length > 72) {
      return { valid: false, error: 'Passkey is too long (max 72 characters)' };
    }

    // 4. Minimum length for security
    if (passkey.length < 4) {
      return { valid: false, error: 'Passkey must be at least 4 characters' };
    }

    // 5. Check for null bytes
    if (passkey.includes('\x00')) {
      return { valid: false, error: 'Passkey contains invalid characters' };
    }

    // 6. Check for dangerous control characters
    const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (controlChars.test(passkey)) {
      return { valid: false, error: 'Passkey contains invalid characters' };
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, error: 'Passkey validation failed' };
  }
}

// 🔒 PASSWORD VALIDATION (matches server-side)
export function validatePasswordClient(password: string): { valid: boolean; error?: string } {
  try {
    // 1. Type validation
    if (typeof password !== 'string') {
      return { valid: false, error: 'Password must be text' };
    }

    // 2. Empty check
    if (!password || password.length === 0) {
      return { valid: false, error: 'Password is required' };
    }

    // 3. Length validation (bcrypt max 72 chars)
    if (password.length > 72) {
      return { valid: false, error: 'Password is too long (max 72 characters)' };
    }

    // 4. Check for null bytes
    if (password.includes('\x00')) {
      return { valid: false, error: 'Password contains invalid characters' };
    }

    // 5. Check for dangerous control characters
    const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (controlChars.test(password)) {
      return { valid: false, error: 'Password contains invalid characters' };
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, error: 'Password validation failed' };
  }
}

// 🔒 COMPREHENSIVE AUTH PAYLOAD VALIDATION
export function validateAuthPayloadClient(email: string, passkey?: string, password?: string): { 
  valid: boolean; 
  errors: string[];
  sanitizedData?: { email: string; credential: string; credentialType: 'passkey' | 'password' };
} {
  const errors: string[] = [];

  // Validate email
  const emailValidation = validateEmailClient(email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error || 'Invalid email');
  }

  // Validate credential (either passkey or password)
  let credentialType: 'passkey' | 'password' | null = null;
  let credential = '';

  if (passkey && password) {
    errors.push('Only one credential type allowed');
  } else if (passkey) {
    const passkeyValidation = validatePasskeyClient(passkey);
    if (!passkeyValidation.valid) {
      errors.push(passkeyValidation.error || 'Invalid passkey');
    } else {
      credentialType = 'passkey';
      credential = passkey;
    }
  } else if (password) {
    const passwordValidation = validatePasswordClient(password);
    if (!passwordValidation.valid) {
      errors.push(passwordValidation.error || 'Invalid password');
    } else {
      credentialType = 'password';
      credential = password;
    }
  } else {
    errors.push('Either passkey or password is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitizedData: {
      email: email.trim().toLowerCase(),
      credential,
      credentialType: credentialType!
    }
  };
}

// 🔒 REAL-TIME VALIDATION HELPERS
export function getEmailValidationState(email: string): 'valid' | 'invalid' | 'empty' {
  if (!email || email.trim().length === 0) return 'empty';
  return validateEmailClient(email).valid ? 'valid' : 'invalid';
}

export function getPasskeyValidationState(passkey: string): 'valid' | 'invalid' | 'empty' {
  if (!passkey || passkey.length === 0) return 'empty';
  return validatePasskeyClient(passkey).valid ? 'valid' : 'invalid';
}

export function getPasswordValidationState(password: string): 'valid' | 'invalid' | 'empty' {
  if (!password || password.length === 0) return 'empty';
  return validatePasswordClient(password).valid ? 'valid' : 'invalid';
}

// 🔒 INPUT SANITIZATION FOR DISPLAY
export function sanitizeForDisplay(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// 🔒 SECURITY LOGGING FOR CLIENT-SIDE
export function logClientValidationError(field: string, error: string): void {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[CLIENT-VALIDATION] ${field}: ${error}`);
  }
} 