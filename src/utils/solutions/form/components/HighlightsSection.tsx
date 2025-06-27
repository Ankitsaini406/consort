"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { SolutionHighlight, PhotoInfo } from '../types';

interface HighlightsSectionProps {
    highlights: SolutionHighlight[];
    onHighlightChange: (index: number, field: keyof SolutionHighlight, value: string | PhotoInfo[]) => void;
    onAddHighlight: () => void;
    onRemoveHighlight: (index: number) => void;
    onRemovePhoto: (highlightIndex: number, photoIndex: number) => void;
}

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({
    highlights,
    onHighlightChange,
    onAddHighlight,
    onRemoveHighlight,
    onRemovePhoto
}) => {
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const handleAddHighlight = () => {
        onAddHighlight();
        setLastAddedId(`${highlights.length + 1}`);
        setTimeout(() => setLastAddedId(null), 1000);
    };

    const handleInputChange = (index: number, field: keyof SolutionHighlight, value: string | PhotoInfo[]) => {
        onHighlightChange(index, field, value);
    };

    // Check if the last highlight has empty required fields
    const isAddButtonDisabled = highlights.length > 0 && (
        !highlights[highlights.length - 1].title.trim() ||
        !highlights[highlights.length - 1].description.trim()
    );

    return (
        <div className="w-full space-y-6">
            {highlights.map((highlight, index) => (
                <div
                    key={`highlight-${index}`}
                    className={`relative rounded-lg border bg-card p-6 ${highlight.title === lastAddedId ? 'animate-highlight-new' : ''
                        }`}
                >
                    <div className="absolute right-4 top-4">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemoveHighlight(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Enter highlight title"
                                value={highlight.title}
                                onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                                required
                            />
                            {!highlight.title.trim() && (
                                <p className="text-red-500 text-sm mt-1">Title is required</p>
                            )}
                        </div>

                        <div className='flex gap-4'>
                            <div className='w-3/4'>
                            <label className="text-sm font-medium mb-2 block">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="Enter highlight description"
                                value={highlight.description}
                                onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                className="min-h-[100px]"
                                required
                                />
                            {!highlight.description.trim() && (
                                <p className="text-red-500 text-sm mt-1">Description is required</p>
                            )}
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Photos
                                </label>
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id={`highlight-${index}-photos`}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                const fileData: PhotoInfo[] = files.map(file => ({
                                                    name: file.name,
                                                    url: URL.createObjectURL(file)
                                                }));
                                                handleInputChange(index, 'photos', fileData);
                                            }}
                                        />
                                        <label
                                            htmlFor={`highlight-${index}-photos`}
                                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                                        >
                                            Click to upload photos
                                        </label>
                                    </div>
                                    {highlight.photos.length > 0 && (
                                        <div className="grid gap-2">
                                            {highlight.photos.map((photo, photoIndex) => (
                                                <div 
                                                    key={photoIndex} 
                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                                                >
                                                    <span className="text-sm text-gray-600">
                                                        {photo.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemovePhoto(index, photoIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddHighlight}
                disabled={isAddButtonDisabled}
            >
                <Plus className="h-4 w-4 mr-2" />
                {isAddButtonDisabled
                    ? "Please fill in the required fields first"
                    : "Add New Highlight"
                }
            </Button>
        </div>
    );
}; 