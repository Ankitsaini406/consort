import { Industries } from "@/types/types";

// Validation utility for industry data
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateIndustryData(industry: Industries): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical field validation
  if (!industry.slug || industry.slug.trim() === '') {
    errors.push('Missing or empty slug');
  }

  if (!industry.industryName || industry.industryName.trim() === '') {
    errors.push('Missing or empty industryName');
  }

  // URL-safe slug validation
  if (industry.slug) {
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(industry.slug)) {
      errors.push(`Slug "${industry.slug}" contains invalid characters. Only lowercase letters, numbers, and hyphens are allowed`);
    }

    if (industry.slug.startsWith('-') || industry.slug.endsWith('-')) {
      warnings.push(`Slug "${industry.slug}" starts or ends with hyphen`);
    }

    if (industry.slug.includes('--')) {
      warnings.push(`Slug "${industry.slug}" contains consecutive hyphens`);
    }
  }

  // Description field validation
  const hasDescription = Boolean(
    industry.industryOverview?.trim() ||
    industry.industryBrief?.trim() ||
    industry.industryBriefDescription?.trim()
  );

  if (!hasDescription) {
    warnings.push('No description fields available (industryOverview, industryBrief, or industryBriefDescription)');
  }

  // Image URL validation
  if (industry.industryImageUrl && !isValidUrl(industry.industryImageUrl)) {
    warnings.push('Invalid industry image URL');
  }

  if (industry.industryIconUrl && !isValidUrl(industry.industryIconUrl)) {
    warnings.push('Invalid industry icon URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateIndustriesArray(industries: Industries[]): {
  validIndustries: Industries[];
  invalidIndustries: { industry: Industries; validation: ValidationResult }[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    published: number;
    drafts: number;
  };
} {
  const validIndustries: Industries[] = [];
  const invalidIndustries: { industry: Industries; validation: ValidationResult }[] = [];

  let published = 0;
  let drafts = 0;

  industries.forEach((industry, index) => {
    const validation = validateIndustryData(industry);
    
    if (validation.isValid) {
      validIndustries.push(industry);
    } else {
      console.error(`[Validation] Industry ${index} failed validation:`, validation.errors);
      invalidIndustries.push({ industry, validation });
    }

    if (industry.isDraft) {
      drafts++;
    } else {
      published++;
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn(`[Validation] Industry "${industry.industryName}" warnings:`, validation.warnings);
    }
  });

  return {
    validIndustries,
    invalidIndustries,
    summary: {
      total: industries.length,
      valid: validIndustries.length,
      invalid: invalidIndustries.length,
      published,
      drafts
    }
  };
}

// Check for duplicate slugs
export function checkForDuplicateSlugs(industries: Industries[]): string[] {
  const slugCount = new Map<string, number>();
  const duplicates: string[] = [];

  industries.forEach(industry => {
    if (industry.slug) {
      const count = slugCount.get(industry.slug) || 0;
      slugCount.set(industry.slug, count + 1);
      
      if (count === 1) { // Second occurrence
        duplicates.push(industry.slug);
      }
    }
  });

  return duplicates;
}

// Utility function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Create a sanitized industry object for safe use
export function sanitizeIndustryForMenu(industry: Industries) {
  return {
    title: industry.industryName?.trim() || 'Unnamed Industry',
    url: `/industries/${industry.slug?.trim() || 'unknown'}`,
    description: (
      industry.industryOverview?.trim() ||
      industry.industryBrief?.trim() ||
      industry.industryBriefDescription?.trim() ||
      'Specialized solutions for this industry'
    )
  };
} 