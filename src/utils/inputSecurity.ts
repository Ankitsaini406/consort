export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic XSS vectors
    .replace(/['"]/g, '') // Remove quotes that could break queries
    .substring(0, 255); // Limit length to prevent abuse
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255 && email.length >= 5;
}

export function sanitizeCredentials(email: string, password: string) {
  return {
    email: sanitizeInput(email.toLowerCase()),
    password: password.substring(0, 128), // Limit password length but don't sanitize content
  };
}

export function validatePasskey(passkey: string): boolean {
  if (!passkey || typeof passkey !== 'string') return false;
  
  // Basic validation - adjust based on your passkey format
  return passkey.length >= 4 && passkey.length <= 50;
}

export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Basic XSS protection
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Reasonable length limit
}

export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.length >= 1 && name.length <= 100;
}

export function detectSuspiciousInput(input: string): boolean {
  if (!input) return false;
  
  const suspiciousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
    /data:text\/html/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
} 