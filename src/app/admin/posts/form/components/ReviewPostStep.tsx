import React from 'react';
import { PostFormData } from '../../types';
import {
    SummaryCard,
    GridFieldDisplay,
    BaseReviewStepProps,
    ReviewStepContainer,
    EmptyState,
} from '@/app/admin/forms/components/shared/layout/SummaryCard';

export const ReviewPostStep: React.FC<BaseReviewStepProps<PostFormData>> = ({
    formData,
    className,
}) => {
    // Directly use formData.sections, ensuring it's a valid array.
    const sections = Array.isArray(formData.sections) ? formData.sections : [];

    const {
        postType,
        postTitle,
        headline,
        industryUseCases,
        globalTags,
        clientCompanies,
        date,
        heroImage,
    } = formData;

    // Smart file display logic for hero image
    const getHeroImageDisplay = () => {
        // If user uploaded a new file, show file name
        if (heroImage && heroImage instanceof File) {
            return heroImage.name;
        }
        
        // If no new file but existing URL exists, show URL info
        const heroImageUrl = (formData as any)?.heroImageUrl;
        if (heroImageUrl && typeof heroImageUrl === 'string' && heroImageUrl.trim()) {
            // Extract filename from URL for better display
            const urlParts = heroImageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            return `${filename} (existing)`;
        }
        
        return null; // Will show "Not provided"
    };

    // Smart file display logic for section images
    const getSectionImageDisplay = (section: any, index: number) => {
        // If user uploaded a new file, show file name
        if (section.sectionImage && section.sectionImage instanceof File) {
            return section.sectionImage.name;
        }
        
        // If no new file but existing URL exists, show URL info
        const sectionImageUrl = section.sectionImageUrl;
        if (sectionImageUrl && typeof sectionImageUrl === 'string' && sectionImageUrl.trim()) {
            // Extract filename from URL for better display
            const urlParts = sectionImageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            return `${filename} (existing)`;
        }
        
        return null; // Will show "Not provided"
    };

    return (
        <ReviewStepContainer className={className}>
            <SummaryCard title="Post Details" useGrid={true}>
                <GridFieldDisplay 
                label="Post Type" 
                value={postType} />
                
                <GridFieldDisplay 
                label="Industry Use Cases" 
                value={industryUseCases} 
                type="tags" />
                <GridFieldDisplay 
                label="Post Title" 
                value={postTitle} 
                colSpan={2} />
                <GridFieldDisplay 
                label="Date" 
                value={date} 
                colSpan={1} />
                <GridFieldDisplay 
                label="Headline" 
                value={headline} 
                type="textarea" 
                colSpan={1} />
                <GridFieldDisplay 
                label="Global Tags" 
                value={globalTags} 
                type="tags" 
                colSpan={1} />
                <GridFieldDisplay 
                label="Client Companies" 
                value={clientCompanies} 
                type="tags" 
                colSpan={1} />
            </SummaryCard>

            <h3 className="text-lg font-semibold text-gray-800 pt-4 pb-2">Content Sections</h3>

            {sections.length > 0 ? (
                sections.map((section, index) => {
                    if (!section) return null;

                    return (
                        <SummaryCard
                            key={section.id || `section-${index}`}
                            title={`Section ${index + 1}: ${section.sectionTitle || 'Untitled'}`}
                            useGrid={true}
                        >
                            <GridFieldDisplay label="Section Content" value={section.sectionContent} type="rich-text" colSpan={2} />
                            <GridFieldDisplay label="Section Image" value={getSectionImageDisplay(section, index)} type="file" colSpan={2} />
                        </SummaryCard>
                    );
                })
            ) : (
                <EmptyState message="No content sections have been added." />
            )}
        </ReviewStepContainer>
    );
}; 