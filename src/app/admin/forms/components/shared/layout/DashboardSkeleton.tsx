import React from 'react';
import { SkeletonText } from '@/ui/components/SkeletonText';
import { SkeletonCircle } from '@/ui/components/SkeletonCircle';

export const DashboardSkeleton: React.FC = () => {
    return (
        <main className="bg-neutral-100">
            <div className="flex w-full max-w-[1280px] mx-auto h-screen flex-col justify-between">
                <div className="flex flex-col grow gap-8 pt-8">
                    {/* Header Skeleton */}
                    <div className="flex w-full items-center gap-1 p-6">
                        <div className="flex grow flex-col items-center">
                            <div className="w-full mb-2">
                                <SkeletonText size="header" className="w-1/3" />
                            </div>
                            <div className="pl-0.5 w-full">
                                <SkeletonText size="subheader" className="w-1/2" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <SkeletonText size="default" className="w-20 h-10" />
                            <div className="h-[24px] w-[1px] mx-2 bg-neutral-300" />
                            <SkeletonText size="default" className="w-32 h-8" />
                        </div>
                    </div>

                    {/* Dashboard Cards Skeleton */}
                    <div className="flex w-full flex-wrap gap-4">
                        {[1, 2, 3, 4].map((card) => (
                            <div
                                key={card}
                                className="flex min-h-[280px] grow flex-col items-start justify-between gap-6 self-stretch rounded-2xl bg-default-background px-8 py-8 shadow-md"
                            >
                                <div className="flex w-full gap-4">
                                    <div className="flex flex-col gap-3 px-1 py-1 w-full">
                                        <SkeletonText size="section-header" className="w-2/3" />
                                        <div className="flex flex-col gap-3">
                                            {[1, 2, 3].map((stat) => (
                                                <div key={stat} className="flex items-center gap-2">
                                                    <SkeletonText size="default" className="w-1/2" />
                                                    <SkeletonCircle size="x-small" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pl-2.5">
                                    <SkeletonText size="default" className="w-20 h-8 rounded-3xl" />
                                    <SkeletonText size="default" className="w-24 h-8 rounded-3xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="flex w-full items-center justify-between p-3">
                    <SkeletonText size="label" className="w-1/3" />
                    <SkeletonText size="default" className="w-24 h-8" />
                </div>
            </div>
        </main>
    );
}; 