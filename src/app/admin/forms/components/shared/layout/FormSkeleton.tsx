import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SkeletonText } from '@/ui/components/SkeletonText';
import { SkeletonCircle } from '@/ui/components/SkeletonCircle';

interface FormSkeletonProps {
    showSidebar?: boolean;
    fieldCount?: number;
    formTitle?: string;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({ 
    showSidebar = true, 
    fieldCount = 6,
    formTitle = "Loading form..."
}) => {
    return (
        <div className="flex h-[calc(100vh-100px)] w-full bg-gray-50">
            {/* Sidebar Skeleton */}
            {showSidebar && (
                <div className="min-w-[300px] w-64 p-6 border-r bg-neutral-50 min-h-full flex flex-col">
                    <div className="px-1 pt-3 pb-4 border-b mb-10 ml-1">
                        <SkeletonText size="subheader" className="w-3/4" />
                    </div>
                    <div className="flex-grow space-y-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center gap-3 p-3">
                                <SkeletonCircle size="small" />
                                <SkeletonText size="default" className="flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Skeleton */}
            <div className="flex-1">
                <Card className="h-full p-3 flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-xl">
                            <SkeletonText size="section-header" className="w-1/2" />
                        </CardTitle>
                        <SkeletonText size="default" className="w-1/3 mt-2" />
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-hidden p-6">
                        <div className="h-full flex flex-col">
                            {/* Step Title Skeleton */}
                            <div className="mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
                                <SkeletonText size="subheader" className="w-2/5 mb-2" />
                                <SkeletonText size="label" className="w-3/5" />
                            </div>
                            
                            {/* Form Fields Skeleton */}
                            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                                {Array.from({ length: fieldCount }).map((_, index) => (
                                    <div key={index} className={`col-span-${Math.random() > 0.5 ? '2' : '4'}`}>
                                        <SkeletonText size="label" className="w-1/3 mb-2" />
                                        <SkeletonText size="default" className="w-full h-10" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex-shrink-0 border-t">
                        <div className="w-full flex justify-between">
                            <SkeletonText size="default" className="w-20 h-10" />
                            <SkeletonText size="default" className="w-20 h-10" />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

// Simplified version for smaller loading areas
export const MiniFormSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="space-y-4 p-4">
        {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="space-y-2">
                <SkeletonText size="label" className="w-1/4" />
                <SkeletonText size="default" className="w-full" />
            </div>
        ))}
    </div>
); 