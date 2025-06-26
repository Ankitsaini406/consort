import React, { useState, ChangeEvent } from 'react';
import { FeatherUploadCloud, FeatherX } from "@subframe/core";
import { FormLabel } from './FormLabel';

// Size presets for common use cases
export const IMAGE_SIZE_PRESETS = {
    small: 80,
    medium: 120,
    large: 160,
    xlarge: 200,
    xxlarge: 240
} as const;

export type ImageSizePreset = keyof typeof IMAGE_SIZE_PRESETS;

interface FormImageUploadProps {
    id: string;
    label: string;
    accept?: string;
    value?: File | null;
    onChange: (file: File | null) => void;
    required?: boolean;
    existingImageUrl?: string;
    placeholder?: string;
    imageSize?: number | ImageSizePreset; // Size in pixels or preset name
}

function getImageData(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
        return { file: null, displayUrl: "" };
    }

    const file = event.target.files[0];
    const displayUrl = URL.createObjectURL(file);
    return { file, displayUrl };
}

export const FormImageUpload: React.FC<FormImageUploadProps> = ({
    id,
    label,
    accept = "image/*",
    value,
    onChange,
    required = false,
    existingImageUrl,
    placeholder,
    imageSize = "medium"
}) => {
    const [preview, setPreview] = useState<string>(existingImageUrl || "");

    // Resolve size to number
    const resolvedSize = typeof imageSize === 'string' ? IMAGE_SIZE_PRESETS[imageSize] : imageSize;

    // Regenerate preview URL when value changes (e.g., coming back from other steps)
    React.useEffect(() => {
        if (value && value instanceof File) {
            // Create new preview URL from the File object
            const newPreviewUrl = URL.createObjectURL(value);
            setPreview(newPreviewUrl);
            
            // Cleanup function to revoke the URL when component unmounts or value changes
            return () => URL.revokeObjectURL(newPreviewUrl);
        } else if (!value && existingImageUrl) {
            // No new file, fall back to existing image URL
            setPreview(existingImageUrl);
        } else if (!value) {
            // No file and no existing image
            setPreview("");
        }
    }, [value, existingImageUrl]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { file, displayUrl } = getImageData(event);
        
        if (file) {
            setPreview(displayUrl);
            onChange(file);
        }
    };

    const handleRemove = () => {
        setPreview(existingImageUrl || "");
        onChange(null);
        
        // Clear the input
        const input = document.getElementById(id) as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    const hasImage = preview || value;

    return (
        <div className="space-y-3">
            <FormLabel htmlFor={id} required={required}>
                {label}
            </FormLabel>
            
            <div className="flex items-center gap-4">
                {/* Image Preview */}
                <div className="relative">
                    <div 
                        className="border-2 border-dashed border-border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center"
                        style={{ width: resolvedSize, height: resolvedSize }}
                    >
                        {preview ? (
                            <img 
                                src={preview} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-muted-foreground font-medium text-sm">
                                {placeholder || "IMG"}
                            </span>
                        )}
                    </div>
                    
                    {/* Remove button for uploaded images */}
                    {hasImage && value && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                            <FeatherX className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor={id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-sm cursor-pointer transition-colors"
                    >
                        <FeatherUploadCloud className="w-4 h-4" />
                        {hasImage ? 'Replace Image' : 'Upload Image'}
                    </label>
                    
                    <input
                        id={id}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    
                    {accept && (
                        <p className="text-xs text-muted-foreground">
                            Accepts: {accept.split(',').join(', ')}
                        </p>
                    )}
                </div>
            </div>
            
            {/* File info */}
            {value && (
                <div className="text-xs text-muted-foreground">
                    {value.name} • {(value.size / 1024).toFixed(1)} KB
                </div>
            )}
        </div>
    );
}; 