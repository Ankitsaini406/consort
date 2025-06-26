interface ProductResource {
  file: File | null;
  name?: string;
  url?: string;
}

export interface MarketingHighlight {
  id: string;
  headline: string;
  description: string;
  visuals: File | File[]; // Updated to support both single file and array modes
  visualUrls?: string[];
}

export interface KeyFeature {
  id: string;
  keyFeature: string;
  icon: string;
}

export interface TechnicalSpecification {
  id: string;
  parameter: string;
  specification: string;
}

interface ProductHighlight {
  id: string;
  productName: string;
  briefHeadline: string;
  productPhotos: File[];
}

export interface ProductFormData {
  // Product Details
  portfolioCategory: string;
  targetIndustries: string[];
  brandName: string;
  clientCompanies: string[];
  globalTags: string[];
  productName: string;
  headline: string;
  marketingTagline: string;
  productGallery: File[];
  productDescription: string;
  keyFeatures: KeyFeature[];
  
  // Technical Specifications
  technicalSpecifications: TechnicalSpecification[];
  
  // Resource Files
  datasheetFile: File | null;
  brochureFile: File | null;
  caseStudyFile: File | null;
  
  // Marketing Highlights
  marketingHighlights: MarketingHighlight[];
  
  // Metadata
  slug?: string;
  fileMetadata?: {
    lastUpdated: string;
    galleryCount: number;
    highlightCount: number;
    resourceCount: number;
  };
  
  // URLs (populated after upload)
  productGalleryUrls?: string[];
  datasheetUrl?: string | null;
  brochureUrl?: string | null;
  caseStudyUrl?: string | null;

  // Index signature to make it compatible with Record<string, unknown>
  [key: string]: unknown;
}

interface FormSelectProps {
  id: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  error?: string;
}