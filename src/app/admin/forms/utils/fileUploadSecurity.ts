import { InputSanitizer } from './errorHandler';

// File type configurations
export const ALLOWED_FILE_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/gif'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  archives: [
    'application/zip',
    'application/x-zip-compressed'
  ]
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 8 * 1024 * 1024,      // 8MB for images
  document: 10 * 1024 * 1024,  // 10MB for documents
  archive: 50 * 1024 * 1024,   // 50MB for archives
  default: 5 * 1024 * 1024     // 5MB default
} as const;

// Dangerous file extensions and MIME types
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1'
];

const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/javascript',
  'text/javascript',
  'application/x-php',
  'application/x-httpd-php'
];

// Magic number signatures for file type validation
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/avif': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // AVIF signature: ftyp box at offset 4
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/zip': [0x50, 0x4B, 0x03, 0x04],
} as const;

// Unified secure file type registry - single source of truth
// This prevents MIME/Extension/Signature mismatches and standardizes validation
const SECURE_FILE_TYPES = {
  'image/jpeg': { 
    extensions: ['.jpg', '.jpeg'], 
    signature: [0xFF, 0xD8, 0xFF],
    maxSize: 10 * 1024 * 1024, // 10MB
    scanContent: false // Binary file, no content scan needed
  },
  'image/png': { 
    extensions: ['.png'], 
    signature: [0x89, 0x50, 0x4E, 0x47],
    maxSize: 10 * 1024 * 1024, // 10MB
    scanContent: false
  },
  'image/gif': { 
    extensions: ['.gif'], 
    signature: [0x47, 0x49, 0x46],
    maxSize: 10 * 1024 * 1024, // 10MB
    scanContent: false
  },
  'image/webp': { 
    extensions: ['.webp'], 
    signature: [0x52, 0x49, 0x46, 0x46],
    maxSize: 5 * 1024 * 1024, // 5MB
    scanContent: false
  },
  'image/avif': { 
    extensions: ['.avif'], 
    signature: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp box signature
    maxSize: 8 * 1024 * 1024, // 8MB - AVIF is highly compressed
    scanContent: false // Binary file, no content scan needed
  },
  'image/svg+xml': { 
    extensions: ['.svg'], 
    signature: [0x3C, 0x73, 0x76, 0x67], // <svg
    maxSize: 1 * 1024 * 1024, // 1MB (SVG can contain scripts)
    scanContent: true // CRITICAL: SVG can contain XSS scripts
  },
  'application/pdf': { 
    extensions: ['.pdf'], 
    signature: [0x25, 0x50, 0x44, 0x46], // %PDF
    maxSize: 10 * 1024 * 1024, // 10MB
    scanContent: true // PDF can contain JavaScript
  }
} as const;

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedName?: string;
  detectedType?: string;
  securityScore: number; // 0-100, higher is safer
}

interface FileUploadConfig {
  allowedTypes: string[];
  maxSize: number;
  allowExecutables: boolean;
  requireSignatureValidation: boolean;
  sanitizeFilenames: boolean;
  // scanForMalware removed - not implemented and was causing confusion
}

/**
 * Comprehensive file upload security utility
 */
export class FileUploadSecurity {
  /**
   * Validate file with comprehensive security checks
   */
  static async validateFile(
    file: File,
    config: Partial<FileUploadConfig> = {}
  ): Promise<FileValidationResult> {
    const defaultConfig: FileUploadConfig = {
      allowedTypes: [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents],
      maxSize: FILE_SIZE_LIMITS.default,
      allowExecutables: false,
      requireSignatureValidation: true,
      sanitizeFilenames: true,
      ...config
    };

    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityScore: 100
    };

    // 1. Basic file validation
    await this.validateBasicProperties(file, defaultConfig, result);

    // 2. Filename security validation
    if (defaultConfig.sanitizeFilenames) {
      result.sanitizedName = this.sanitizeFilename(file.name);
    }

    // 3. Unified file type consistency validation (MIME + Extension + Signature)
    // This replaces legacy MIME type and signature validation with comprehensive checking
    const consistencyCheck = await this.validateFileTypeConsistency(file);
    if (!consistencyCheck.isValid) {
      result.errors.push(...consistencyCheck.errors);
      result.securityScore -= 60; // Major security issue
    } else {
      // Only run legacy checks if unified validation passes (for additional compatibility)
      if (!defaultConfig.allowedTypes.includes(file.type)) {
        result.warnings.push(`File type ${file.type} not in legacy allowedTypes list`);
        result.securityScore -= 5;
      }
    }

    // 6. Content security scanning (now memory-safe)
    await this.scanFileContent(file, result);

    // 7. Executable detection
    if (!defaultConfig.allowExecutables) {
      this.detectExecutables(file, result);
    }

    // 8. Calculate final security score
    this.calculateSecurityScore(result);

    // Final validation
    result.isValid = result.errors.length === 0 && result.securityScore >= 50;

    return result;
  }

  /**
   * Validate basic file properties
   */
  private static async validateBasicProperties(
    file: File,
    config: FileUploadConfig,
    result: FileValidationResult
  ): Promise<void> {
    // File size validation
    if (file.size > config.maxSize) {
      result.errors.push(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(config.maxSize / 1024 / 1024).toFixed(2)}MB`
      );
      result.securityScore -= 30;
    }

    // Empty file check
    if (file.size === 0) {
      result.errors.push('File is empty');
      result.securityScore -= 50;
    }

    // Extremely large file warning
    if (file.size > 100 * 1024 * 1024) { // 100MB
      result.warnings.push('File is very large and may impact performance');
      result.securityScore -= 10;
    }
  }

  /**
   * Sanitize filename to prevent path traversal and other attacks
   */
  static sanitizeFilename(filename: string): string {
    // Remove path separators and dangerous characters
    let sanitized = filename
      .replace(/[\/\\:*?"<>|]/g, '_')  // Replace dangerous characters
      .replace(/\.\./g, '_')           // Remove path traversal attempts
      .replace(/^\.+/, '')             // Remove leading dots
      .trim();

    // Ensure filename isn't empty
    if (!sanitized) {
      sanitized = 'file';
    }

    // Limit filename length
    if (sanitized.length > 255) {
      const ext = sanitized.substring(sanitized.lastIndexOf('.'));
      sanitized = sanitized.substring(0, 255 - ext.length) + ext;
    }

    // Add timestamp to prevent conflicts
    const timestamp = Date.now();
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0) {
      sanitized = sanitized.substring(0, lastDot) + `_${timestamp}` + sanitized.substring(lastDot);
    } else {
      sanitized += `_${timestamp}`;
    }

    return sanitized;
  }

  /**
   * Validate MIME type against allowed types
   */
  private static async validateMimeType(
    file: File,
    config: FileUploadConfig,
    result: FileValidationResult
  ): Promise<void> {
    if (!config.allowedTypes.includes(file.type)) {
      result.errors.push(
        `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      );
      result.securityScore -= 40;
    }

    // Check for dangerous MIME types
    if (DANGEROUS_MIME_TYPES.includes(file.type)) {
      result.errors.push('File type is potentially dangerous');
      result.securityScore -= 60;
    }
  }

  /**
   * Validate file signature (magic numbers) to prevent MIME type spoofing
   */
  private static async validateFileSignature(
    file: File,
    result: FileValidationResult
  ): Promise<void> {
    try {
      const buffer = await file.slice(0, 16).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      const expectedSignature = FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
      
      if (expectedSignature) {
        const matches = expectedSignature.every((byte, index) => bytes[index] === byte);
        
        if (!matches) {
          result.errors.push('File signature does not match declared type (possible spoofing attempt)');
          result.securityScore -= 50;
        } else {
          result.detectedType = file.type;
        }
      } else {
        result.warnings.push('File signature validation not available for this type');
        result.securityScore -= 5;
      }
    } catch (error) {
      result.warnings.push('Could not validate file signature');
      result.securityScore -= 10;
    }
  }

  /**
   * Scan file content for suspicious patterns
   * Updated to use memory-safe scanning and type-specific logic
   */
  private static async scanFileContent(
    file: File,
    result: FileValidationResult
  ): Promise<void> {
    try {
      // Get file type definition for smart scanning
      const fileTypeDef = SECURE_FILE_TYPES[file.type as keyof typeof SECURE_FILE_TYPES];
      
      // Skip content scanning for large files to prevent memory exhaustion
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        result.warnings.push('File too large for content scanning - relying on signature validation only');
        return;
      }
      
      // Only scan content for file types that need it
      if (fileTypeDef?.scanContent) {
        await this.scanFileContentSecurely(file, result);
      }
      
      // For all files, check for embedded executables (only read first 64 bytes)
      const headerBuffer = await file.slice(0, 64).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      
      // Check for PE header (Windows executable)
      if (this.containsExecutableSignature(headerBytes)) {
        result.errors.push('File contains executable code');
        result.securityScore -= 70;
      }

    } catch (error) {
      result.warnings.push('Could not scan file content');
      result.securityScore -= 5;
    }
  }

  /**
   * Detect executable files by extension and content
   */
  private static detectExecutables(
    file: File,
    result: FileValidationResult
  ): void {
    const filename = file.name.toLowerCase();
    
    for (const ext of DANGEROUS_EXTENSIONS) {
      if (filename.endsWith(ext)) {
        result.errors.push(`Executable file extension ${ext} is not allowed`);
        result.securityScore -= 60;
        break;
      }
    }
  }

  /**
   * Check for executable signatures in file content
   */
  private static containsExecutableSignature(bytes: Uint8Array): boolean {
    // PE header signature (Windows executables)
    if (bytes.length >= 64) {
      // Check for "MZ" signature at start
      if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
        return true;
      }
    }

    // ELF header signature (Linux executables)
    if (bytes.length >= 4) {
      if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate overall security score
   */
  private static calculateSecurityScore(result: FileValidationResult): void {
    // Additional penalties for multiple issues
    if (result.errors.length > 1) {
      result.securityScore -= result.errors.length * 5;
    }

    if (result.warnings.length > 2) {
      result.securityScore -= result.warnings.length * 2;
    }

    // Ensure score is within bounds
    result.securityScore = Math.max(0, Math.min(100, result.securityScore));
  }

  /**
   * Generate secure filename for storage
   */
  static generateSecureFilename(originalName: string, userId?: string): string {
    const sanitized = this.sanitizeFilename(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userPrefix = userId ? `${userId}_` : '';
    
    return `${userPrefix}${timestamp}_${random}_${sanitized}`;
  }

  /**
   * Get secure file extension from validated MIME type
   * This prevents extension injection attacks by deriving extension from trusted MIME type
   */
  static getSecureExtension(mimeType: string): string {
    const fileTypeDef = SECURE_FILE_TYPES[mimeType as keyof typeof SECURE_FILE_TYPES];
    return fileTypeDef?.extensions[0] || '.bin'; // Use first extension as canonical
  }

  /**
   * Validate file type consistency (MIME + Extension + Signature)
   * This prevents spoofing attacks where MIME, extension, and signature don't match
   */
  static async validateFileTypeConsistency(file: File): Promise<{isValid: boolean, errors: string[]}> {
    const errors: string[] = [];
    
    // Check if MIME type is in our secure whitelist
    const fileTypeDef = SECURE_FILE_TYPES[file.type as keyof typeof SECURE_FILE_TYPES];
    if (!fileTypeDef) {
      errors.push(`MIME type ${file.type} is not allowed`);
      return { isValid: false, errors };
    }
    
    // Check extension matches MIME type exactly
    const filename = file.name.toLowerCase();
    const hasValidExtension = fileTypeDef.extensions.some(ext => filename.endsWith(ext));
    if (!hasValidExtension) {
      errors.push(`File extension must match MIME type ${file.type}. Expected: ${fileTypeDef.extensions.join(', ')}`);
      return { isValid: false, errors };
    }
    
    // Check file signature matches MIME type
    try {
      const headerBuffer = await file.slice(0, 32).arrayBuffer(); // Read more bytes for AVIF validation
      const headerBytes = new Uint8Array(headerBuffer);
      
      // Special handling for AVIF files
      if (file.type === 'image/avif') {
        const isValidAvif = this.validateAvifSignature(headerBytes);
        if (!isValidAvif) {
          errors.push('File signature does not match AVIF format - possible file spoofing attempt');
          return { isValid: false, errors };
        }
      } else {
        // Standard signature validation for other formats
        const signatureMatches = fileTypeDef.signature.every((byte, index) => headerBytes[index] === byte);
        
        if (!signatureMatches) {
          errors.push('File signature does not match declared MIME type - possible file spoofing attempt');
          return { isValid: false, errors };
        }
      }
    } catch (error) {
      errors.push('Could not validate file signature');
      return { isValid: false, errors };
    }
    
    // Check file size against type-specific limits
    if (file.size > fileTypeDef.maxSize) {
      errors.push(`File size ${(file.size/1024/1024).toFixed(2)}MB exceeds ${(fileTypeDef.maxSize/1024/1024).toFixed(2)}MB limit for ${file.type}`);
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  /**
   * Validate AVIF file signature by checking for ftyp box and "avif" brand
   */
  private static validateAvifSignature(headerBytes: Uint8Array): boolean {
    // AVIF files are based on ISO Base Media File Format
    // They start with a file type box (ftyp) that contains the brand "avif"
    
    if (headerBytes.length < 20) {
      return false;
    }
    
    // Check for ftyp box at the beginning (after size field)
    // Format: [4 bytes size][4 bytes 'ftyp'][4 bytes major brand][4 bytes minor version]...
    const ftypSignature = [0x66, 0x74, 0x79, 0x70]; // 'ftyp' in ASCII
    const ftypIndex = 4; // ftyp starts at byte 4 (after 4-byte size field)
    
    // Verify ftyp box signature
    for (let i = 0; i < ftypSignature.length; i++) {
      if (headerBytes[ftypIndex + i] !== ftypSignature[i]) {
        return false;
      }
    }
    
    // Check for "avif" brand in the major brand field (bytes 8-11)
    const avifBrand = [0x61, 0x76, 0x69, 0x66]; // 'avif' in ASCII
    const brandIndex = 8;
    
    for (let i = 0; i < avifBrand.length; i++) {
      if (headerBytes[brandIndex + i] !== avifBrand[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Memory-safe content scanning - only reads first 4KB to prevent memory exhaustion
   */
  private static async scanFileContentSecurely(
    file: File, 
    result: FileValidationResult
  ): Promise<void> {
    try {
      // Only read first 4KB for content scanning to prevent memory attacks
      const sampleSize = Math.min(file.size, 4096);
      const sampleBuffer = await file.slice(0, sampleSize).arrayBuffer();
      const sampleText = new TextDecoder('utf-8', { fatal: false }).decode(sampleBuffer);
      
      // Scan for dangerous patterns in the sample
      const dangerousPatterns = [
        // Script injection patterns
        '<script', 'javascript:', 'vbscript:', 'data:text/html',
        // Event handler injection (common in SVG XSS)
        'onload=', 'onerror=', 'onclick=', 'onmouseover=', 'onfocus=',
        'onanimationend=', 'onbegin=', 'onend=', 'onrepeat=',
        // DOM manipulation
        'eval(', 'document.write', 'innerHTML', 'outerHTML',
        // SVG-specific XSS vectors
        '<foreignobject', '<use', 'xlink:href="javascript:', 'href="javascript:',
        // Data URI schemes that can execute code
        'data:application/', 'data:text/javascript', 'data:text/vbscript'
      ];
      
      for (const pattern of dangerousPatterns) {
        if (sampleText.toLowerCase().includes(pattern.toLowerCase())) {
          result.errors.push(`Potentially malicious content detected: ${pattern}`);
          result.securityScore -= 50;
          result.isValid = false;
          break;
        }
      }
    } catch (error) {
      result.warnings.push('Could not scan file content');
      result.securityScore -= 5;
    }
  }

  /**
   * Validate file upload configuration
   */
  static validateUploadConfig(config: Partial<FileUploadConfig>): string[] {
    const errors: string[] = [];

    if (config.maxSize && config.maxSize > 100 * 1024 * 1024) {
      errors.push('Maximum file size should not exceed 100MB');
    }

    if (config.allowedTypes && config.allowedTypes.length === 0) {
      errors.push('At least one file type must be allowed');
    }

    if (config.allowExecutables) {
      errors.push('Allowing executable files is strongly discouraged');
    }

    return errors;
  }
}

/**
 * File upload rate limiting specifically for file operations
 */
class FileUploadRateLimiter {
  private static uploadCounts = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if user can upload more files
   */
  static canUpload(identifier: string, maxUploads: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = this.uploadCounts.get(identifier);

    if (!userLimit || now > userLimit.resetTime) {
      this.uploadCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= maxUploads) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Get remaining upload quota
   */
  static getRemainingUploads(identifier: string, maxUploads: number = 10): number {
    const userLimit = this.uploadCounts.get(identifier);
    if (!userLimit || Date.now() > userLimit.resetTime) {
      return maxUploads;
    }
    return Math.max(0, maxUploads - userLimit.count);
  }
} 