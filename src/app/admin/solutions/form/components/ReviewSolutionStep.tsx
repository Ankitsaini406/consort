import React from 'react';
import { SolutionFormData } from '../../types'; // Adjusted path
import { FormField } from '@/app/admin/forms/types'; // For onEditSection/goToStep typing if needed
import {
    SummaryCard,
    GridFieldDisplay,
    ReviewStepWithGoToProps,
    ReviewStepContainer,
    SectionHeader,
    EmptyState,
    NestedGrid,
    SectionDivider
} from '@/app/admin/forms/components/shared/layout/SummaryCard';

interface ReviewSolutionStepProps extends ReviewStepWithGoToProps<SolutionFormData> {
    // Keep existing interface for backward compatibility
    goToStep?: (stepId: string | number) => void;
    field?: FormField; // The FormField config for this custom component
}

export const ReviewSolutionStep: React.FC<ReviewSolutionStepProps> = ({
    formData,
    goToStep,
    onEditSection,
    className
}) => {
    // Step IDs from solutionFormConfig.ts for navigation
    // These must match the 'id' properties in your solutionFormConfig steps
    const stepIds = {
        solutionOverview: 1,
        mediaAndAttachments: 2,
        contentSections: 3,
        clientCompanies: 4,
    };

    const handleEditSection = (stepId: string | number) => {
        if (goToStep) {
            goToStep(stepId);
        } else if (onEditSection) {
            onEditSection(stepId);
        }
    };

    return (
        <ReviewStepContainer className={className}>
            <SummaryCard
                title="Solution Overview"
                onEdit={() => handleEditSection(stepIds.solutionOverview)}
                useGrid={true}
            >
                <GridFieldDisplay
                    label="Primary Industry"
                    value={formData.primaryIndustry}
                    type="textarea"
                    colSpan={1}
                />
                <GridFieldDisplay
                    label="Solution Name"
                    value={formData.solutionName}
                    type="textarea"
                    colSpan={1}
                />
                <GridFieldDisplay
                    label="Global Tags"
                    value={formData.globalTags}
                    type="tags"
                    colSpan={2}
                />
                <GridFieldDisplay
                    label="Solution Overview"
                    value={formData.solutionOverview}
                    type="textarea"
                    colSpan={2}
                />
            </SummaryCard>

            <SummaryCard
                title="Media & Attachments"
                onEdit={() => handleEditSection(stepIds.mediaAndAttachments)}
                useGrid={true}
            >
                <GridFieldDisplay
                    label="Hero Image"
                    value={formData.heroImage?.name}
                    type="file"
                />
                <GridFieldDisplay
                    label="Solution Brochure"
                    value={formData.solutionBrochure?.name}
                    type="file"
                />
            </SummaryCard>

            <SummaryCard
                title="Content Sections"
                onEdit={() => handleEditSection(stepIds.contentSections)}
                useGrid={false}
            >
                {Array.isArray(formData.contentSections) && formData.contentSections.length > 0 ? (
                    formData.contentSections.map((section, index) => (
                        <SectionDivider
                            key={section.id || index}
                            isLast={index === formData.contentSections.length - 1}
                        >
                            <SectionHeader
                                title={`Section ${index + 1}: ${section.title || 'Untitled'}`}
                            />
                            <NestedGrid>
                                <GridFieldDisplay
                                    label="Title"
                                    value={section.title}
                                    type="textarea"
                                    colSpan={2}
                                />
                                <GridFieldDisplay
                                    label="Subheading"
                                    value={section.subheading}
                                    type="textarea"
                                    colSpan={2}
                                />
                                <GridFieldDisplay
                                    label="Content"
                                    value={section.content}
                                    type="textarea"
                                    colSpan={2}
                                />
                                <GridFieldDisplay
                                    label="Image"
                                    value={section.image instanceof File ? section.image.name : (typeof section.image === 'string' ? 'File uploaded' : undefined)}
                                    type="file"
                                    colSpan={2}
                                />
                            </NestedGrid>
                        </SectionDivider>
                    ))
                ) : (
                    <EmptyState message="No solution sections added." />
                )}
            </SummaryCard>

            <SummaryCard
                title="Client Companies"
                onEdit={() => handleEditSection(stepIds.clientCompanies)}
                useGrid={true}
            >
                <GridFieldDisplay
                    label="Companies Using This Solution"
                    value={formData.clientCompanies}
                    type="tags"
                    colSpan={2}
                />
            </SummaryCard>
        </ReviewStepContainer>
    );
}; 