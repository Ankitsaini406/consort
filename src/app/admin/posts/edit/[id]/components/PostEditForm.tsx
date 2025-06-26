import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { postFormConfig } from '../../../form/config/postFormConfig';
import { PostFormData, PostSectionItem } from '../../../types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { FileUploadSecurity, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from '@/app/admin/forms/utils/fileUploadSecurity';
import { useTags } from '@/context/TagContext';
import { useUser } from '@/context/userContext';
import { GenericSlotUploader, SLOT_CONFIGS } from '@/app/admin/forms/utils/slotBasedUpload';

import { getPostForEdit } from '../../../utils/postEditUtils';
import { optimizeHeroImageSafe, optimizeSectionImages } from '@/utils/imageOptimizer';

interface PostEditFormProps {
    documentId: string;
}

const sanitizePostData = (data: PostFormData): PostFormData => {
    // Convert sections to array if it's an object (happens with dynamic form fields)
    let sectionsArray: PostSectionItem[] = [];
    if (data.sections) {
        if (Array.isArray(data.sections)) {
            sectionsArray = data.sections;
        } else if (typeof data.sections === 'object' && data.sections !== null) {
            // Convert object with numeric keys to array
            const sectionsObject = data.sections as Record<string, PostSectionItem>;
            sectionsArray = Object.keys(sectionsObject)
                .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                .map(key => sectionsObject[key])
                .filter(section => section && typeof section === 'object'); // Filter out any invalid entries
        }
    }

    return {
        ...data,
        postTitle: InputSanitizer.sanitizeString(data.postTitle || ''),
        date: InputSanitizer.sanitizeString(data.date || ''),
        headline: InputSanitizer.sanitizeHTML(data.headline || ''),
        // Sanitize post sections
        sections: sectionsArray.map(section => ({
            ...section,
            sectionTitle: InputSanitizer.sanitizeString(section.sectionTitle || ''),
            sectionContent: InputSanitizer.sanitizeHTML(section.sectionContent || ''),
        })),
    };
};

const validateFiles = async (data: PostFormData): Promise<string[]> => {
    const errors: string[] = [];
    
    // Only validate new files that user uploaded
    if (data.heroImage && data.heroImage instanceof File) {
        const validation = await FileUploadSecurity.validateFile(data.heroImage, {
            allowedTypes: [...ALLOWED_FILE_TYPES.images],
            maxSize: FILE_SIZE_LIMITS.image,
            requireSignatureValidation: true
        });
        
        if (!validation.isValid) {
            errors.push(`Hero image "${data.heroImage.name}": ${validation.errors.join(', ')}`);
        }
    }
    
    // Check sections for new files
    if (data.sections) {
        for (let i = 0; i < data.sections.length; i++) {
            const section = data.sections[i];
            if (section.sectionImage && section.sectionImage instanceof File) {
                const validation = await FileUploadSecurity.validateFile(section.sectionImage, {
                    allowedTypes: [...ALLOWED_FILE_TYPES.images],
                    maxSize: FILE_SIZE_LIMITS.image,
                    requireSignatureValidation: true
                });
                
                if (!validation.isValid) {
                    errors.push(`Section ${i + 1} image "${section.sectionImage.name}": ${validation.errors.join(', ')}`);
                }
            }
        }
    }
    
    return errors;
};

const handlePostEditSubmit = async (
    user: any, 
    data: PostFormData, 
    documentId: string,
    originalData: PostFormData,
    isDraft?: boolean,
    router?: any
) => {
    const context = 'PostEditForm';
    const clientId = RateLimiter.getClientIdentifier();
    const sanitizedData = sanitizePostData(data);

    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Edit submit started:`, { isDraft, documentId });

            // Validate only new files
            const fileErrors = await validateFiles(data);
            if (fileErrors.length > 0) {
                throw new Error(`File validation failed: ${fileErrors.join('; ')}`);
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (sanitizedData.postTitle === "force_error") {
                throw new Error("This is a simulated API error during post update.");
            }

            // Get the post slug for custom naming
            const postSlug = originalData.slug || documentId;
            
            // Optimize hero image (720px main + 320px thumbnail) - only new files
            let finalHeroFiles: File[] = [];
            if (sanitizedData.heroImage) {
                console.log(`🖼️ Optimizing new hero image to 940px + 320px for edit...`);
                const { optimized, original } = await optimizeHeroImageSafe(sanitizedData.heroImage);
                finalHeroFiles = [...optimized, ...original]; // Use optimized when possible, fallback to original
                console.log(`✅ Hero image optimization complete: ${optimized.length} optimized, ${original.length} fallback`);
            }
            
            // Use replace-only uploaders for atomic file replacement
            let heroImageUrl: string | null = (originalData.heroImageUrl as string) || null;
            if (finalHeroFiles.length > 0) {
                // Upload both main and thumbnail images if they exist
                if (finalHeroFiles.length >= 2) {
                    // We have both main (940px) and thumbnail (320px) files
                    const mainFile = finalHeroFiles.find(f => f.name.includes('-940.webp')) || finalHeroFiles[0];
                    const thumbnailFile = finalHeroFiles.find(f => f.name.includes('-320.webp'));
                    
                    // Upload main image
                    heroImageUrl = await GenericSlotUploader.uploadSingleFile(
                        mainFile,
                        'posts',
                        documentId,
                        'hero',
                        postSlug
                    );
                    
                    // Upload thumbnail image if it exists
                    if (thumbnailFile) {
                        await GenericSlotUploader.uploadSingleFile(
                            thumbnailFile,
                            'posts',
                            documentId,
                            'hero-thumb',
                            postSlug
                        );
                        console.log(`[${context}] Hero thumbnail uploaded alongside main image`);
                    }
                } else {
                    // Upload single file (either optimized main or original)
                    heroImageUrl = await GenericSlotUploader.uploadSingleFile(
                        finalHeroFiles[0],
                        'posts',
                        documentId,
                        'hero',
                        postSlug
                    );
                }
                console.log(`[${context}] Hero image uploaded:`, heroImageUrl);
            }

            // Optimize section images (720px only) - only new files
            const newSectionImages = (sanitizedData.sections || [])
                .map(section => section.sectionImage)
                .filter((img): img is File => img instanceof File);
            
            let finalSectionFiles: File[] = [];
            if (newSectionImages.length > 0) {
                console.log(`🖼️ Optimizing ${newSectionImages.length} new section images to 720px for edit...`);
                const { optimized, original } = await optimizeSectionImages(newSectionImages);
                finalSectionFiles = [...optimized, ...original]; // Use optimized when possible, fallback to original
                console.log(`✅ Section images optimization complete: ${optimized.length} optimized, ${original.length} fallback`);
            }
            
            let sectionImageUrls: string[] = [];
            if (finalSectionFiles.length > 0) {
                sectionImageUrls = await GenericSlotUploader.uploadMultipleFiles(
                    finalSectionFiles,
                    'posts',
                    documentId,
                    'section',
                    postSlug
                );
            }
            
            let urlIndex = 0;
            const sectionUploads = (sanitizedData.sections || []).map((section, index) => ({
                id: section.id,
                sectionTitle: section.sectionTitle,
                sectionContent: section.sectionContent,
                sectionImage: null, // Reset file input for database storage
                sectionImageUrl: section.sectionImage 
                    ? sectionImageUrls[urlIndex++] || null 
                    : (originalData.sections?.[index] as any)?.sectionImageUrl || null
            }));

            const updateData: Partial<PostFormData & { heroImageUrl: string | null }> = {
                postType: sanitizedData.postType,
                industryUseCases: sanitizedData.industryUseCases,
                postTitle: sanitizedData.postTitle,
                globalTags: sanitizedData.globalTags,
                date: sanitizedData.date,
                headline: sanitizedData.headline,
                heroImageUrl,
                sections: sectionUploads,
                clientCompanies: sanitizedData.clientCompanies || [],
                isDraft: !!isDraft,
                updatedBy: (user?.email || 'Unknown') as string,
                updatedAt: new Date(),
            };

            console.log("Updating post data:", updateData);

            await updateDoc(doc(db, "posts", documentId), updateData);

            UserNotification.showSuccess(`Post "${updateData.postTitle}" updated successfully!`);
            console.log(`[${context}] Edit successful:`, { docId: documentId });

            // Trigger ISR revalidation for immediate content visibility
            try {
                const { triggerRevalidation, getPostRevalidationPaths } = await import('@/lib/revalidation-helper');
                const pathsToRevalidate = getPostRevalidationPaths(sanitizedData.postType, documentId);
                await triggerRevalidation(pathsToRevalidate);
                console.log(`[${context}] Revalidation triggered for paths:`, pathsToRevalidate);
            } catch (revalidationError) {
                console.warn(`[${context}] Revalidation failed (content still updated):`, revalidationError);
                // Don't throw - the post was updated successfully, revalidation is just optimization
            }
            
            // Redirect to posts list after successful update
            if (router) {
                setTimeout(() => {
                    router.push('/admin/list-details?type=posts');
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

// Post-specific FormActions wrapper
const PostEditFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Update Post" />
);

export const PostEditForm: React.FC<PostEditFormProps> = ({ documentId }) => {
    const router = useRouter();
    const { user } = useUser();
    const { globalTags, clients, industries, loading, error } = useTags();
    const [initialData, setInitialData] = useState<PostFormData | null>(null);
    const [originalData, setOriginalData] = useState<PostFormData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadPostData = async () => {
            try {
                setIsLoadingData(true);
                const postData = await getPostForEdit(documentId);
                if (postData) {
                    setInitialData(postData);
                    setOriginalData(postData);
                } else {
                    setLoadError('Post not found');
                }
            } catch (error) {
                console.error('Failed to load post:', error);
                setLoadError(error instanceof Error ? error.message : 'Failed to load post');
            } finally {
                setIsLoadingData(false);
            }
        };

        if (documentId) {
            loadPostData();
        }
    }, [documentId]);

    const onSubmitWithUser = async (data: PostFormData, isDraft?: boolean) => {
        if (!originalData) return;
        await handlePostEditSubmit(user, data, documentId, originalData, isDraft, router);
    };

    if (loading || isLoadingData) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    if (loadError) {
        return <div>Error loading post: {loadError}</div>;
    }

    if (!initialData || !originalData) {
        return <div>Post not found.</div>;
    }

    // SMART VALIDATION APPROACH: Keep business logic intact, enhance validation intelligence
    const baseConfig = postFormConfig(globalTags, clients, industries);
    const editModeConfig = {
        ...baseConfig,
        formTitle: 'Edit Post',
        description: 'Update the post details below.',
        onSubmit: onSubmitWithUser,
        steps: baseConfig.steps.map(step => ({
            ...step,
            fields: step.fields.map(field => {
                // Enhanced validation for file fields in edit mode - smart about existing files
                if (field.id === 'heroImage' && field.validation?.required) {
                    return {
                        ...field,
                        validation: {
                            ...field.validation,
                            // CRITICAL: Set required to false so our custom validation runs
                            required: false,
                            // Custom validation that handles BOTH required logic AND existing files
                            custom: (value: any, formData?: Record<string, unknown>) => {
                                console.log('[PostEditForm] Custom validation debug:', {
                                    fieldId: field.id,
                                    value: value,
                                    valueType: typeof value,
                                    isFile: value instanceof File,
                                    heroImageUrl: formData ? (formData as any)?.heroImageUrl : undefined,
                                    initialDataHeroImageUrl: initialData?.heroImageUrl,
                                    formDataKeys: formData ? Object.keys(formData) : []
                                });
                                
                                // If user uploaded a new file, it's valid
                                if (value && value instanceof File) {
                                    console.log('[PostEditForm] Validation passed: new file uploaded');
                                    return undefined; // No error
                                }
                                
                                // Check for existing image URL in form data first
                                const existingUrl = formData ? (formData as any)?.heroImageUrl : undefined;
                                if (existingUrl && typeof existingUrl === 'string' && existingUrl.trim()) {
                                    console.log('[PostEditForm] Validation passed: existing URL found in formData:', existingUrl);
                                    return undefined; // No error
                                }
                                
                                // Fallback: check initial data (in case formData isn't fully populated yet)
                                const initialUrl = initialData?.heroImageUrl;
                                if (initialUrl && typeof initialUrl === 'string' && initialUrl.trim()) {
                                    console.log('[PostEditForm] Validation passed: existing URL found in initialData:', initialUrl);
                                    return undefined; // No error
                                }
                                
                                // Neither new file nor existing URL - invalid (this handles the required logic)
                                console.log('[PostEditForm] Validation failed: no file or existing URL');
                                return `${field.label} is required.`;
                            }
                        }
                    };
                }
                return field;
            })
        }))
    };

    return (
        <AppFormRenderer<PostFormData>
            formConfig={editModeConfig}
            initialData={initialData}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={PostEditFormActions}
        />
    );
}; 