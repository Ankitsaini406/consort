import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { productFormConfig } from '../../../form/config/productFormConfig';
import { ProductFormData } from '../../../form/types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { FileUploadSecurity, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from '@/app/admin/forms/utils/fileUploadSecurity';
import { removeFileObjects } from '@/firebase/firebaseAuth';
import { useTags } from '@/context/TagContext';
import { useUser } from '@/context/userContext';
import { ProductSlotUploader } from '@/app/admin/forms/utils/slotBasedUpload';
// Remove User import - using user from context instead
import { getProductForEdit } from '../../../utils/productEditUtils';
import { optimizeProductGallery } from '@/utils/imageOptimizer';

interface ProductEditFormProps {
    documentId: string;
}

// Reuse the same sanitization and validation logic from ProductForm
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

const validateFiles = async (data: ProductFormData): Promise<string[]> => {
    const errors: string[] = [];
    
    // Only validate new files that user uploaded
    if (data.productGallery && data.productGallery.length > 0) {
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
    
    // Check marketing highlights for new files
    if (data.marketingHighlights) {
        for (const highlight of data.marketingHighlights) {
            if (highlight.visuals) {
                // Handle both single file (File) and array format (File[])
                const visualsArray = Array.isArray(highlight.visuals) ? highlight.visuals : [highlight.visuals];
                
                for (const file of visualsArray) {
                    // Only validate actual File objects (new uploads)
                    if (file instanceof File) {
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
    
    // Validate resource files if new ones uploaded
    const resourceFiles = [
        data.datasheetFile,
        data.brochureFile,
        data.caseStudyFile
    ].filter(Boolean) as File[];
    
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
    
    return errors;
};

const handleProductEditSubmit = async (
    user: any, 
    data: ProductFormData, 
    documentId: string,
    originalData: ProductFormData,
    isDraft?: boolean,
    router?: any
) => {
    const context = 'ProductEditForm';
    const clientId = RateLimiter.getClientIdentifier();
    
    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
                        console.log(`[${context}] Edit submit started:`, { isDraft, documentId });
            console.log(`[${context}] Form data received:`, {
                hasProductGallery: data.productGallery?.length > 0,
                hasDatasheetFile: !!data.datasheetFile,
                hasBrochureFile: !!data.brochureFile,
                hasCaseStudyFile: !!data.caseStudyFile,
                datasheetFileType: data.datasheetFile ? typeof data.datasheetFile : 'none',
                datasheetIsFile: data.datasheetFile instanceof File
            });
            
            // Validate only new files
            const fileErrors = await validateFiles(data);
            if (fileErrors.length > 0) {
                throw new Error(`File validation failed: ${fileErrors.join('; ')}`);
            }

            const sanitizedData = sanitizeProductData(data);
            
            console.log(`[${context}] Starting slot-based uploads for product edit: ${documentId}`);

            // Extract only new File objects for uploading
            const newGalleryFiles = sanitizedData.productGallery?.filter(file => file instanceof File) || [];
            const newDatasheetFile = sanitizedData.datasheetFile instanceof File ? sanitizedData.datasheetFile : null;
            const newBrochureFile = sanitizedData.brochureFile instanceof File ? sanitizedData.brochureFile : null;
            const newCaseStudyFile = sanitizedData.caseStudyFile instanceof File ? sanitizedData.caseStudyFile : null;
            
            // Optimize new product gallery images (680px main + 240px thumbnails)
            let finalGalleryFiles = newGalleryFiles;
            if (newGalleryFiles.length > 0) {
                console.log(`🖼️ Optimizing ${newGalleryFiles.length} new product images to 720px + 320px for edit...`);
                const { optimized, original } = await optimizeProductGallery(newGalleryFiles);
                finalGalleryFiles = [...optimized, ...original]; // Use optimized when possible, fallback to original
                console.log(`✅ Image optimization complete: ${optimized.length} optimized, ${original.length} fallback`);
            }
            
            // Upload files using slot-based system
            const uploadPromises: Promise<any>[] = [];
            
            // Get the product slug for custom naming
            const productSlug = originalData.slug || documentId;
            
            // Upload new gallery files (now optimized) with custom naming (atomic replacement)
            if (finalGalleryFiles.length > 0) {
                uploadPromises.push(
                    ProductSlotUploader.uploadGallery(finalGalleryFiles, documentId, productSlug)
                        .then(urls => ({ type: 'gallery', urls }))
                );
            }
            
            // Upload new resource files with specific naming (atomic replacement)
            if (newDatasheetFile || newBrochureFile || newCaseStudyFile) {
                uploadPromises.push(
                    ProductSlotUploader.uploadResources(
                        newDatasheetFile,
                        newBrochureFile,
                        newCaseStudyFile,
                        documentId,
                        productSlug
                    ).then(resourceUrls => ({ type: 'resources', ...resourceUrls }))
                );
            }
            
            // Upload new marketing highlight visuals with highlight-specific naming (atomic replacement)
            const highlightsWithNewFiles = sanitizedData.marketingHighlights.filter(highlight => {
                if (highlight.visuals) {
                    const visualsArray = Array.isArray(highlight.visuals) ? highlight.visuals : [highlight.visuals];
                    return visualsArray.some(file => file instanceof File);
                }
                return false;
            });
            
            if (highlightsWithNewFiles.length > 0) {
                uploadPromises.push(
                    ProductSlotUploader.uploadHighlightVisuals(
                        highlightsWithNewFiles.map(h => ({
                            visuals: Array.isArray(h.visuals) ? h.visuals.filter(f => f instanceof File) : [h.visuals].filter(f => f instanceof File)
                        })),
                        documentId,
                        productSlug
                    ).then(results => ({ type: 'highlights', results }))
                );
            }

            // Wait for all uploads
            const uploadResults = await Promise.all(uploadPromises);

            // Process upload results and merge with existing data
            let productGalleryUrls = originalData.productGalleryUrls || [];
            let datasheetUrl = originalData.datasheetUrl;
            let brochureUrl = originalData.brochureUrl;
            let caseStudyUrl = originalData.caseStudyUrl;
            let marketingHighlights = [...sanitizedData.marketingHighlights];

            // Apply upload results
            uploadResults.forEach(result => {
                switch (result.type) {
                    case 'gallery':
                        // Replace gallery URLs with new ones (slot-based replacement)
                        productGalleryUrls = result.urls;
                        break;
                    case 'resources':
                        // Update resource URLs if new files were uploaded
                        if (result.datasheetUrl) datasheetUrl = result.datasheetUrl;
                        if (result.brochureUrl) brochureUrl = result.brochureUrl;
                        if (result.caseStudyUrl) caseStudyUrl = result.caseStudyUrl;
                        break;
                    case 'highlights':
                        // Update marketing highlights with new visual URLs
                        result.results.forEach((highlightResult: any, index: number) => {
                            if (marketingHighlights[index]) {
                                marketingHighlights[index] = {
                                    ...marketingHighlights[index],
                                    visualUrls: highlightResult.visuals
                                };
                            }
                        });
                        break;
                }
            });

            console.log(`[${context}] Slot-based upload operations summary:`, {
                newUploads: uploadResults.length,
                finalGalleryCount: productGalleryUrls.length,
                finalHighlightCount: marketingHighlights.length
            });

            // Create update data (only fields that changed)
            const updateData: Partial<ProductFormData> = {
                ...sanitizedData,
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
                updatedBy: user?.email || 'Unknown',
                updatedAt: new Date(),
            };

            // Remove File objects and cleanup tracking data before saving
            const cleanData = removeFileObjects(updateData);
            
            // Remove tracking fields for removed files (they're internal UI state)
            delete (cleanData as any).productGallery_removedExistingFiles;
            delete (cleanData as any).datasheetFile_removedExistingFiles;
            delete (cleanData as any).brochureFile_removedExistingFiles;
            delete (cleanData as any).caseStudyFile_removedExistingFiles;
            
            // Clean up marketing highlight visual removal tracking
            Object.keys(cleanData).forEach(key => {
                if (key.includes('marketingHighlights[') && key.includes('].visuals_removedExistingFiles')) {
                    delete (cleanData as any)[key];
                }
            });
            
            console.log(`[${context}] Updating product:`, { documentId, cleanData });
            
            // Update document in Firebase
            await updateDoc(doc(db, 'portfolio', documentId), cleanData);
            
            UserNotification.showSuccess(`Product "${sanitizedData.productName}" updated successfully!`);
            console.log(`[${context}] Edit successful:`, { docId: documentId });

            // Trigger ISR revalidation for immediate content visibility
            try {
                const { triggerRevalidation, getPortfolioRevalidationPaths } = await import('@/lib/revalidation-helper');
                const pathsToRevalidate = getPortfolioRevalidationPaths(documentId);
                await triggerRevalidation(pathsToRevalidate);
                console.log(`[${context}] Revalidation triggered for paths:`, pathsToRevalidate);
            } catch (revalidationError) {
                console.warn(`[${context}] Revalidation failed (content still updated):`, revalidationError);
                // Don't throw - the product was updated successfully, revalidation is just optimization
            }
            
            // Redirect to products list after successful update
            if (router) {
                setTimeout(() => {
                    router.push('/admin/list-details?type=products');
                }, 1500); // Small delay to show success message
            }
        });
        
    } catch (error) {
        const formError = FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, context);
        UserNotification.showError(formError);
        throw error;
    }
};

const ProductEditFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Update Product" />
);

export const ProductEditForm: React.FC<ProductEditFormProps> = ({ documentId }) => {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const { globalTags, productBrands, clients, industries, loading: areTagsLoading, error } = useTags();
    const [initialData, setInitialData] = useState<ProductFormData | null>(null);
    const [originalData, setOriginalData] = useState<ProductFormData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadProductData = async () => {
            try {
                setIsLoadingData(true);
                const result = await getProductForEdit(documentId);
                if (result.success && result.data) {
                    // Convert ProductEditData to ProductFormData for the form
                    const formData: ProductFormData = {
                        productName: result.data.productName,
                        headline: result.data.headline,
                        marketingTagline: result.data.marketingTagline,
                        portfolioCategory: result.data.portfolioCategory,
                        brandName: result.data.brandName,
                        targetIndustries: result.data.targetIndustries || [],
                        clientCompanies: result.data.clientCompanies || [],
                        globalTags: result.data.globalTags || [],
                        productGallery: result.data.productGallery || [],
                        productDescription: result.data.productDescription,
                        keyFeatures: result.data.keyFeatures || [],
                        technicalSpecifications: result.data.technicalSpecifications || [],
                        datasheetFile: result.data.datasheetFile,
                        brochureFile: result.data.brochureFile,
                        caseStudyFile: result.data.caseStudyFile,
                        marketingHighlights: result.data.marketingHighlights || [],
                        // Preserve URLs from the database
                        productGalleryUrls: result.data.productGalleryUrls,
                        datasheetUrl: result.data.datasheetUrl,
                        brochureUrl: result.data.brochureUrl,
                        caseStudyUrl: result.data.caseStudyUrl,
                    };
                    setInitialData(formData);
                    setOriginalData(formData);
                } else {
                    setLoadError(result.error || 'Product not found');
                }
            } catch (error) {
                console.error('Failed to load product:', error);
                setLoadError(error instanceof Error ? error.message : 'Failed to load product');
            } finally {
                setIsLoadingData(false);
            }
        };

        if (documentId) {
            loadProductData();
        }
    }, [documentId]);

    if (isUserLoading || areTagsLoading || isLoadingData) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    if (loadError) {
        return <div>Error loading product: {loadError}</div>;
    }

    if (!user) {
        return <div>Please log in to edit products.</div>;
    }

    if (!initialData || !originalData) {
        return <div>Product not found.</div>;
    }

    // Create config with edit mode title
    const config = {
        ...productFormConfig(globalTags, productBrands, clients, industries),
        formTitle: 'Edit Product',
        description: 'Update the product details below.',
    };

    const handleSubmit = async (data: ProductFormData, isDraft?: boolean) => {
        await handleProductEditSubmit(user, data, documentId, originalData, isDraft, router);
    };

    return (
        <AppFormRenderer 
            formConfig={config} 
            initialData={initialData}
            onSubmit={handleSubmit}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={ProductEditFormActions} 
        />
    );
}; 