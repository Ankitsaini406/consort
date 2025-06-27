export default function Loading() {
    return (
        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-center gap-12 bg-default-background pb-6 pt-2 overflow-auto mobile:container mobile:max-w-none mobile:flex-col mobile:flex-nowrap mobile:gap-6 mobile:pb-8 mobile:pt-0 mobile:px-0">
            <div className="flex w-full max-w-[1080px] grow shrink-0 basis-0 flex-col items-center gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
                <div className="flex w-full max-w-[1080px] flex-wrap items-start gap-14 flex-col lg:flex-row mobile:flex-row mobile:flex-wrap mobile:gap-6 mobile:px-2 mobile:pt-0 mobile:pb-2">
                    <div className="flex w-full max-w-[1080px] flex-wrap items-start gap-10 flex-col lg:flex-row px-6 mobile:flex-row mobile:flex-wrap mobile:gap-6 mobile:px-2 mobile:pt-0 mobile:pb-2">
                        {/* Product Image Skeleton */}
                        <div className="flex min-w-[240px] max-w-[448px] grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md bg-neutral-50 px-4 py-4 mobile:h-auto mobile:min-w-[240px] mobile:grow mobile:shrink-0 mobile:basis-0 mobile:self-stretch">
                            <div className="animate-pulse bg-neutral-200 rounded-md w-full h-[280px] mobile:h-[156px]"></div>
                        </div>
                        
                        {/* Product Details Skeleton */}
                        <div className="flex min-w-[240px] grow shrink-0 basis-0 flex-col items-start justify-center gap-4 self-stretch">
                            <div className="flex w-full flex-col items-start justify-center gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                                {/* Title Skeleton */}
                                <div className="animate-pulse bg-neutral-200 rounded h-8 w-3/4"></div>
                                
                                {/* Tags Skeleton */}
                                <div className="flex gap-2">
                                    <div className="animate-pulse bg-neutral-200 rounded-full h-6 w-16"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded-full h-6 w-20"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded-full h-6 w-14"></div>
                                </div>
                                
                                {/* Description Skeleton */}
                                <div className="space-y-2 w-full">
                                    <div className="animate-pulse bg-neutral-200 rounded h-4 w-full"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded h-4 w-5/6"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded h-4 w-4/6"></div>
                                </div>
                                
                                {/* Buttons Skeleton */}
                                <div className="flex gap-2 mt-4">
                                    <div className="animate-pulse bg-neutral-200 rounded h-10 w-24"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded h-10 w-24"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded h-10 w-32"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Industries Skeleton */}
                    <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-brand-border bg-default-background px-6 py-6 shadow-sm mt-3 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
                        <div className="flex w-full items-center justify-center gap-8 px-1 py-1 mobile:flex-row mobile:flex-wrap mobile:items-center mobile:justify-center mobile:gap-6 mobile:px-0 mobile:py-0">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="animate-pulse bg-neutral-200 rounded w-11 h-10"></div>
                                    <div className="animate-pulse bg-neutral-200 rounded h-3 w-16"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Brief Skeleton */}
                    <div className="grid w-full max-w-[1024px] px-6 pt-6 pb-2 gap-12 md:grid-cols-1 lg:grid-cols-[60%_auto] md:gap-8 mobile:px-2 mobile:py-6">
                        <div className="flex lg:max-w-full lg:w-full lg:max-w-[576px] flex-col items-start gap-6 mobile:h-auto mobile:w-auto mobile:flex-none">
                            <div className="animate-pulse bg-neutral-200 rounded h-6 w-32"></div>
                            <div className="animate-pulse bg-neutral-200 rounded h-px w-full"></div>
                            <div className="space-y-3 w-full">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-neutral-200 rounded h-4 w-full"></div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Key Features Skeleton */}
                        <div className="flex flex-col items-start gap-5 mobile:h-auto mobile:w-full mobile:flex-none mobile:px-0 mobile:pt-6 mobile:pb-0">
                            <div className="animate-pulse bg-neutral-200 rounded h-6 w-28"></div>
                            <div className="animate-pulse bg-neutral-200 rounded h-px w-full"></div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-neutral-200 rounded-md h-24 w-full"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Resources Skeleton */}
                    <div className="flex w-full flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 pt-4 pb-6 shadow-sm mobile:px-4 mobile:py-4">
                        <div className="animate-pulse bg-neutral-200 rounded h-5 w-32"></div>
                        <div className="flex gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-neutral-200 rounded h-10 w-24"></div>
                            ))}
                        </div>
                    </div>

                    {/* Company Logos Skeleton */}
                    <div className="flex w-full flex-col items-center gap-6 mobile:gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-8 shadow-sm mobile:px-4 mobile:py-5">
                        <div className="animate-pulse bg-neutral-200 rounded h-5 w-48"></div>
                        <div className="flex gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-neutral-200 rounded h-12 w-20"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 