import React from 'react';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { Button3 } from '@/ui/components/Button3';
import { RichTextPreview } from '../fields/RichTextPreview';

// Export standardized types and container
export type { BaseReviewStepProps,  ReviewStepWithGoToProps } from './ReviewStepTypes';
export { ReviewStepContainer } from './ReviewStepContainer';
export { SectionHeader, EmptyState, NestedGrid, SectionDivider, NestedSectionContainer } from './StandardizedComponents';

// =============================================================================
// STANDARDIZED TYPOGRAPHY SYSTEM
// =============================================================================

/**
 * Standardized text styles for consistent typography across all review components
 * These styles ensure visual hierarchy and readability
 */
const TYPOGRAPHY_STYLES = {
  // Card and section titles - Primary headings
  cardTitle: "text-body font-body text-brand-600",
  sectionTitle: "text-sm font-body text-default-font font-medium",
  
  // Field labels - Secondary text for form field identification
  fieldLabel: "text-xs font-caption leading-[1.5] text-slate-400",
  
  // Content text - Main readable content
  contentText: "text-xs font-body leading-[1.5] text-defaulxsnt",
  contentTextarea: "text-xs font-body leading-[1.5] text-default-font whitespace-pre-wrap leading-relaxed",
  
  // Tags - Highlighted categorical information
  tagText: "text-xs font-caption text-consort-blue",
  tagContainer: "px-2.5 py-0.5 bg-brand-100 rounded-full",
  
  // Empty states - Placeholder text when no content
  emptyState: "text-xs text-red-500 italic",
  
  // Interactive elements
  buttonIcon: "text-subtext-color",
  hoverState: "hover:bg-neutral-50"
} as const;

/**
 * Standardized spacing system for consistent layout
 */
const SPACING_STYLES = {
  // Grid and container spacing
  gridGap: "gap-2",
  containerPadding: "px-3 py-2",
  contentPadding: "px-4 py-4",
  fieldPadding: "p-3",
  
  // Vertical spacing
  sectionSpacing: "py-3",
  itemSpacing: "space-y-1",
  tagSpacing: "gap-1.5 mt-2",
  
  // Margins
  cardMargin: "mb-2",
  labelMargin: "mb-1"
} as const;

// =============================================================================
// LEGACY SUMMARY COMPONENTS (for backward compatibility)
// =============================================================================

interface SummaryItemProps {
    label: string;
    value: React.ReactNode;
    isTextArea?: boolean;
}

/**
 * Legacy SummaryItem component - maintains backward compatibility
 * Uses standardized typography for consistent styling
 */
const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, isTextArea }) => (
    <div className={`flex flex-col sm:flex-row sm:items-start py-1.5 ${isTextArea ? 'sm:space-x-4' : 'sm:space-x-2'}`}>
        {/* Field label - standardized caption styling */}
        <dt className={`${TYPOGRAPHY_STYLES.fieldLabel} shrink-0`}>{label}:</dt>
        {/* Field value - standardized content styling */}
        <dd className={`${isTextArea ? TYPOGRAPHY_STYLES.contentTextarea : TYPOGRAPHY_STYLES.contentText}`}>
            {value || <span className={TYPOGRAPHY_STYLES.emptyState}>Not provided</span>}
        </dd>
    </div>
);

interface SummarySectionProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    className?: string;
}

/**
 * Legacy SummarySection component - maintains backward compatibility
 * Uses standardized typography and spacing
 */
const SummarySection: React.FC<SummarySectionProps> = ({ title, children, onEdit, className }) => (
    <div className={`${SPACING_STYLES.sectionSpacing} border-b border-neutral-border last:border-b-0 ${className}`}>
        <div className={`flex justify-between items-center ${SPACING_STYLES.labelMargin}`}>
            {/* Section title - standardized section heading */}
            <h4 className={TYPOGRAPHY_STYLES.sectionTitle}>{title}</h4>
            {onEdit && (
                <Button3
                    variant="destructive-tertiary"
                    size="small"
                    icon={<Edit2 size={12} />}
                    onClick={onEdit}
                >
                    EDIT
                </Button3>
            )}
        </div>
        {/* Section content container */}
        <div className={`pl-1 ${SPACING_STYLES.itemSpacing}`}>
            {children}
        </div>
    </div>
);

// =============================================================================
// MAIN SUMMARY CARD COMPONENT
// =============================================================================

interface SummaryCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    defaultExpanded?: boolean;
    useGrid?: boolean; // Enable grid layout for field display
}

/**
 * Main SummaryCard component with collapsible accordion functionality
 * Supports both traditional list layout and modern grid layout
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({ 
    title, 
    children, 
    onEdit, 
    defaultExpanded = true,
    useGrid = false 
}) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    return (
        <div className={`w-full border border-neutral-border rounded bg-white shadow-sm ${SPACING_STYLES.cardMargin}`}>
            <div className={`${SPACING_STYLES.containerPadding}`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-1 ${TYPOGRAPHY_STYLES.hoverState} rounded transition-colors`}
                            aria-label={isExpanded ? "Collapse section" : "Expand section"}
                        >
                            {isExpanded ? 
                                <ChevronUp size={20} className={TYPOGRAPHY_STYLES.buttonIcon} /> : 
                                <ChevronDown size={20} className={TYPOGRAPHY_STYLES.buttonIcon} />
                            }
                        </button>
                        <h3 className={TYPOGRAPHY_STYLES.cardTitle}>{title}</h3>
                    </div>
                    {onEdit && (
                        <Button3
                            variant="brand-tertiary"
                            size="small"
                            icon={<Edit2 size={14} />}
                            onClick={onEdit}
                        >
                            EDIT
                        </Button3>
                    )}
                </div>
            </div>
            {isExpanded && (
                <div className={SPACING_STYLES.contentPadding}>
                    {useGrid ? (
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${SPACING_STYLES.gridGap}`}>
                            {children}
                        </div>
                    ) : (
                        <div className={SPACING_STYLES.itemSpacing}>
                            {children}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// =============================================================================
// STANDARDIZED GRID FIELD DISPLAY COMPONENT
// =============================================================================

interface GridFieldDisplayProps {
    label: string;
    value: React.ReactNode;
    type?: 'text' | 'textarea' | 'tags' | 'file' | 'files' | 'list' | 'rich-text';
    colSpan?: 1 | 2; // Allow spanning full width for long content
}

/**
 * Standardized field display component for consistent content presentation
 * Handles different content types with appropriate styling and layout
 */
export const GridFieldDisplay: React.FC<GridFieldDisplayProps> = ({ 
    label, 
    value, 
    type = 'text',
    colSpan = 1 
}) => {
    /**
     * Renders field value based on content type with standardized styling
     */
    const renderValue = () => {
        // Handle empty values consistently
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return <span className={TYPOGRAPHY_STYLES.emptyState}>Not provided</span>;
        }

        switch (type) {
            case 'textarea':
                return (
                    <p className={TYPOGRAPHY_STYLES.contentTextarea}>
                        {value}
                    </p>
                );
                
            case 'tags':
                return (
                    <div className={`flex flex-wrap ${SPACING_STYLES.tagSpacing}`}>
                        {Array.isArray(value) && value.map((tag: string, index: number) => (
                            <span 
                                key={index} 
                                className={`${TYPOGRAPHY_STYLES.tagContainer} ${TYPOGRAPHY_STYLES.tagText}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                );
                
            case 'file':
                return (
                    <div className="flex items-center gap-2">
                        <span className={TYPOGRAPHY_STYLES.contentText}>{value}</span>
                    </div>
                );
                
            case 'files':
                return (
                    <div className={SPACING_STYLES.itemSpacing}>
                        {Array.isArray(value) && value.map((file: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className={TYPOGRAPHY_STYLES.contentText}>
                                    {file.name || file}
                                </span>
                            </div>
                        ))}
                    </div>
                );
                
            case 'list':
                return (
                    <ul className={SPACING_STYLES.itemSpacing}>
                        {Array.isArray(value) && value.map((item: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-subtext-color rounded-full mt-2 flex-shrink-0"></span>
                                <span className={TYPOGRAPHY_STYLES.contentText}>
                                    {item.content || item.text || item}
                                </span>
                            </li>
                        ))}
                    </ul>
                );
                
            case 'rich-text':
                return (
                    <RichTextPreview content={value as string} />
                );
                
            default:
                return <span className={TYPOGRAPHY_STYLES.contentText}>{value}</span>;
        }
    };

    return (
        <div className={`${SPACING_STYLES.fieldPadding} bg-neutral-50 rounded-sm ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
            <div className={SPACING_STYLES.itemSpacing}>
                <dt className={TYPOGRAPHY_STYLES.fieldLabel}>{label}</dt>
                <dd>{renderValue()}</dd>
            </div>
        </div>
    );
}; 