import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { solutionFormConfig } from '../../../form/config/solutionFormConfig';
import { SolutionFormData } from '../../../types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { useUser } from '@/context/userContext';
// Remove User import - using user from context instead
import { removeFileObjects } from '@/firebase/firebaseAuth';
import { useTags } from '@/context/TagContext';
import { getSolutionForEdit } from '../../../utils/solutionEditUtils';
import { SolutionSlotUploader, GenericSlotUploader } from '@/app/admin/forms/utils/slotBasedUpload';

interface SolutionEditFormProps {
    documentId: string;
}

const sanitizeSolutionData = (data: SolutionFormData): SolutionFormData => {
    // Keep a reference to the original images, which might be File objects
    const contentSectionImages = data.contentSections?.map(section => section.image) || [];

    const sanitized = {
        ...data,
        solutionTitle: InputSanitizer.sanitizeString(data.solutionName || ''),
        headline: InputSanitizer.sanitizeHTML(data.solutionOverview || ''),
        solutionIndustry: InputSanitizer.sanitizeString(data.primaryIndustry || ''),
        solutionSections: data.contentSections?.map((section, index) => ({
            ...section,
            title: InputSanitizer.sanitizeString(section.title || ''),
            descriptionHeading: InputSanitizer.sanitizeString(section.subheading || ''),
            descriptionText: InputSanitizer.sanitizeHTML(section.content || ''),
            // Restore the image object after sanitizing other fields
            image: contentSectionImages[index] || null,
        })) || [],
    };

    return sanitized;
};

const handleSolutionEditSubmit = async (
    data: SolutionFormData,
    documentId: string,
    originalData: SolutionFormData,
    isDraft?: boolean,
    user: any = null,
    router?: any
) => {
    const context = 'SolutionEditForm';
    const clientId = RateLimiter.getClientIdentifier();

    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Edit submit started:`, { isDraft, documentId });

            const sanitizedData = sanitizeSolutionData(data);
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (sanitizedData.solutionTitle === 'force_error') {
                throw new Error('This is a simulated API error during solution update.');
            }

            // Get the solution slug for custom naming
            const solutionSlug = (originalData.slug as string) || documentId;
            
            // Use slot-based uploaders with custom naming for atomic file replacement
            let heroImageUrl: string | undefined = (originalData.heroImageUrl as string) || undefined;
            let solutionBrochureUrl: string | undefined = (originalData.solutionBrochureUrl as string) || undefined;

            if (sanitizedData.heroImage instanceof File) {
                heroImageUrl = await SolutionSlotUploader.uploadHeroImage(sanitizedData.heroImage, documentId, solutionSlug);
            }
            if (sanitizedData.solutionBrochure instanceof File) {
                solutionBrochureUrl = await SolutionSlotUploader.uploadBrochure(sanitizedData.solutionBrochure, documentId, solutionSlug);
            }

            // Update sections with new images using custom naming system (atomic replacement)
            const newSectionFiles = (sanitizedData.contentSections || [])
                .map(section => section.image)
                .filter((image): image is File => image instanceof File);
            
            let sectionImageUrls: string[] = [];
            if (newSectionFiles.length > 0) {
                sectionImageUrls = await SolutionSlotUploader.uploadSectionImages(newSectionFiles, documentId, solutionSlug);
            }
            
            let uploadIndex = 0;
            const updatedSections = (sanitizedData.contentSections || []).map((section, index) => ({
                ...section,
                sectionImage: section.image instanceof File ? sectionImageUrls[uploadIndex++] : (originalData.contentSections?.[index] as any)?.imageUrl || null
            }));

            const updateData = {
                ...sanitizedData,
                isDraft: false,
                heroImage: heroImageUrl || null,
                brochureUrl: solutionBrochureUrl || null,
                contentSections: updatedSections,
                updatedBy: user?.email || 'Unknown',
                updatedAt: new Date(),
            };

            const cleanData = removeFileObjects(updateData);
            console.log(`[${context}] Clean update data:`, cleanData);
            await updateDoc(doc(db, 'solutions', documentId), cleanData);

            UserNotification.showSuccess(`Solution "${sanitizedData.solutionTitle}" updated successfully!`);
            console.log(`[${context}] Edit successful:`, { docId: documentId });
            
            // Redirect to solutions list after successful update
            if (router) {
                setTimeout(() => {
                    router.push('/admin/list-details?type=solutions');
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

const SolutionEditFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Update Solution" />
);

export const SolutionEditForm: React.FC<SolutionEditFormProps> = ({ documentId }) => {
    const router = useRouter();
    const { user } = useUser();
    const { globalTags, clients, industries, loading, error } = useTags();
    const [initialData, setInitialData] = useState<SolutionFormData | null>(null);
    const [originalData, setOriginalData] = useState<SolutionFormData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadSolutionData = async () => {
            try {
                setIsLoadingData(true);
                const solutionData = await getSolutionForEdit(documentId);
                if (solutionData) {
                    setInitialData(solutionData);
                    setOriginalData(solutionData);
                } else {
                    setLoadError('Solution not found');
                }
            } catch (error) {
                console.error('Failed to load solution:', error);
                setLoadError(error instanceof Error ? error.message : 'Failed to load solution');
            } finally {
                setIsLoadingData(false);
            }
        };

        if (documentId) {
            loadSolutionData();
        }
    }, [documentId]);

    const onSubmitWithUser = async (data: SolutionFormData, isDraft?: boolean) => {
        if (!originalData) return;
        await handleSolutionEditSubmit(data, documentId, originalData, isDraft, user, router);
    };

    if (loading || isLoadingData) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    if (loadError) {
        return <div>Error loading solution: {loadError}</div>;
    }

    if (!initialData || !originalData) {
        return <div>Solution not found.</div>;
    }

    const configWithActualSubmit = {
        ...solutionFormConfig(globalTags, clients, industries),
        formTitle: 'Edit Solution',
        description: 'Update the solution details below.',
        onSubmit: onSubmitWithUser,
    };

    return (
        <AppFormRenderer<SolutionFormData>
            formConfig={configWithActualSubmit}
            initialData={initialData}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={SolutionEditFormActions}
        />
    );
}; 