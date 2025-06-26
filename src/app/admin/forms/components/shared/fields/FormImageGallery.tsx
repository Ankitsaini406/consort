import React, { useState, ChangeEvent } from 'react';
import { FeatherUploadCloud, FeatherX, FeatherImage } from "@subframe/core";
import { Avatar } from '@/ui/components/Avatar';
import { FormLabel } from './FormLabel';

// Size presets for common use cases
export const GALLERY_SIZE_PRESETS = {
    small: 80,
    medium: 120,
    large: 150,
    xlarge: 180,
    xxlarge: 220
} as const;

export type GallerySizePreset = keyof typeof GALLERY_SIZE_PRESETS;

interface FormImageGalleryProps {
    id: string;
    label: string;
    accept?: string;
    value?: File[];
    onChange: (files: File[]) => void;
    required?: boolean;
    maxFiles?: number;
    existingImageUrls?: string[];
    placeholder?: string;
    imageSize?: number | GallerySizePreset; // Size in pixels or preset name
    gridCols?: 2 | 3 | 4 | 5 | 6; // Number of columns in grid
}

interface ImagePreview {
    file: File;
    url: string;
}

function getImageData(event: ChangeEvent<HTMLInputElement>): ImagePreview[] {
    if (!event.target.files || event.target.files.length === 0) {
        return [];
    }

    return Array.from(event.target.files).map(file => ({
        file,
        url: URL.createObjectURL(file)
    }));
}

export const FormImageGallery: React.FC<FormImageGalleryProps> = ({
    id,
    label,
    accept = "image/*",
    value = [],
    onChange,
    required = false,
    maxFiles = 10,
    existingImageUrls = [],
    placeholder = "IMG",
    imageSize = "medium",
    gridCols = 6
}) => {
    const [previews, setPreviews] = useState<ImagePreview[]>([]);

    // Resolve size to number
    const resolvedSize = typeof imageSize === 'string' ? GALLERY_SIZE_PRESETS[imageSize] : imageSize;

    // Regenerate preview URLs when value changes (e.g., coming back from other steps)
    React.useEffect(() => {
        if (value && value.length > 0) {
            // Create new preview URLs from File objects
            const newPreviews = value.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }));
            setPreviews(newPreviews);
            
            // Cleanup function to revoke URLs when component unmounts or value changes
            return () => {
                newPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
            };
        } else {
            // No files, clear previews
            setPreviews([]);
        }
    }, [value]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newImages = getImageData(event);
        
        if (newImages.length > 0) {
            // Replace all files (following the "Replace All" pattern)
            setPreviews(newImages);
            onChange(newImages.map(img => img.file));
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedPreviews = previews.filter((_, i) => i !== index);
        const updatedFiles = updatedPreviews.map(img => img.file);
        
        setPreviews(updatedPreviews);
        onChange(updatedFiles);
    };

    const handleClearAll = () => {
        // Clean up object URLs to prevent memory leaks
        previews.forEach(preview => URL.revokeObjectURL(preview.url));
        
        setPreviews([]);
        onChange([]);
        
        // Clear the input
        const input = document.getElementById(id) as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    const totalImages = previews.length + existingImageUrls.length;
    const hasImages = totalImages > 0;

    return (
        <div className="space-y-3">
            <FormLabel htmlFor={id} required={required}>
                {label}
            </FormLabel>
            
            {/* Upload Area */}
            <div className="space-y-4">
                <label
                    htmlFor={id}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <FeatherUploadCloud className="text-2xl text-brand-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                {hasImages ? 'Replace all images' : 'Upload images'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Click to browse or drag & drop multiple files
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Max {maxFiles} files • {accept}
                            </p>
                        </div>
                    </div>
                </label>
                
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Image Grid */}
            {hasImages && (
                <div className="space-y-3 !max-w-[97%]">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                            {totalImages} image{totalImages !== 1 ? 's' : ''} selected
                        </p>
                        {previews.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-xs text-red-600 hover:text-red-700 transition-colors"
                            >
                                Clear all new
                            </button>
                        )}
                    </div>
                    
                    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
                        {/* Existing Images */}
                        {existingImageUrls.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group">
                                <div 
                                    className="border border-border mx-auto rounded-md overflow-hidden bg-muted/30"
                                    style={{ height: resolvedSize }}
                                >
                                    <img 
                                        src={url} 
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                    <span className="text-white text-xs font-body font-bold">Current</span>
                                </div>
                            </div>
                        ))}
                        
                        {/* New Images */}
                        {previews.map((preview, index) => (
                            <div key={`new-${index}`} className="relative group">
                                <div 
                                    className="border border-border mx-auto rounded-md overflow-hidden bg-muted/30"
                                    style={{ height: resolvedSize }}
                                >
                                    <img 
                                        src={preview.url} 
                                        alt={`New ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <FeatherX className="w-3 h-3" />
                                </button>
                                
                                {/* File info overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="font-body font-bold clamp-2">{preview.file.name}</p>
                                    <p>{(preview.file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Summary */}
            {previews.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    {previews.length} new file{previews.length !== 1 ? 's' : ''} ready to upload
                </div>
            )}
        </div>
    );
}; 