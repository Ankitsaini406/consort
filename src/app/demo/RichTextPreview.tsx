import React from 'react';
import { cn } from '@/lib/utils';

// Types matching the RTE v2 structure
interface ListItem {
    id: string;
    content: string;
}

interface TextBlock {
    id: string;
    type: 'h1' | 'h2' | 'paragraph' | 'list';
    content?: string;
    listType?: 'bullet' | 'numbered';
    items?: ListItem[];
}

interface RichTextPreviewProps {
    content: string;
    className?: string;
    maxLength?: number; // For truncated preview
    showEmpty?: boolean; // Whether to show "No content" for empty
}

// Standardized typography styles to match other GridFieldDisplay components
const TYPOGRAPHY_STYLES = {
    // Base content text - matches other components
    contentText: "!my-2 text-body font-body mobile:leading-snug text-subtext-color",
    contentTextarea: "!my-2 text-body font-body mobile:leading-snug text-subtext-color",

    // Headings - slightly larger but proportional
    heading1: "!mb-2 lg:!text-body-xl !leading-[135%] md:text-body-xl mobile:text-body-xl font-bold !font-manrope text-neutral-600",
    heading2: "!my-1.5 !text-body-lg !leading-[145%] font-body-lg text-neutral-600",

    // Empty state
    emptyState: "text-xs text-red-500 italic",
} as const;

// List styling configuration - easily customizable
const LIST_STYLES = {
    // Container styles
    listContainer: "space-y-2",
    listItemContainer: "my-2 flex items-start",

    // Bullet/number styling
    bulletContainer: "flex-shrink-0 mr-1", // Consistent margin and alignment
    bulletText: "text-body font-body font-medium !leading-snug text-subtext-color mr-1", // Updated to match new style

    // Content styling
    listContent: "flex-1", // Takes remaining space

    // Spacing control
    bulletWidth: "w-6", // Fixed width for consistent alignment

    // Custom bullet and number styles
    bullet: "✔", // You can change this to any character: "→", "▪", "◦", etc.
    bulletColor: "text-consort-red",
    numberColor: "text-neutral-500",
} as const;

// Security: Content sanitization function (same as RTE)
const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';

    // SSR Guard: DOMParser is not available on the server.
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        // Basic sanitization for server-side rendering.
        const re = /<[^>]*>?/gm;
        return text.replace(re, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/file:/gi, '')
            .trim();
    }

    // Use DOM parser for robust HTML stripping (client-side only)
    const doc = new DOMParser().parseFromString(text, 'text/html');

    // Extract only text content, ignoring all HTML/scripts
    const textContent = doc.body.textContent || doc.body.innerText || '';

    // Additional protocol filtering for any remaining URLs
    return textContent
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/data:/gi, '') // Remove data: protocols  
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols
        .replace(/file:/gi, '') // Remove file: protocols
        .trim();
};

// Custom list item renderer with consistent spacing
const ListItemRenderer: React.FC<{
    item: ListItem;
    index: number;
    listType: 'bullet' | 'numbered';
}> = ({ item, index, listType }) => {
    const renderMarker = () => {
        if (listType === 'numbered') {
            return (
                <span className={cn(
                    LIST_STYLES.bulletContainer,
                    LIST_STYLES.bulletWidth,
                    LIST_STYLES.bulletText,
                    LIST_STYLES.numberColor,
                    "text-right" // Right-align numbers for consistent spacing
                )}>
                    {index + 1}.
                </span>
            );
        } else {
            return (
                <span className={cn(
                    LIST_STYLES.bulletContainer,
                    LIST_STYLES.bulletWidth,
                    LIST_STYLES.bulletText,
                    LIST_STYLES.bulletColor,
                    "text-center" // Center-align bullets
                )}>
                    {LIST_STYLES.bullet}
                </span>
            );
        }
    };

    return (
        <li className={cn(LIST_STYLES.listItemContainer, "mb-1")}>
            {renderMarker()}
            <span className={cn(
                LIST_STYLES.listContent,
                "text-body font-body mobile:leading-snug text-subtext-color"
            )}>
                {sanitizeText(item.content)}
            </span>
        </li>
    );
};

// Individual block renderer component
const BlockRenderer: React.FC<{ block: TextBlock; isLast: boolean }> = ({ block, isLast }) => {
    const renderTextWithStyling = (text: string) => sanitizeText(text);

    switch (block.type) {
        case 'h1':
            return (
                <h1 className={cn(
                    TYPOGRAPHY_STYLES.heading1,
                    !isLast && "mb-1"
                )}>
                    {renderTextWithStyling(block.content || '')}
                </h1>
            );
        case 'h2':
            return (
                <h2 className={cn(
                    TYPOGRAPHY_STYLES.heading2,
                    !isLast && "mb-1"
                )}>
                    {renderTextWithStyling(block.content || '')}
                </h2>
            );
        case 'paragraph':
            const paragraphContent = renderTextWithStyling(block.content || '');
            if (!paragraphContent) return null;

            return (
                <p className={cn(
                    TYPOGRAPHY_STYLES.contentText,
                    !isLast && "mb-1"
                )}>
                    {paragraphContent}
                </p>
            );
        case 'list':
            const listItems = block.items?.filter(item => sanitizeText(item.content)) || [];

            if (listItems.length === 0) return null;

            return (
                <ul className={cn(
                    LIST_STYLES.listContainer,
                    !isLast && "mb-1"
                )}>
                    {listItems.map((item, index) => (
                        <ListItemRenderer
                            key={item.id}
                            item={item}
                            index={index}
                            listType={block.listType || 'bullet'}
                        />
                    ))}
                </ul>
            );
        default:
            return null;
    }
};

const RichTextPreview: React.FC<RichTextPreviewProps> = ({
    content,
    className,
    maxLength,
    showEmpty = true
}) => {
    // Parse JSON content safely
    const parseContent = (): TextBlock[] => {
        if (!content || !content.trim()) return [];

        try {
            const parsed = JSON.parse(content);
            if (!Array.isArray(parsed)) return [];

            return parsed.filter((block): block is TextBlock => {
                return block &&
                    typeof block.id === 'string' &&
                    typeof block.type === 'string' &&
                    ['h1', 'h2', 'paragraph', 'list'].includes(block.type);
            });
        } catch (error) {
            console.warn('Failed to parse rich text content:', error);
            return [];
        }
    };

    const blocks = parseContent();

    // Filter out empty blocks
    const nonEmptyBlocks = blocks.filter(block => {
        if (block.type === 'list') {
            return block.items?.some(item => sanitizeText(item.content));
        }
        return sanitizeText(block.content || '');
    });

    // Handle empty content
    if (nonEmptyBlocks.length === 0) {
        return showEmpty ? (
            <span className={TYPOGRAPHY_STYLES.emptyState}>No content provided</span>
        ) : null;
    }

    // Apply length truncation if specified
    let blocksToRender = nonEmptyBlocks;
    let isTruncated = false;

    if (maxLength && maxLength > 0) {
        let totalLength = 0;
        const truncatedBlocks: TextBlock[] = [];

        for (const block of nonEmptyBlocks) {
            let blockText = '';
            if (block.type === 'list') {
                blockText = block.items?.map(item => item.content).join(' ') || '';
            } else {
                blockText = block.content || '';
            }

            if (totalLength + blockText.length > maxLength) {
                isTruncated = true;
                break;
            }

            truncatedBlocks.push(block);
            totalLength += blockText.length;
        }

        blocksToRender = truncatedBlocks;
    }

    return (
        <div className={cn("rich-text-preview", className)}>
            <div className="space-y-1">
                {blocksToRender.map((block, index) => (
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        isLast={index === blocksToRender.length - 1}
                    />
                ))}
            </div>
            {isTruncated && (
                <span className={cn(TYPOGRAPHY_STYLES.emptyState, "mt-2 block")}>
                    ... (content truncated)
                </span>
            )}
        </div>
    );
};

// Compact version for smaller spaces (like cards)
const RichTextPreviewCompact: React.FC<RichTextPreviewProps> = (props) => (
    <RichTextPreview
        {...props}
        maxLength={200}
        className={cn("text-sm", props.className)}
    />
);

// Export for use in GridFieldDisplay and other components
export default RichTextPreview; 