import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppFormRenderer } from '@/app/admin/forms/components/AppFormRenderer';
import { industryEditFormConfig } from '../../../form/config/industryFormConfig';
import { IndustryFormData } from '../../../types';
import { StepProgress } from '@/app/admin/forms/components/shared/layout/StepProgress';
import { StepCard } from '@/app/admin/forms/components/shared/layout/StepCard';
import { UniversalFormActions } from '@/app/admin/forms/components/shared/layout/UniversalFormActions';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { FormErrorHandler, UserNotification, InputSanitizer } from '@/app/admin/forms/utils/errorHandler';
import { RateLimiter, withRateLimit } from '@/app/admin/forms/utils/rateLimiter';
import { uploadDoc } from '@/firebase/firebaseAuth';
import { useTags } from '@/context/TagContext';
import { useUser } from '@/context/userContext';
import { getIndustryForEdit } from '../../../utils/industryEditUtils';

interface IndustryEditFormProps {
    documentId: string;
}

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

const handleIndustryEditSubmit = async (
    data: IndustryFormData, 
    documentId: string,
    originalData: IndustryFormData,
    user: any,
    isDraft?: boolean,
    router?: any
) => {
    const context = 'IndustryEditForm';
    const clientId = RateLimiter.getClientIdentifier();
    
    try {
        await withRateLimit(clientId, 'formSubmission', async () => {
            console.log(`[${context}] Edit submit started:`, { isDraft, documentId });

            // Simple validation - only check industry name
            if (!data.industryName?.trim()) {
                throw new Error('Industry name is required');
            }

            // Validate user
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const currentTime = new Date().toISOString();
            const userId = user.id;
            const userEmail = user.email || `user-${userId}`;

            // Handle file uploads only if new files are provided
            const uploadPromises = [];

            if (data.industryIcon && data.industryIcon instanceof File) {
                uploadPromises.push(uploadDoc(`industries/${documentId}/icon`, data.industryIcon).then(url => ({ type: 'icon', url })));
            }
            if (data.industryImage && data.industryImage instanceof File) {
                uploadPromises.push(uploadDoc(`industries/${documentId}/image`, data.industryImage).then(url => ({ type: 'image', url })));
            }
            if (data.industryBrochureFile && data.industryBrochureFile instanceof File) {
                uploadPromises.push(uploadDoc(`industries/${documentId}/documents/brochure`, data.industryBrochureFile).then(url => ({ type: 'brochure', url })));
            }
            if (data.industryDatasheetFile && data.industryDatasheetFile instanceof File) {
                uploadPromises.push(uploadDoc(`industries/${documentId}/documents/datasheet`, data.industryDatasheetFile).then(url => ({ type: 'datasheet', url })));
            }
            if (data.industryCaseStudyFile && data.industryCaseStudyFile instanceof File) {
                uploadPromises.push(uploadDoc(`industries/${documentId}/documents/casestudy`, data.industryCaseStudyFile).then(url => ({ type: 'casestudy', url })));
            }

            const uploadResults = await Promise.all(uploadPromises);

            // Start with existing URLs
            let industryIconUrl = originalData.industryIconUrl;
            let industryImageUrl = originalData.industryImageUrl;
            let brochureUrl = originalData.brochureUrl;
            let datasheetUrl = originalData.datasheetUrl;
            let caseStudyUrl = originalData.caseStudyUrl;

            // Update URLs only if new files were uploaded
            uploadResults.forEach(result => {
                if (result.type === 'icon') industryIconUrl = result.url;
                if (result.type === 'image') industryImageUrl = result.url;
                if (result.type === 'brochure') brochureUrl = result.url;
                if (result.type === 'datasheet') datasheetUrl = result.url;
                if (result.type === 'casestudy') caseStudyUrl = result.url;
            });
            
            const sanitizedData = sanitizeIndustryData(data);

            const updateData: Partial<IndustryFormData> = {
                ...sanitizedData,
                updatedAt: currentTime,
                updatedBy: userEmail,
                updatedById: userId,
                isDraft: isDraft || false,
                industryIconUrl: industryIconUrl || null,
                industryImageUrl: industryImageUrl || null,
                brochureUrl: brochureUrl || null,
                datasheetUrl: datasheetUrl || null,
                caseStudyUrl: caseStudyUrl || null,
            };

            console.log(`[${context}] Updating industry:`, { documentId });

            await updateDoc(doc(db, 'industries', documentId), updateData);
            
            UserNotification.showSuccess(`Industry "${data.industryName}" updated successfully!`);
            console.log(`[${context}] Edit successful:`, { docId: documentId });
        });
        
    } catch (error) {
        console.error(`[${context}] Error occurred:`, error);
        const formError = FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, context);
        UserNotification.showError(formError);
        throw error;
    }
};

const IndustryEditFormActions: React.FC<React.ComponentProps<typeof UniversalFormActions>> = (props) => (
    <UniversalFormActions {...props} submitText="Update Industry" redirectPath="/admin/list-details?type=industries" />
);

export const IndustryEditForm: React.FC<IndustryEditFormProps> = ({ documentId }) => {
    const router = useRouter();
    const { icons, clients, loading, error } = useTags();
    const { user } = useUser();
    const [initialData, setInitialData] = useState<IndustryFormData | null>(null);
    const [originalData, setOriginalData] = useState<IndustryFormData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadIndustryData = async () => {
            try {
                setIsLoadingData(true);
                const industryData = await getIndustryForEdit(documentId);
                if (industryData) {
                    setInitialData(industryData);
                    setOriginalData(industryData);
                } else {
                    setLoadError('Industry not found');
                }
            } catch (error) {
                console.error('Failed to load industry:', error);
                setLoadError(error instanceof Error ? error.message : 'Failed to load industry');
            } finally {
                setIsLoadingData(false);
            }
        };

        if (documentId) {
            loadIndustryData();
        }
    }, [documentId]);

    if (loading || isLoadingData) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading form configuration: {error.message}</div>;
    }

    if (loadError) {
        return <div>Error loading industry: {loadError}</div>;
    }

    if (!user) {
        return <div>Please log in to edit industries.</div>;
    }

    if (!initialData || !originalData) {
        return <div>Industry not found.</div>;
    }

    // Create config with edit mode title and simplified validation
    const config = {
        ...industryEditFormConfig(clients),
        formTitle: 'Edit Industry',
        description: 'Update the industry details below.',
    };

    const handleSubmit = async (data: IndustryFormData, isDraft?: boolean) => {
        await handleIndustryEditSubmit(data, documentId, originalData, user, isDraft, router);
    };

    return (
        <AppFormRenderer 
            formConfig={config} 
            initialData={initialData}
            onSubmit={handleSubmit}
            StepProgressComponent={StepProgress}
            StepCardComponent={StepCard}
            FormActionsComponent={IndustryEditFormActions} 
        />
    );
}; 