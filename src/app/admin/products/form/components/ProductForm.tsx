import React from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { productFormConfig } from '../config/productFormConfig';
import { ProductFormData } from '../types';

// Updated imports for base StepProgress and StepCard
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { FormSkeleton } from '@/app/admin/forms/components/shared/layout/FormSkeleton';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { FileUploadSecurity, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from '@/app/admin/forms/utils/fileUploadSecurity';
import { createSlug } from '@/utils/Utils';
import { removeFileObjects } from '@/firebase/firebaseAuth';
import { useTags } from '@/context/TagContext';
import { useUser } from '@/context/userContext';
import { useAuthContext } from '@/context/AuthContext';
import { getDatabaseIdentity } from '@/hooks/useAuth';
import { ProductSlotUploader } from '@/app/admin/forms/utils/slotBasedUpload';
import { User } from '@/types/types';
import { optimizeProductGallery } from '@/utils/imageOptimizer';

const sanitizeProductData = (data: ProductFormData): ProductFormData => {
    return {
        ...data,
        productName: InputSanitizer.sanitizeString(data.productName || ''),
        headline: InputSanitizer.sanitizeString(data.headline || ''),
        marketingTagline: InputSanitizer.sanitizeString(data.marketingTagline || ''),
        productDescription: InputSanitizer.sanitizeString(data.productDescription || ''),
        // Sanitize key features
        keyFeatures: data.keyFeatures?.map(kf => ({
            ...kf,
            keyFeature: InputSanitizer.sanitizeString(kf.keyFeature || '')
        })) || [],
        // Sanitize technical specifications
        technicalSpecifications: data.technicalSpecifications?.map(ts => ({
            ...ts,
            parameter: InputSanitizer.sanitizeString(ts.parameter || ''),
            specification: InputSanitizer.sanitizeString(ts.specification || '')
        })) || [],
        // Sanitize marketing highlights
        marketingHighlights: data.marketingHighlights?.map(h => ({
            ...h,
            headline: InputSanitizer.sanitizeString(h.headline || ''),
            description: InputSanitizer.sanitizeString(h.description || '')
        })) || [],
        // Preserve file objects
        productGallery: data.productGallery || [],
        datasheetFile: data.datasheetFile,
        brochureFile: data.brochureFile,
        caseStudyFile: data.caseStudyFile
    };
};

const validateFileUniqueness = (files: File[]): boolean => {
    const fileNames = new Set<string>();
    const fileSizes = new Set<number>();
    
    for (const file of files) {
        const key = `${file.name}-${file.size}`;
        if (fileNames.has(key)) {
            return false;
        }
        fileNames.add(key);
        fileSizes.add(file.size);
    }
    
    return true;
};

const validateFiles = async (data: ProductFormData): Promise<string[]> => {
    const errors: string[] = [];
    
    // Check for duplicate files in product gallery
    if (data.productGallery && data.productGallery.length > 0) {
        if (!validateFileUniqueness(data.productGallery)) {
            errors.push('Duplicate files detected in product gallery');
        }
        
        for (const file of data.productGallery) {
            const validation = await FileUploadSecurity.validateFile(file, {
                allowedTypes: [...ALLOWED_FILE_TYPES.images],
                maxSize: FILE_SIZE_LIMITS.image,
                requireSignatureValidation: true
            });
            
            if (!validation.isValid) {
                errors.push(`Product photo "${file.name}": ${validation.errors.join(', ')}`);
            }
        }
    }
    
    // Check for duplicate files in marketing highlights
    if (data.marketingHighlights) {
        for (const highlight of data.marketingHighlights) {
            if (highlight.visuals) {
                // Handle both single file (File) and array format (File[])
                const visualsArray = Array.isArray(highlight.visuals) ? highlight.visuals : [highlight.visuals];
                
                if (visualsArray.length > 0) {
                    if (!validateFileUniqueness(visualsArray)) {
                        errors.push(`Duplicate files detected in marketing highlight "${highlight.headline}"`);
                    }
                    
                    for (const file of visualsArray) {
                        const validation = await FileUploadSecurity.validateFile(file, {
                            allowedTypes: [...ALLOWED_FILE_TYPES.images],
                            maxSize: FILE_SIZE_LIMITS.image,
                            requireSignatureValidation: true
                        });
                        
                        if (!validation.isValid) {
                            errors.push(`Marketing highlight visual "${file.name}": ${validation.errors.join(', ')}`);
                        }
                    }
                }
            }
        }
    }
    
    // Validate resource files
    const resourceFiles = [
        data.datasheetFile,
        data.brochureFile,
        data.caseStudyFile
    ].filter(Boolean) as File[];
    
    if (resourceFiles.length > 0) {
        if (!validateFileUniqueness(resourceFiles)) {
            errors.push('Duplicate files detected in resource files');
        }
        
        for (const file of resourceFiles) {
            const validation = await FileUploadSecurity.validateFile(file, {
                allowedTypes: [...ALLOWED_FILE_TYPES.documents, ...ALLOWED_FILE_TYPES.images],
                maxSize: FILE_SIZE_LIMITS.document,
                requireSignatureValidation: true
            });
            
            if (!validation.isValid) {
                errors.push(`Resource file "${file.name}": ${validation.errors.join(', ')}`);
            }
        }
    }
    
    return errors;
};

const handleProductFormSubmit = async (user: any, data: ProductFormData, isDraft?: boolean, router?: any) => {
    const context = 'ProductForm';
    const clientId = RateLimiter.getClientIdentifier();
    
    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Submit started:`, { isDraft });
            
            // Validate files first
            const fileErrors = await validateFiles(data);
            if (fileErrors.length > 0) {
                throw new Error(`File validation failed: ${fileErrors.join('; ')}`);
            }
            
            // Sanitize input data
            const sanitizedData = sanitizeProductData(data);
            const slug = createSlug(sanitizedData.productName);

            console.log(`[${context}] Starting slot-based file uploads for product: ${slug}`);

            // Optimize product gallery images (680px main + 240px thumbnails)
            let finalGalleryFiles = sanitizedData.productGallery || [];
            if (sanitizedData.productGallery?.length > 0) {
                console.log(`🖼️ Optimizing ${sanitizedData.productGallery.length} product images to 720px + 320px...`);
                const { optimized, original } = await optimizeProductGallery(sanitizedData.productGallery);
                finalGalleryFiles = [...optimized, ...original]; // Use optimized when possible, fallback to original
                console.log(`✅ Image optimization complete: ${optimized.length} optimized, ${original.length} fallback`);
            }

            // Use slot-based uploaders with custom naming for atomic file replacement
            const [productGalleryUrls, resourceUrls, marketingHighlights] = await Promise.all([
                // Upload gallery images (now optimized) with custom naming: {slug}_photo_{index}.{ext}
                finalGalleryFiles.length > 0 
                    ? ProductSlotUploader.uploadGallery(finalGalleryFiles, slug, slug)
                    : Promise.resolve([]),
                
                // Upload resources with specific naming: {slug}_{type}.{ext}
                ProductSlotUploader.uploadResources(
                    sanitizedData.datasheetFile || null,
                    sanitizedData.brochureFile || null,
                    sanitizedData.caseStudyFile || null,
                    slug,
                    slug
                ),
                
                // Upload marketing highlight visuals: {slug}_highlight_{highlightIndex}_visual_{visualIndex}.{ext}
                sanitizedData.marketingHighlights.length > 0
                    ? ProductSlotUploader.uploadHighlightVisuals(
                        sanitizedData.marketingHighlights.map(h => ({
                            visuals: Array.isArray(h.visuals) ? h.visuals : [h.visuals].filter(Boolean)
                        })),
                        slug,
                        slug
                    ).then(results => 
                        sanitizedData.marketingHighlights.map((highlight, index) => ({
                            ...highlight,
                            visualUrls: results[index]?.visuals || []
                        }))
                    )
                    : Promise.resolve(sanitizedData.marketingHighlights)
            ]);

            const { datasheetUrl, brochureUrl, caseStudyUrl } = resourceUrls;

            // Create the final product data
            const productData: ProductFormData = {
                ...sanitizedData,
                slug,
                productGalleryUrls,
                datasheetUrl: datasheetUrl || null,
                brochureUrl: brochureUrl || null,
                caseStudyUrl: caseStudyUrl || null,
                marketingHighlights,
                fileMetadata: {
                    lastUpdated: new Date().toISOString(),
                    galleryCount: productGalleryUrls.length,
                    highlightCount: marketingHighlights.length,
                    resourceCount: [datasheetUrl, brochureUrl, caseStudyUrl].filter(Boolean).length
                },
                // Timeline fields for list UI
                isDraft: isDraft || false,
                createdBy: user?.email || 'Unknown',
                createdAt: new Date(),
                updatedAt: new Date(), // Same as createdAt for new items
                updatedBy: user?.email || 'Unknown', // Same as createdBy for new items
            };

            // Remove any remaining File objects before saving to Firestore
            const cleanData = removeFileObjects(productData);
            
            console.log(`[${context}] Final product payload ready.`, cleanData);
            
            // Add document to Firebase
            await setDoc(doc(db, 'portfolio', slug), cleanData);
            
            // Success notification
            UserNotification.showSuccess(`Product "${sanitizedData.productName}" saved successfully with ID: ${slug}`);
            console.log(`[${context}] Submit successful:`, { docId: slug });

            // Trigger ISR revalidation for immediate content visibility
            try {
                const { triggerRevalidation, getPortfolioRevalidationPaths } = await import('@/lib/revalidation-helper');
                const pathsToRevalidate = getPortfolioRevalidationPaths(slug);
                await triggerRevalidation(pathsToRevalidate);
                console.log(`[${context}] Revalidation triggered for paths:`, pathsToRevalidate);
            } catch (revalidationError) {
                console.warn(`[${context}] Revalidation failed (content still saved):`, revalidationError);
                // Don't throw - the product was saved successfully, revalidation is just optimization
            }
        });
        
    } catch (error) {
        // Handle and log error
        const formError = FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, context);
        UserNotification.showError(formError);
        
        // Re-throw to let the form handle the error state
        throw error;
    }
};

// Product-specific FormActions wrapper
const ProductFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Submit Product" redirectPath="/admin/list-details?type=products" />
);

// Final Merged ProductForm
export const ProductForm: React.FC = () => {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const { globalTags, productBrands, clients, industries, loading: areTagsLoading, error } = useTags();

    if (isUserLoading || areTagsLoading) {
        return <FormSkeleton formTitle="Product Form" fieldCount={8} />;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    if (!user) {
        return <div>Please log in to create a product.</div>;
    }

    const config = productFormConfig(globalTags, productBrands, clients, industries);

    const handleSubmit = async (data: ProductFormData, isDraft?: boolean) => {
        await handleProductFormSubmit(user, data, isDraft, router);
    };

    return (
        <>
        <AppFormRenderer 
            formConfig={config} 
            onSubmit={handleSubmit}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={ProductFormActions} 
        />
        </>
    );
};