import React from 'react';
import { IndustryFormData } from '../../types';
import { FormField } from '@/app/admin/forms/types';
import {
    SummaryCard,
    GridFieldDisplay,
    ReviewStepWithGoToProps,
    ReviewStepContainer,
    SectionHeader,
    EmptyState,
    NestedGrid,
    SectionDivider,
    NestedSectionContainer
} from '@/app/admin/forms/components/shared/layout/SummaryCard';
import DynamicFeatherIcon from '@/components/admin/DynamicFeatherIcon';

interface ReviewIndustryStepProps extends ReviewStepWithGoToProps<IndustryFormData> {
    // Keep existing interface for backward compatibility
    goToStep?: (stepId: string | number) => void;
    field?: FormField;
}

export const ReviewIndustryStep: React.FC<ReviewIndustryStepProps> = ({
    formData,
    goToStep,
    onEditSection,
    className
}) => {
    // Add safety check for formData
    if (!formData) {
        return <div className="text-center py-8 text-gray-500">No form data available</div>;
    }

    // Step IDs from industryFormConfig.ts for navigation
    const stepIds = {
        industryInformation: 1,
        industryDetails: 2,
        keyFeatures: 3,
        additionalDetails: 4,
    };

    const handleEditSection = (stepId: string | number) => {
        if (goToStep) {
            goToStep(stepId);
        } else if (onEditSection) {
            onEditSection(stepId);
        }
    };

    // Smart file display logic for industry icon
    const getIndustryIconDisplay = () => {
        // If user uploaded a new file, show file name
        if (formData.industryIcon && formData.industryIcon instanceof File) {
            return formData.industryIcon.name;
        }
        
        // If no new file but existing URL exists, show URL info
        const industryIconUrl = (formData as any)?.industryIconUrl;
        if (industryIconUrl && typeof industryIconUrl === 'string' && industryIconUrl.trim()) {
            // Extract filename from URL for better display
            const urlParts = industryIconUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            return `${filename} (existing)`;
        }
        
        return null; // Will show "Not provided"
    };

    // Smart file display logic for industry image
    const getIndustryImageDisplay = () => {
        // If user uploaded a new file, show file name
        if (formData.industryImage && formData.industryImage instanceof File) {
            return formData.industryImage.name;
        }
        
        // If no new file but existing URL exists, show URL info
        const industryImageUrl = (formData as any)?.industryImageUrl;
        if (industryImageUrl && typeof industryImageUrl === 'string' && industryImageUrl.trim()) {
            // Extract filename from URL for better display
            const urlParts = industryImageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            return `${filename} (existing)`;
        }
        
        return null; // Will show "Not provided"
    };

    return (
        <ReviewStepContainer className={className}>
            <SummaryCard
                title="Industry Information"
                onEdit={() => handleEditSection(stepIds.industryInformation)}
                useGrid={true}
            >
                <GridFieldDisplay
                    label="Industry Name"
                    value={formData.industryName || ''}
                    colSpan={1}
                />
                <GridFieldDisplay
                    label="Industry Overview"
                    value={formData.industryOverview || formData.industryHeadline || ''} // New field with fallback
                    type="textarea"
                    colSpan={1}
                />
                <GridFieldDisplay
                    label="Industry Icon"
                    value={getIndustryIconDisplay() || ''}
                    type="file"
                />
                <GridFieldDisplay
                    label="Industry Image"
                    value={getIndustryImageDisplay() || ''}
                    type="file"
                />
            </SummaryCard>

            <SummaryCard
                title="Industry Details & Statistics"
                onEdit={() => handleEditSection(stepIds.industryDetails)}
                useGrid={true}
            >
                <GridFieldDisplay
                    label="Industry Description"
                    value={formData.industryDescription || formData.industryBrief || ''} // New field with fallback
                    type="textarea"
                    colSpan={1}
                />
                <GridFieldDisplay
                    label="Brief Description"
                    value={formData.industryBriefDescription || ''}
                    type="textarea"
                    colSpan={1}
                />
            </SummaryCard>

            {/* Industry Statistics Section */}
            <SummaryCard
                title="Industry Statistics"
                onEdit={() => handleEditSection(stepIds.industryDetails)}
                useGrid={false}
            >
                {/* Use new industryStatistics field with fallback to legacy industryStats */}
                {Array.isArray(formData.industryStatistics) && formData.industryStatistics.length > 0 ? (
                    <NestedSectionContainer>
                        <NestedGrid>
                            {formData.industryStatistics.map((stat, index) => (
                                <React.Fragment key={stat.id || index}>
                                    <GridFieldDisplay
                                        label={`Statistic ${index + 1} Value`}
                                        value={stat.value || ''}
                                    />
                                    <GridFieldDisplay
                                        label={`Statistic ${index + 1} Description`}
                                        value={stat.description || ''}
                                        colSpan={1}
                                    />
                                </React.Fragment>
                            ))}
                        </NestedGrid>
                    </NestedSectionContainer>
                ) : Array.isArray(formData.industryStats) && formData.industryStats && formData.industryStats.length > 0 ? (
                    // Fallback to legacy industryStats structure
                    <NestedSectionContainer>
                        <NestedGrid>
                            {formData.industryStats.map((stat, index) => (
                                <React.Fragment key={stat.id || index}>
                                    <GridFieldDisplay
                                        label={`Statistic ${index + 1} Number`}
                                        value={stat.statNumber || ''}
                                    />
                                    <GridFieldDisplay
                                        label={`Statistic ${index + 1} Description`}
                                        value={stat.statDescription || ''}
                                        type="text"
                                        colSpan={1}
                                    />
                                </React.Fragment>
                            ))}
                        </NestedGrid>
                    </NestedSectionContainer>
                ) : (
                    <EmptyState message="No industry statistics added." />
                )}
            </SummaryCard>

            {/* Industry Features Section */}
            <SummaryCard
                title="Industry Features"
                onEdit={() => handleEditSection(stepIds.keyFeatures)}
                useGrid={false}
            >
                {/* Use new industryFeatures field with fallback to legacy industryKeyFeatures */}
                {Array.isArray(formData.industryFeatures) && formData.industryFeatures.length > 0 ? (
                    <div className="space-y-3">
                        {formData.industryFeatures.map((feature, index) => (
                            <div key={feature.id || index} className="flex items-center gap-3 p-3 bg-brand-50 rounded-md">
                                <DynamicFeatherIcon 
                                    name={feature.icon || ''} 
                                    className="h-5 w-5 text-consort-blue flex-shrink-0" 
                                />
                                <span className="text-sm text-consort-blue">{feature.description || ''}</span>
                            </div>
                        ))}
                    </div>
                ) : Array.isArray(formData.industryKeyFeatures) && formData.industryKeyFeatures && formData.industryKeyFeatures.length > 0 ? (
                    // Fallback to legacy industryKeyFeatures structure
                    <NestedSectionContainer>
                        <NestedGrid>
                            {formData.industryKeyFeatures.map((feature, index) => (
                                <React.Fragment key={feature.id || index}>
                                    <GridFieldDisplay
                                        label={`Feature ${index + 1} Icon`}
                                        value={feature.icon || ''}
                                        colSpan={1}
                                    />
                                    <GridFieldDisplay
                                        label={`Feature ${index + 1} Text`}
                                        value={feature.featureText || ''}
                                        type="textarea"
                                        colSpan={1}
                                    />
                                </React.Fragment>
                            ))}
                        </NestedGrid>
                    </NestedSectionContainer>
                ) : (
                    <EmptyState message="No industry features added." />
                )}
            </SummaryCard>

            <SummaryCard
                title="Additional Details"
                onEdit={() => handleEditSection(stepIds.additionalDetails)}
                useGrid={true}
            >
                <GridFieldDisplay
                    label="Industry Leaders"
                    value={formData.industryLeaders || formData.associatedCompanies || []} // New field with fallback
                    type="tags"
                    colSpan={2}
                />
                <GridFieldDisplay
                    label="Industry Brochure"
                    value={formData.industryBrochureFile?.name || formData.industryBrochure?.name || ''} // New field with fallback
                    type="file"
                />
                <GridFieldDisplay
                    label="Industry Case Study"
                    value={formData.industryCaseStudyFile?.name || formData.industryCaseStudy?.name || ''} // New field with fallback
                    type="file"
                />
            </SummaryCard>
        </ReviewStepContainer>
    );
}; 