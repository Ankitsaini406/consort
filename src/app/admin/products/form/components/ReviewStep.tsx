import React from 'react';
import { ProductFormData } from '../types';
import { 
    SummaryCard, 
    GridFieldDisplay, 
    BaseReviewStepProps, 
    ReviewStepContainer,
    EmptyState,
    NestedGrid,
    SectionDivider
} from '@/app/admin/forms/components/shared/layout/SummaryCard';
import DynamicFeatherIcon from '@/components/admin/DynamicFeatherIcon';

interface ReviewStepProps extends BaseReviewStepProps<ProductFormData> {
    onEditSection: (stepId: number | string) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
    formData, 
    onEditSection, 
    className 
}) => {
    const stepIds = {
        productDetails: 1,
        productBrief: 2,
        technicalSpecs: 3,
        resources: 4,
        highlights: 5,
    };

    return (
        <ReviewStepContainer className={className}>
            <SummaryCard 
                title="Product Details" 
                onEdit={() => onEditSection(stepIds.productDetails)}
                useGrid={true}
            >
                <GridFieldDisplay 
                    label="Portfolio Category" 
                    value={formData.portfolioCategory}
                />
                <GridFieldDisplay 
                    label="Brand Name" 
                    value={formData.brandName}
                />
                <GridFieldDisplay 
                    label="Target Industries" 
                    value={formData.targetIndustries}
                    type="tags" 
                />
                <GridFieldDisplay 
                    label="Client Companies" 
                    value={formData.clientCompanies}
                    type="tags" 
                />
                <GridFieldDisplay 
                    label="Global Tags" 
                    value={formData.globalTags}
                    type="tags" 
                    colSpan={2}
                />
                <GridFieldDisplay 
                    label="Product Name" 
                    value={formData.productName} 
                />
                <GridFieldDisplay 
                    label="Headline" 
                    value={formData.headline} 
                />
                <GridFieldDisplay 
                    label="Marketing Tagline" 
                    value={formData.marketingTagline}
                    type="textarea"
                    colSpan={2}
                />
                <GridFieldDisplay 
                    label="Product Gallery" 
                    value={(() => {
                        const newFiles = Array.isArray(formData.productGallery) ? formData.productGallery.map(photo => photo.name || 'New file') : [];
                        const existingFiles = Array.isArray(formData.productGalleryUrls) ? formData.productGalleryUrls.map((_, index) => `Existing file ${index + 1}`) : [];
                        const removedIndices = (formData as any).productGallery_removedExistingFiles || [];
                        const remainingExisting = existingFiles.filter((_, index) => !removedIndices.includes(index));
                        
                        return [
                            ...remainingExisting,
                            ...newFiles,
                            ...(removedIndices.length > 0 ? [`${removedIndices.length} file(s) will be removed`] : [])
                        ];
                    })()}
                    type="files" 
                    colSpan={2}
                />
            </SummaryCard>

            <SummaryCard 
                title="Product Brief" 
                onEdit={() => onEditSection(stepIds.productBrief)}
                useGrid={true}
            >
                <GridFieldDisplay 
                    label="Product Description" 
                    value={formData.productDescription}
                    type="rich-text"
                    colSpan={2}
                />
                {/* Custom Key Features Display with Icons */}
                <div className="col-span-2">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-subtext-color">Key Features</h4>
                        {Array.isArray(formData.keyFeatures) && formData.keyFeatures.length > 0 ? (
                            <div className="flex flex-row gap-2 flex-wrap">
                                {formData.keyFeatures.map((feature, index) => (
                                    <div key={feature.id || index} className="flex basis-[calc(50%-0.5rem)] items-center gap-2 px-4 py-2 bg-brand-50 rounded-sm">
                                        <DynamicFeatherIcon 
                                            name={feature.icon} 
                                            className="h-5 w-5 text-consort-blue flex-shrink-0" 
                                        />
                                        <span className="text-sm text-consort-blue">{feature.keyFeature}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-subtext-color italic">No key features added.</p>
                        )}
                    </div>
                </div>
            </SummaryCard>

            <SummaryCard 
                title="Technical Specifications" 
                onEdit={() => onEditSection(stepIds.technicalSpecs)}
                useGrid={false}
            >
                {Array.isArray(formData.technicalSpecifications) && formData.technicalSpecifications.length > 0 ? (
                    <div className="space-y-3">
                        {formData.technicalSpecifications.map((spec, index) => (
                            <div key={spec.id || index} className="flex items-start gap-4 px-4 py-3 bg-brand-50 rounded-sm">
                                <div className="flex-1">
                                    <h5 className="text-sm font-medium text-consort-blue">{spec.parameter}</h5>
                                    <p className="text-sm text-subtext-color mt-1">{spec.specification}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No technical specifications added." />
                )}
            </SummaryCard>

            <SummaryCard 
                title="Product Resources" 
                onEdit={() => onEditSection(stepIds.resources)}
                useGrid={true}
            >
                <GridFieldDisplay 
                    label="Datasheet" 
                    value={(() => {
                        const newFile = formData.datasheetFile?.name;
                        const hasExisting = formData.datasheetUrl;
                        const willRemove = (formData as any).datasheetFile_removedExistingFiles?.includes(0);
                        
                        if (newFile) return newFile;
                        if (hasExisting && !willRemove) return 'Existing file';
                        if (willRemove) return 'Will be removed';
                        return undefined;
                    })()}
                    type="file" 
                />
                <GridFieldDisplay 
                    label="Brochure" 
                    value={(() => {
                        const newFile = formData.brochureFile?.name;
                        const hasExisting = formData.brochureUrl;
                        const willRemove = (formData as any).brochureFile_removedExistingFiles?.includes(0);
                        
                        if (newFile) return newFile;
                        if (hasExisting && !willRemove) return 'Existing file';
                        if (willRemove) return 'Will be removed';
                        return undefined;
                    })()}
                    type="file" 
                />
                <GridFieldDisplay 
                    label="Case Study" 
                    value={(() => {
                        const newFile = formData.caseStudyFile?.name;
                        const hasExisting = formData.caseStudyUrl;
                        const willRemove = (formData as any).caseStudyFile_removedExistingFiles?.includes(0);
                        
                        if (newFile) return newFile;
                        if (hasExisting && !willRemove) return 'Existing file';
                        if (willRemove) return 'Will be removed';
                        return undefined;
                    })()}
                    type="file" 
                />
            </SummaryCard>

            <SummaryCard 
                title="Marketing Highlights" 
                onEdit={() => onEditSection(stepIds.highlights)}
                useGrid={false}
            >
                {Array.isArray(formData.marketingHighlights) && formData.marketingHighlights.length > 0 ? (
                    formData.marketingHighlights.map((highlight, index) => (
                        <SectionDivider 
                            key={highlight.id || index} 
                            isLast={index === formData.marketingHighlights.length - 1}
                        >
                            <NestedGrid>
                                <GridFieldDisplay 
                                    label="Headline" 
                                    value={highlight.headline} 
                                />
                                <GridFieldDisplay 
                                    label="Visuals" 
                                    value={(() => {
                                        // Handle both single file (File) and array (File[]) modes
                                        const newFiles = highlight.visuals 
                                            ? (highlight.visuals instanceof File 
                                                ? [highlight.visuals.name || 'New file']
                                                : Array.isArray(highlight.visuals) 
                                                    ? highlight.visuals.map(visual => visual.name || 'New file')
                                                    : [])
                                            : [];
                                        const existingFiles = Array.isArray(highlight.visualUrls) ? highlight.visualUrls.map((_, index) => `Existing visual ${index + 1}`) : [];
                                        const removalKey = `marketingHighlights[${index}].visuals_removedExistingFiles`;
                                        const removedIndices = (formData as any)[removalKey] || [];
                                        const remainingExisting = existingFiles.filter((_, fileIndex) => !removedIndices.includes(fileIndex));
                                        
                                        return [
                                            ...remainingExisting,
                                            ...newFiles,
                                            ...(removedIndices.length > 0 ? [`${removedIndices.length} visual(s) will be removed`] : [])
                                        ];
                                    })()} 
                                    type="files"
                                    colSpan={1}
                                />
                                <GridFieldDisplay 
                                    label="Description" 
                                    value={highlight.description} 
                                    type="textarea"
                                    colSpan={2}
                                />
                            </NestedGrid>
                        </SectionDivider>
                    ))
                ) : (
                    <EmptyState message="No marketing highlights added." />
                )}
            </SummaryCard>
        </ReviewStepContainer>
    );
}; 