import { ProductFormData } from '../form/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';

export interface ProductEditData extends ProductFormData {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}

export interface ProductEditResult {
  success: boolean;
  data?: ProductEditData;
  error?: string;
}

/**
 * Retrieves product data for editing
 * @param id - Product ID
 * @returns Product data formatted for editing
 */
export async function getProductForEdit(id: string): Promise<ProductEditResult> {
  try {
    console.log(`[getProductForEdit] Fetching product with ID: ${id}`);
    
    // Fetch product from Firebase
    const productRef = doc(db, 'portfolio', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      console.log(`[getProductForEdit] Product not found: ${id}`);
      return {
        success: false,
        error: 'Product not found'
      };
    }
    
    const productData = productSnap.data();
    console.log(`[getProductForEdit] Product data fetched:`, productData);
    
    // Convert Firebase timestamps to Date objects if they exist
    const convertedProduct: ProductEditData = {
      ...(productData as ProductFormData),
      id,
      createdAt: productData.createdAt?.toDate?.() || productData.createdAt,
      updatedAt: productData.updatedAt?.toDate?.() || productData.updatedAt,
      // Ensure arrays exist with fallbacks
      targetIndustries: productData.targetIndustries || [],
      clientCompanies: productData.clientCompanies || [],
      globalTags: productData.globalTags || [],
      productGallery: [], // Files won't be in initial data
      keyFeatures: productData.keyFeatures || [{ id: "1", keyFeature: "", icon: "" }],
      technicalSpecifications: productData.technicalSpecifications || [{ id: "1", parameter: "", specification: "" }],
      marketingHighlights: productData.marketingHighlights?.map((highlight: any) => ({
        ...highlight,
        visuals: [] // Files won't be in initial data, but URLs will be preserved
      })) || [{ id: "1", headline: "", description: "", visuals: [] }],
      // Clear file objects but preserve URLs
      datasheetFile: null,
      brochureFile: null,
      caseStudyFile: null,
    };
    
    console.log(`[getProductForEdit] Converted product data:`, convertedProduct);
    
    return {
      success: true,
      data: convertedProduct
    };
    
  } catch (error) {
    console.error(`[getProductForEdit] Error fetching product:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    };
  }
}

/**
 * Updates product data
 * @param id - Product ID
 * @param data - Updated product data
 * @returns Update result
 */
export async function updateProduct(id: string, data: ProductFormData): Promise<ProductEditResult> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (id === 'test-product-id') {
      const updatedProduct: ProductEditData = {
        ...data,
        id,
        updatedAt: new Date(),
        version: 2
      };
      
      return {
        success: true,
        data: updatedProduct
      };
    }
    
    return {
      success: false,
      error: 'Product not found'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed'
    };
  }
}

/**
 * Validates product data for editing
 * @param data - Product data to validate
 * @returns Validation result
 */
export function validateProductForEdit(data: ProductFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.productName?.trim()) {
    errors.push('Product name is required');
  }
  
  if (!data.headline?.trim()) {
    errors.push('Headline is required');
  }
  
  if (!data.productDescription?.trim()) {
    errors.push('Product description is required');
  }
  
  if (data.productDescription && data.productDescription.length < 50) {
    errors.push('Product description must be at least 50 characters');
  }
  
  if (!data.portfolioCategory) {
    errors.push('Portfolio category is required');
  }
  
  if (!data.brandName) {
    errors.push('Brand name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes product data for editing
 * @param data - Raw product data
 * @returns Sanitized product data
 */
export function sanitizeProductData(data: ProductFormData): ProductFormData {
  const sanitizeString = (str: string): string => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]*>/g, '');
  };
  
  const sanitizeHTML = (str: string): string => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/javascript:/gi, '');
  };
  
  return {
    ...data,
    productName: sanitizeString(data.productName || ''),
    headline: sanitizeString(data.headline || ''),
    marketingTagline: sanitizeString(data.marketingTagline || ''),
    productDescription: sanitizeHTML(data.productDescription || ''),
    keyFeatures: data.keyFeatures?.map(feature => ({
      ...feature,
      keyFeature: sanitizeString(feature.keyFeature || '')
    })) || [],
    technicalSpecifications: data.technicalSpecifications?.map(spec => ({
      ...spec,
      parameter: sanitizeString(spec.parameter || ''),
      specification: sanitizeString(spec.specification || '')
    })) || [],
    marketingHighlights: data.marketingHighlights?.map(highlight => ({
      ...highlight,
      headline: sanitizeString(highlight.headline || ''),
      description: sanitizeHTML(highlight.description || '')
    })) || []
  };
}

/**
 * Compares two product data objects for changes
 * @param original - Original product data
 * @param updated - Updated product data
 * @returns Object with changed fields
 */
export function getProductChanges(original: ProductFormData, updated: ProductFormData): Partial<ProductFormData> {
  const changes: Partial<ProductFormData> = {};
  
  // Simple field comparisons
  const simpleFields: (keyof ProductFormData)[] = [
    'productName', 'headline', 'marketingTagline', 'portfolioCategory', 
    'brandName', 'productDescription'
  ];
  
  simpleFields.forEach(field => {
    if (original[field] !== updated[field]) {
      changes[field] = updated[field] as any;
    }
  });
  
  // Array field comparisons
  const arrayFields: (keyof ProductFormData)[] = [
    'targetIndustries', 'clientCompanies', 'globalTags'
  ];
  
  arrayFields.forEach(field => {
    const originalArray = original[field] as string[] || [];
    const updatedArray = updated[field] as string[] || [];
    
    if (JSON.stringify(originalArray.sort()) !== JSON.stringify(updatedArray.sort())) {
      changes[field] = updated[field] as any;
    }
  });
  
  return changes;
} 