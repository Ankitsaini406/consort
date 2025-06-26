import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { ResourceFormData, ResourceSectionItem } from '../../types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { FormErrorBoundary, useAsyncErrorHandler } from '@/app/admin/forms/components/shared/ErrorBoundary';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { createSlug } from '@/utils/Utils';
import { useTags } from '@/context/TagContext';
import { GenericSlotUploader, SLOT_CONFIGS } from '@/app/admin/forms/utils/slotBasedUpload';
import { uploadDoc } from '@/firebase/firebaseAuth';
import { FileUploadSecurity } from '@/app/admin/forms/utils/fileUploadSecurity';
import { useUser } from '@/context/userContext';
import { resourceFormConfig } from '../config/resourceFormConfig';
import { optimizeHeroImageSafe, optimizeSectionImages } from '@/utils/imageOptimizer';

// Simplified hero image uploader with clean paths: resources/slug/hero.ext and resources/slug/thumb.ext
const uploadSimplifiedHeroImage = async (file: File, category: string, slug: string, type: string): Promise<string> => {
    const extension = FileUploadSecurity.getSecureExtension(file.type);
    const path = `${category}/${slug}/${type}${extension}`;
    console.log(`[SIMPLIFIED_UPLOAD] Uploading ${type}: ${path}`);
    return uploadDoc(path, file);
};

const sanitizeResourceData = (data: ResourceFormData): ResourceFormData => {
    try {
        // Use enhanced validation and sanitization
        const validationResult = InputSanitizer.validateFormData(data);
        
        if (!validationResult.isValid) {
            console.warn('Form data validation warnings:', validationResult.errors);
            // Log validation issues but continue with sanitized data
            FormErrorHandler.logError(
                new Error(`Form validation warnings: ${validationResult.errors.join(', ')}`),
                'ResourceForm-DataValidation'
            );
        }

        // Use the sanitized data from validation
        const sanitizedData = validationResult.sanitized as ResourceFormData;

        // Ensure sections are properly formatted as array
        let sectionsArray: ResourceSectionItem[] = [];
        if (sanitizedData.sections) {
            if (Array.isArray(sanitizedData.sections)) {
                sectionsArray = sanitizedData.sections;
            } else if (typeof sanitizedData.sections === 'object' && sanitizedData.sections !== null) {
                // Convert object with numeric keys to array
                const sectionsObject = sanitizedData.sections as Record<string, ResourceSectionItem>;
                sectionsArray = Object.keys(sectionsObject)
                    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                    .map(key => sectionsObject[key])
                    .filter(section => section && typeof section === 'object');
            }
        }

        return {
            ...sanitizedData,
            sections: sectionsArray,
        };
    } catch (error) {
        // Fallback to basic sanitization if enhanced validation fails
        FormErrorHandler.logError(error, 'ResourceForm-SanitizationFallback');
        
        // Basic fallback sanitization
        let sectionsArray: ResourceSectionItem[] = [];
        if (data.sections) {
            if (Array.isArray(data.sections)) {
                sectionsArray = data.sections;
            } else if (typeof data.sections === 'object' && data.sections !== null) {
                const sectionsObject = data.sections as Record<string, ResourceSectionItem>;
                sectionsArray = Object.keys(sectionsObject)
                    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                    .map(key => sectionsObject[key])
                    .filter(section => section && typeof section === 'object');
            }
        }

        return {
            ...data,
            resourceTitle: InputSanitizer.sanitizeString(data.resourceTitle || ''),
            headline: InputSanitizer.sanitizeHTML(data.headline || ''),
            sections: sectionsArray.map(section => ({
                ...section,
                sectionTitle: InputSanitizer.sanitizeString(section.sectionTitle || ''),
                sectionContent: InputSanitizer.sanitizeHTML(section.sectionContent || ''),
            })),
        };
    }
};

const handleResourceFormSubmit = async (user: any, data: ResourceFormData, isDraft?: boolean, router?: any) => {
    const context = 'ResourceForm';
    const clientId = RateLimiter.getClientIdentifier();
    const sanitizedData = sanitizeResourceData(data); // Ensure data is sanitized

    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Submit started:`, { isDraft });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (sanitizedData.resourceTitle === "force_error") { // Use sanitizedData
                throw new Error("This is a simulated API error during resource submission.");
            }

            const slug = createSlug(sanitizedData.resourceTitle);

            // Optimize hero image (720px main + 320px thumbnail)
            let finalHeroFiles: File[] = [];
            if (sanitizedData.heroImage) {
                console.log(`🖼️ Optimizing hero image to 940px + 320px...`);
                const { optimized, original } = await optimizeHeroImageSafe(sanitizedData.heroImage);
                finalHeroFiles = [...optimized, ...original]; // Use optimized when possible, fallback to original
                console.log(`✅ Hero image optimization complete: ${optimized.length} optimized, ${original.length} fallback`);
            }

            // Use slot-based uploaders with custom naming for atomic file replacement
            let heroImageUrl: string | null = null;
            if (finalHeroFiles.length > 0) {
                // Upload both main and thumbnail images if they exist
                if (finalHeroFiles.length >= 2) {
                    // We have both main (940px) and thumbnail (320px) files
                    const mainFile = finalHeroFiles.find(f => f.name.includes('-940.webp')) || finalHeroFiles[0];
                    const thumbnailFile = finalHeroFiles.find(f => f.name.includes('-320.webp'));
                    
                    // Upload main image with simplified path: resources/slug/hero.ext
                    heroImageUrl = await uploadSimplifiedHeroImage(mainFile, 'resources', slug, 'hero');
                    
                    // Upload thumbnail image if it exists: resources/slug/thumb.ext
                    if (thumbnailFile) {
                        await uploadSimplifiedHeroImage(thumbnailFile, 'resources', slug, 'thumb');
                        console.log(`[${context}] Hero thumbnail uploaded alongside main image`);
                    }
                } else {
                    // Upload single file (either optimized main or original)
                    heroImageUrl = await GenericSlotUploader.uploadSingleFile(
                        finalHeroFiles[0],
                        'resources',
                        slug,
                        'hero',
                        slug
                    );
                }
                console.log(`[${context}] Hero image uploaded with custom naming:`, heroImageUrl);
            }

            // Optimize section images (720px only, no thumbnails needed)
            const sectionsWithFiles = (sanitizedData.sections || []).map(section => ({
                image: section.sectionImage || null
            }));
            
            const sectionFiles = sectionsWithFiles.map(s => s.image).filter((img): img is File => img !== null);
            let finalSectionFiles: File[] = [];
            if (sectionFiles.length > 0) {
                console.log(`🖼️ Optimizing ${sectionFiles.length} section images to 720px...`);
                const { optimized, original } = await optimizeSectionImages(sectionFiles);
                finalSectionFiles = [...optimized, ...original]; // Use optimized when possible, fallback to original
                console.log(`✅ Section images optimization complete: ${optimized.length} optimized, ${original.length} fallback`);
            }
            
            const sectionImageUrls = await GenericSlotUploader.uploadMultipleFiles(
                finalSectionFiles,
                'resources',
                slug,
                'sections',
                slug
            );
            
            let urlIndex = 0;
            const sectionUploads = (sanitizedData.sections || []).map(section => ({
                id: section.id,
                sectionTitle: section.sectionTitle,
                sectionContent: section.sectionContent,
                sectionImageUrl: section.sectionImage ? sectionImageUrls[urlIndex++] || null : null
            }));

            const resourceData: Omit<ResourceFormData, 'heroImage' | 'sections'> & {
                heroImageUrl: string | null;
                sections: (Omit<ResourceSectionItem, 'sectionImage'> & { sectionImageUrl: string | null })[];
                isDraft: boolean;
                createdBy?: string;
                createdAt: Date;
                updatedAt: Date;
                updatedBy?: string;
            } = {
                resourceType: sanitizedData.resourceType,
                slug: slug,
                industryUseCases: sanitizedData.industryUseCases,
                resourceTitle: sanitizedData.resourceTitle,
                globalTags: sanitizedData.globalTags,
                date: sanitizedData.date,
                headline: sanitizedData.headline,
                clientCompanies: sanitizedData.clientCompanies || [],
                heroImageUrl,
                sections: sectionUploads,
                // Timeline fields for list UI
                isDraft: !!isDraft,
                createdBy: user?.email || 'Unknown',
                createdAt: new Date(),
                updatedAt: new Date(), // Same as createdAt for new items
                updatedBy: user?.email || 'Unknown', // Same as createdBy for new items
            };
            
            const finalResourceData = resourceData as Record<string, unknown>;
            delete finalResourceData.numberOfSections;

            await setDoc(doc(db, "resources", slug), finalResourceData);

            UserNotification.showSuccess(`Resource "${resourceData.resourceTitle}" saved successfully with ID: ${slug}`);
            console.log(`[${context}] Submit successful:`, { docId: slug });

            // Trigger ISR revalidation for immediate content visibility
            try {
                const { triggerRevalidation, getResourceRevalidationPaths } = await import('@/lib/revalidation-helper');
                const pathsToRevalidate = getResourceRevalidationPaths(sanitizedData.resourceType, slug);
                await triggerRevalidation(pathsToRevalidate);
                console.log(`[${context}] Revalidation triggered for paths:`, pathsToRevalidate);
            } catch (revalidationError) {
                console.warn(`[${context}] Revalidation failed (content still saved):`, revalidationError);
                // Don't throw - the resource was saved successfully, revalidation is just optimization
            }
        });

    } catch (error) {
        const formError = FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, context);
        UserNotification.showError(formError);
        throw error;
    }
};


// Resource-specific FormActions wrapper
const ResourceFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Publish Resource" redirectPath="/admin/list-details?type=resources" />
);

const ResourceFormContent: React.FC = () => {
    const router = useRouter();
    const { user } = useUser();
    const { globalTags, clients, industries, loading, error } = useTags();
    const handleAsyncError = useAsyncErrorHandler('ResourceForm');

    const onSubmitWithUser = async (data: ResourceFormData, isDraft?: boolean) => {
        try {
            await handleResourceFormSubmit(user, data, isDraft, router);
        } catch (error) {
            handleAsyncError(error instanceof Error ? error : new Error('Unknown submission error'));
            throw error; // Re-throw to let form handle it
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading form configuration...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-red-800">Configuration Error</h3>
                </div>
                <p className="mt-2 text-sm text-red-700">
                    Error loading form configuration: {error.message}
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                    Retry
                </button>
            </div>
        );
    }

    const configWithActualSubmit = {
        ...resourceFormConfig(globalTags, clients, industries),
        onSubmit: onSubmitWithUser,
    };

    return (
        <AppFormRenderer<ResourceFormData>
            formConfig={configWithActualSubmit}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={ResourceFormActions}
        />
    );
};

export const ResourceForm: React.FC = () => {
    return (
        <FormErrorBoundary context="ResourceForm">
            <ResourceFormContent />
        </FormErrorBoundary>
    );
};