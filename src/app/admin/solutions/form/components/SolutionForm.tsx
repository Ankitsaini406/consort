import React from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { solutionFormConfig } from '../config/solutionFormConfig';
import { SolutionFormData } from '../../types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { useUser } from '@/context/userContext';
// Remove User import - using user from context instead
import { createSlug } from '@/utils/Utils';
import { removeFileObjects, uploadDoc } from '@/firebase/firebaseAuth';
import { useTags } from '@/context/TagContext';

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

const handleSolutionFormSubmit = async (
    data: SolutionFormData,
    isDraft?: boolean,
    user: any = null,
    router?: any
) => {
    const context = 'SolutionForm';
    const clientId = RateLimiter.getClientIdentifier();

    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Submit started:`, { isDraft });

            const sanitizedData = sanitizeSolutionData(data);
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (sanitizedData.solutionTitle === 'force_error') {
                throw new Error('This is a simulated API error during solution submission.');
            }

            const slug = createSlug(sanitizedData.solutionName);

            const heroImageUrl = sanitizedData.heroImage instanceof File ? await uploadDoc(`solutions/${slug}`, sanitizedData.heroImage) : sanitizedData.heroImage;
            const solutionBrochureUrl = sanitizedData.solutionBrochure instanceof File ? await uploadDoc(`solutions/${slug}/brochure`, sanitizedData.solutionBrochure) : sanitizedData.solutionBrochure;

            const updatedSections = await Promise.all(
                (sanitizedData.contentSections || []).map(async (section, index) => {
                    let sectionImageUrl: string | null = null;
                    if (section.image instanceof File) {
                        const imageName = section.image.name.replace(/\s+/g, '_');
                        sectionImageUrl = await uploadDoc(`solutions/${slug}/sections/${index}_${imageName}`, section.image);
                    } else if (typeof section.image === 'string') {
                        // If it's already a URL, keep it
                        sectionImageUrl = section.image;
                    }

                    return {
                        ...section,
                        // The field in Firestore should be `sectionImage` or similar, not `image`
                        sectionImage: sectionImageUrl,
                    };
                })
            );

            const dataToUpload = {
                ...sanitizedData,
                slug,
                // Timeline fields for list UI
                isDraft: isDraft || false,
                heroImage: heroImageUrl || null,
                brochureUrl: solutionBrochureUrl || null,
                contentSections: updatedSections,
                createdBy: user?.email || 'Unknown',
                createdAt: new Date(),
                updatedAt: new Date(), // Same as createdAt for new items
                updatedBy: user?.email || 'Unknown', // Same as createdBy for new items
            };

            const cleanData = removeFileObjects(dataToUpload);
            console.log(`[${context}] Clean data:`, cleanData);
            await setDoc(doc(db, 'solutions', slug), cleanData);

            UserNotification.showSuccess(`Solution "${sanitizedData.solutionTitle}" saved successfully with ID: ${slug}`);
            console.log(`[${context}] Submit successful:`, { docId: slug });
        });

    } catch (error) {
        const formError = FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, context);
        UserNotification.showError(formError);
        throw error;
    }
};

const SolutionFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Submit Solution" redirectPath="/admin/list-details?type=solutions" />
);

export const SolutionForm: React.FC = () => {
    const router = useRouter();
    const { user } = useUser();
    const { globalTags, clients, industries, loading, error } = useTags();

    const onSubmitWithUser = async (data: SolutionFormData, isDraft?: boolean) => {
        await handleSolutionFormSubmit(data, isDraft, user, router);
    };

    if (loading) {
        return <div>Loading form configuration...</div>;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    const configWithActualSubmit = {
        ...solutionFormConfig(globalTags, clients, industries),
        onSubmit: onSubmitWithUser,
    };

    return (
        <AppFormRenderer<SolutionFormData>
            formConfig={configWithActualSubmit}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={SolutionFormActions}
        />
    );
};
