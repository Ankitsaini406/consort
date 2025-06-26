import React from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { industryFormConfig } from './config/industryFormConfig';
import { IndustryFormData } from '../types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { useTags } from '@/context/TagContext';
import { createSlug } from '@/utils/Utils';
import { uploadDoc } from '@/firebase/firebaseAuth';
import { useUser } from '@/context/userContext';

const sanitizeIndustryData = (data: IndustryFormData) => {
    const sanitized: any = { ...data };

    delete sanitized.industryIcon;
    delete sanitized.industryImage;
    delete sanitized.industryBrochureFile;
    delete sanitized.industryDatasheetFile;
    delete sanitized.industryCaseStudyFile;

    sanitized.industryName = InputSanitizer.sanitizeString(data.industryName || '');
    sanitized.industryOverview = InputSanitizer.sanitizeString(data.industryOverview || '');
    sanitized.industryDescription = InputSanitizer.sanitizeString(data.industryDescription || '');
    sanitized.industryBriefDescription = InputSanitizer.sanitizeString(data.industryBriefDescription || '');
    sanitized.industryHeadline = InputSanitizer.sanitizeString(data.industryHeadline || '');
    sanitized.industryStatistics = data.industryStatistics?.map(stat => ({
        ...stat,
        value: InputSanitizer.sanitizeString(stat.value || ''),
        description: InputSanitizer.sanitizeString(stat.description || '')
    })) || [];
    sanitized.industryFeatures = data.industryFeatures?.map(feature => ({
        ...feature,
        description: InputSanitizer.sanitizeString(feature.description || '')
    })) || [];
    
    return sanitized;
};

const handleIndustryFormSubmit = async (user: any, data: IndustryFormData, isDraft?: boolean, router?: any) => {
    const context = 'IndustryForm';
    const clientId = RateLimiter.getClientIdentifier();
    
    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Submit started:`, { isDraft });

            // Validate required fields
            if (!data.industryName) {
                throw new Error('Industry name is required');
            }

            // Validate user
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const slug = createSlug(data.industryName);
            const currentTime = new Date().toISOString();
            const userId = user.id;
            const userEmail = user.email || `user-${userId}`;

            const uploadPromises = [];

            if (data.industryIcon) {
                uploadPromises.push(uploadDoc(`industries/${slug}/icon`, data.industryIcon).then(url => ({ type: 'icon', url })));
            }
            if (data.industryImage) {
                uploadPromises.push(uploadDoc(`industries/${slug}/image`, data.industryImage).then(url => ({ type: 'image', url })));
            }
            if (data.industryBrochureFile) {
                uploadPromises.push(uploadDoc(`industries/${slug}/documents/brochure`, data.industryBrochureFile).then(url => ({ type: 'brochure', url })));
            }
            if (data.industryDatasheetFile) {
                uploadPromises.push(uploadDoc(`industries/${slug}/documents/datasheet`, data.industryDatasheetFile).then(url => ({ type: 'datasheet', url })));
            }
            if (data.industryCaseStudyFile) {
                uploadPromises.push(uploadDoc(`industries/${slug}/documents/casestudy`, data.industryCaseStudyFile).then(url => ({ type: 'casestudy', url })));
            }

            const uploadResults = await Promise.all(uploadPromises);

            let industryIconUrl: string | null = null;
            let industryImageUrl: string | null = null;
            let brochureUrl: string | null = null;
            let datasheetUrl: string | null = null;
            let caseStudyUrl: string | null = null;

            uploadResults.forEach(result => {
                if (result.type === 'icon') industryIconUrl = result.url;
                if (result.type === 'image') industryImageUrl = result.url;
                if (result.type === 'brochure') brochureUrl = result.url;
                if (result.type === 'datasheet') datasheetUrl = result.url;
                if (result.type === 'casestudy') caseStudyUrl = result.url;
            });
            
            const sanitizedData = sanitizeIndustryData(data);

            const finalData = {
                ...sanitizedData,
                slug,
                isDraft: isDraft || false,
                createdAt: currentTime,
                updatedAt: currentTime,
                createdBy: userEmail,
                createdById: userId,
                updatedBy: userEmail,
                updatedById: userId,
                industryIconUrl,
                industryImageUrl,
                brochureUrl,
                datasheetUrl,
                caseStudyUrl,
            };
            
            console.log(`[${context}] Saving data:`, finalData);

            await setDoc(doc(db, 'industries', slug), finalData);
            
            UserNotification.showSuccess(`Industry "${data.industryName}" saved successfully!`);
            console.log(`[${context}] Submit successful:`, { docId: slug });
        });
        
    } catch (error) {
        console.error(`[${context}] Error occurred:`, error);
        const formError = FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, context);
        UserNotification.showError(formError);
        throw error;
    }
};

// Industry-specific FormActions wrapper
const IndustryFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Submit Industry" redirectPath="/admin/list-details?type=industries" />
);

export const IndustryForm: React.FC = () => {
    const router = useRouter();
    const { user } = useUser();
    const { icons, clients, loading, error } = useTags();

    if (loading) {
        return <div>Loading form configuration...</div>;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    const formConfig = industryFormConfig(clients);

    return (
        <AppFormRenderer<IndustryFormData>
        formConfig={{ ...formConfig, onSubmit: (data: IndustryFormData, isDraft?: boolean) => handleIndustryFormSubmit(user, data, isDraft, router) }}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={IndustryFormActions}
        />
    );
}; 