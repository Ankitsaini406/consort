"use client";

import { useState } from 'react';
import { FormImageUpload, IMAGE_SIZE_PRESETS } from '../../components/shared/fields/FormImageUpload';
import { FormImageGallery, GALLERY_SIZE_PRESETS } from '../../components/shared/fields/FormImageGallery';

export default function ImageUploadDemo() {
    // Single image upload state
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [logoImage, setLogoImage] = useState<File | null>(null);
    
    // Multi-image gallery state
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    
    // Mock existing images for demo
    const existingProfileUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
    const existingGalleryUrls = [
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop"
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', {
            profileImage,
            logoImage,
            galleryImages
        });
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">Image Upload Components Demo</h1>
                    <p className="text-muted-foreground">
                        Showcasing single image upload and multi-image gallery components with full size control
                    </p>
                </div>

                {/* Usage Guide */}
                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">📏 Size Control Options</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-foreground mb-2">Single Image Presets</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                                {Object.entries(IMAGE_SIZE_PRESETS).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span>"{key}"</span>
                                        <span>{value}px</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-medium text-foreground mb-2">Gallery Image Presets</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                                {Object.entries(GALLERY_SIZE_PRESETS).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span>"{key}"</span>
                                        <span>{value}px</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                        <p><strong>Usage:</strong> Use preset names like <code>imageSize="large"</code> or custom pixel values like <code>imageSize={200}</code></p>
                        <p><strong>Grid Columns:</strong> Gallery supports 2-6 columns with <code>gridCols={4}</code></p>
                        <p><strong>UI:</strong> Single image upload now uses simple button interface with preview on the left</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Single Image Uploads */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                            Single Image Uploads (Simplified Button UI)
                        </h2>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <FormImageUpload
                                id="profile-image"
                                label="Profile Picture (Large Preset)"
                                value={profileImage}
                                onChange={setProfileImage}
                                existingImageUrl={existingProfileUrl}
                                placeholder="PIC"
                                imageSize="large"
                                required
                            />
                            
                            <FormImageUpload
                                id="logo-image"
                                label="Company Logo (Medium Preset)"
                                value={logoImage}
                                onChange={setLogoImage}
                                placeholder="LOGO"
                                imageSize="medium"
                                accept="image/png,image/svg+xml,image/jpeg"
                            />
                            
                            <FormImageUpload
                                id="avatar-image"
                                label="Avatar (Custom 200px)"
                                value={null}
                                onChange={() => {}}
                                placeholder="AVT"
                                imageSize={200}
                            />
                        </div>
                    </div>

                    {/* Multi-Image Gallery */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                            Multi-Image Gallery
                        </h2>
                        
                        <div className="space-y-8">
                            <FormImageGallery
                                id="product-gallery-large"
                                label="Product Gallery (Large Preset, 3 columns)"
                                value={galleryImages}
                                onChange={setGalleryImages}
                                maxFiles={12}
                                existingImageUrls={existingGalleryUrls}
                                imageSize="large"
                                gridCols={3}
                                required
                            />
                            
                            <FormImageGallery
                                id="product-gallery-medium"
                                label="Product Gallery (Medium Preset, 4 columns)"
                                value={[]}
                                onChange={() => {}}
                                maxFiles={12}
                                existingImageUrls={existingGalleryUrls.slice(0, 4)}
                                imageSize="medium"
                                gridCols={4}
                            />
                            
                            <FormImageGallery
                                id="product-gallery-small"
                                label="Product Gallery (Small Preset, 6 columns)"
                                value={[]}
                                onChange={() => {}}
                                maxFiles={12}
                                existingImageUrls={existingGalleryUrls.slice(0, 6)}
                                imageSize="small"
                                gridCols={6}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
                        >
                            Submit Form
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => {
                                setProfileImage(null);
                                setLogoImage(null);
                                setGalleryImages([]);
                            }}
                            className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                        >
                            Reset All
                        </button>
                    </div>

                    {/* Debug Info */}
                    <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-medium mb-2">Current State (Debug)</h3>
                        <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify({
                                profileImage: profileImage ? { name: profileImage.name, size: profileImage.size } : null,
                                logoImage: logoImage ? { name: logoImage.name, size: logoImage.size } : null,
                                galleryImages: galleryImages.map(f => ({ name: f.name, size: f.size }))
                            }, null, 2)}
                        </pre>
                    </div>
                </form>
            </div>
        </div>
    );
} 