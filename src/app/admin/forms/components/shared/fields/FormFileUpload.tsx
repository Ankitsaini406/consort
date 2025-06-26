import React, { useState, useEffect } from 'react';
import { FeatherUploadCloud, FeatherCheckCircle, FeatherTrash, FeatherFile, FeatherImage, FeatherFileText, FeatherExternalLink } from "@subframe/core";
import { FormFileUploadProps } from '../../../types';
import { FormLabel } from './FormLabel';

// File upload state interface
interface FileUploadState {
    file: File;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
    id,
    label,
    accept,
    multiple = false,
    maxFiles = 1,
    value,
    onChange,
    onRemove,
    onExistingFileRemove,
    required = false,
    compact = false,
    existingFileUrls = [],
    existingFileNames = []
}) => {
    const [fileStates, setFileStates] = useState<FileUploadState[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [removedExistingFiles, setRemovedExistingFiles] = useState<Set<number>>(new Set());

    // Extract filename from URL
    const getFileNameFromUrl = (url: string, index: number): string => {
        if (existingFileNames[index]) {
            return existingFileNames[index];
        }

        try {
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            // Remove query parameters and decode
            const cleanFileName = decodeURIComponent(fileName.split('?')[0]);
            return cleanFileName || `File ${index + 1}`;
        } catch {
            return `File ${index + 1}`;
        }
    };

    // Get file type icon based on file extension
    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
            return <FeatherImage className="w-5 h-5 text-blue-500" />;
        }
        if (ext === 'pdf') {
            return <FeatherFileText className="w-5 h-5 text-red-500" />;
        }
        return <FeatherFile className="w-5 h-5 text-neutral-500" />;
    };

    // Simulate upload progress for a file
    const simulateUpload = (file: File) => {
        const newFileState: FileUploadState = { file, progress: 0, status: 'uploading' };

        setFileStates(prev => [...prev, newFileState]);

        // Simulate upload progress
        const interval = setInterval(() => {
            setFileStates(prev => prev.map(fs =>
                fs.file === file
                    ? { ...fs, progress: Math.min(fs.progress + 10, 100) }
                    : fs
            ));
        }, 100);

        // Complete upload after 1 second
        setTimeout(() => {
            clearInterval(interval);
            setFileStates(prev => prev.map(fs =>
                fs.file === file
                    ? { ...fs, progress: 100, status: 'complete' }
                    : fs
            ));
        }, 1000);
    };

    // Handle file selection
    const handleFileSelect = (files: File[]) => {
        const validFiles = multiple ? files.slice(0, maxFiles) : [files[0]];

        // Start upload simulation for each file
        validFiles.forEach(simulateUpload);

        // Call onChange with the files immediately (for form state)
        onChange(validFiles);
    };

    // Handle positional file replacement for array fields
    const handlePositionalReplace = (newFile: File, targetIndex: number) => {
        console.log(`[REPLACE] Replacing file at position ${targetIndex} with:`, newFile.name);
        
        // Get current files array
        const currentFiles = value ? (Array.isArray(value) ? value : [value]) : [];
        
        if (multiple) {
            // For multiple file fields (like gallery), replace at specific position
            const updatedFiles = [...currentFiles];
            
            if (targetIndex < updatedFiles.length) {
                // Replace existing file at target index
                updatedFiles[targetIndex] = newFile;
                console.log(`[REPLACE] Replaced file at index ${targetIndex}:`, updatedFiles.map(f => f.name));
            } else {
                // Add new file if target index is beyond current array
                updatedFiles.push(newFile);
                console.log(`[REPLACE] Added new file at index ${targetIndex}:`, updatedFiles.map(f => f.name));
            }
            
            // Start upload simulation for the new file
            simulateUpload(newFile);
            
            // Update form state with positioned replacement
            onChange(updatedFiles);
            
            // Mark existing file for removal (UI state only)
            handleRemoveExistingFile(targetIndex);
        } else {
            // For single file fields, simple replacement
            simulateUpload(newFile);
            onChange([newFile]);
            
            // Mark existing file for removal if it exists
            if (existingFileUrls.length > 0) {
                handleRemoveExistingFile(0);
            }
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFileSelect(files);
        }
    };

    // Handle drag events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFileSelect(droppedFiles);
    };

    // Handle new file removal with positional array support
    const handleRemoveFile = (index: number) => {
        console.log(`[REMOVE] Removing new file at index ${index}`);
        
        // Remove from fileStates
        setFileStates(prev => prev.filter((_, i) => i !== index));
        
        // Update form value array by removing at specific index
        const currentFiles = value ? (Array.isArray(value) ? value : [value]) : [];
        if (multiple && currentFiles.length > index) {
            const updatedFiles = currentFiles.filter((_, i) => i !== index);
            onChange(updatedFiles);
            console.log(`[REMOVE] Updated files array:`, updatedFiles.map(f => f.name));
        } else if (!multiple) {
            onChange([]);
        }
        
        // Notify parent component
        if (onRemove) {
            onRemove(index);
        }
    };

    // Handle existing file removal
    const handleRemoveExistingFile = (index: number) => {
        setRemovedExistingFiles(prev => new Set([...prev, index]));
        // Notify parent component about existing file removal
        if (onExistingFileRemove) {
            onExistingFileRemove(index);
        }
    };

    // Get visible existing files (not removed)
    const getVisibleExistingFiles = () => {
        return existingFileUrls.filter((_, index) => !removedExistingFiles.has(index));
    };

    // Sync fileStates with external value changes
    useEffect(() => {
        const currentFiles = value ? (Array.isArray(value) ? value : [value]) : [];

        // Update fileStates to match external value, preserving upload progress for new files
        setFileStates(prevStates => {
            const newStates = currentFiles.map((file, index) => {
                // Check if this file is already being tracked
                const existingState = prevStates.find(state => 
                    state.file === file || 
                    (state.file.name === file.name && state.file.size === file.size)
                );
                
                if (existingState) {
                    // Preserve existing upload state
                    return existingState;
                } else {
                    // New file - check if it's a fresh upload or completed
                    const isNewUpload = prevStates.some(state => 
                        state.file.name === file.name && 
                        state.file.size === file.size && 
                        state.status === 'uploading'
                    );
                    
                    return {
                        file,
                        progress: isNewUpload ? 0 : 100,
                        status: (isNewUpload ? 'uploading' : 'complete') as 'uploading' | 'complete' | 'error'
                    };
                }
            });
            
            return newStates;
        });
    }, [value]);

    const visibleExistingFiles = getVisibleExistingFiles();
    const hasExistingFiles = visibleExistingFiles.length > 0;

    return (
        <div className="flex flex-col gap-2 w-full">
            <FormLabel htmlFor={id} required={required}>{label}</FormLabel>

            {/* Show existing files */}
            {hasExistingFiles && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Files:</p>
                    {visibleExistingFiles.map((url, visibleIndex) => {
                        // Get original index to maintain correct mapping
                        const originalIndex = existingFileUrls.indexOf(url);
                        const fileName = getFileNameFromUrl(url, originalIndex);
                        return (
                            <div key={originalIndex} className={`${compact ? 'p-2' : 'p-3'} border border-green-200 rounded-sm bg-green-50 shadow-sm`}>
                                <div className="flex items-center gap-3">
                                    {getFileIcon(fileName)}
                                    <div className="flex-1 min-w-0">
                                        <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-green-700 truncate`}>
                                            {fileName}
                                        </p>
                                        <p className="text-xs text-green-600">Existing file</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => window.open(url, '_blank')}
                                            className="p-1 hover:bg-green-100 rounded-sm transition-colors flex-shrink-0 flex items-center gap-1"
                                            title="Open file in new tab"
                                        >
                                            <FeatherExternalLink className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-green-600 hidden sm:inline">View</span>
                                        </button>
                                        <label
                                            htmlFor={`${id}-replace-${originalIndex}`}
                                            className="p-1 hover:bg-blue-100 rounded-sm transition-colors flex-shrink-0 flex items-center gap-1 cursor-pointer"
                                            title="Replace this file"
                                        >
                                            <FeatherUploadCloud className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs text-blue-600 hidden sm:inline">Replace</span>
                                        </label>
                                        <input
                                            type="file"
                                            id={`${id}-replace-${originalIndex}`}
                                            accept={accept}
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const newFile = e.target.files[0];
                                                    // Use positional replace logic for precise array mapping
                                                    handlePositionalReplace(newFile, originalIndex);
                                                    // Clear the input for future use
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="hidden"
                                            tabIndex={-1}
                                        />
                                        <button
                                            onClick={() => handleRemoveExistingFile(originalIndex)}
                                            className="p-1 hover:bg-red-100 rounded-sm transition-colors flex-shrink-0"
                                            title="Remove this file"
                                        >
                                            <FeatherTrash className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Show count of removed files */}
            {removedExistingFiles.size > 0 && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-sm border border-orange-200">
                    <p>{removedExistingFiles.size} existing file{removedExistingFiles.size > 1 ? 's' : ''} will be {fileStates.length > 0 ? 'replaced' : 'removed'} upon saving.</p>
                </div>
            )}

            {/* Hidden file input - never focusable */}
            <input
                type="file"
                id={id}
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                className="hidden"
                tabIndex={-1}
            />

            {/* Clickable drop zone */}
            <label
                htmlFor={id}
                className={`block border-2 border-dashed bg-neutral-50 rounded-sm shadow-sm ${compact ? 'p-3' : 'p-4'} text-center transition-all duration-200 cursor-pointer ${isDragging
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-input hover:border-brand-400 hover:bg-brand-50 bg-background'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {compact ? (
                    <div className="flex items-center gap-3 justify-center">
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                            <FeatherUploadCloud className="w-4 h-4 text-brand-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-body font-medium text-foreground">
                                {isDragging ? 'Drop here' : hasExistingFiles ? (multiple ? 'Add files' : 'Replace file') : 'Upload files'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag & drop or click
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <FeatherUploadCloud className="text-2xl text-brand-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {isDragging ? 'Drop files here' : hasExistingFiles ? (multiple ? 'Add more files' : 'Replace file') : 'Upload files'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag and drop or click to browse
                            </p>
                            {accept && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Accepts: {accept}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </label>

            {fileStates.length > 0 && (
                <div className="space-y-2">
                    {fileStates.map((fileState, index) => (
                        <div key={index} className={`${compact ? 'p-2' : 'p-3'} border border-border rounded-sm bg-background shadow-sm`}>
                            <div className={`flex items-center gap-3 ${compact ? 'mb-0' : 'mb-0'}`}>
                                {getFileIcon(fileState.file.name)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-foreground truncate`}>{fileState.file.name}</p>
                                        {fileState.status === 'complete' && (
                                            <FeatherCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        )}
                                        {multiple && (
                                            <span className="text-xs text-muted-foreground bg-muted px-1 rounded">#{index + 1}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{(fileState.file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                {fileState.status === 'complete' && (
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="p-1 hover:bg-muted rounded-sm transition-colors flex-shrink-0"
                                    >
                                        <FeatherTrash className="w-4 h-4 text-red-500" />
                                    </button>
                                )}
                            </div>

                            {fileState.status === 'uploading' && (
                                <div className={`w-full bg-muted rounded-full ${compact ? 'h-1' : 'h-2'}`}>
                                    <div
                                        className={`bg-brand-600 ${compact ? 'h-1' : 'h-2'} rounded-full transition-all duration-300`}
                                        style={{ width: `${fileState.progress}%` }}
                                    />
                                </div>
                            )}

                            {fileState.status === 'error' && (
                                <div className="flex items-center gap-1 text-red-600">
                                    <span className="text-xs">Upload failed</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 