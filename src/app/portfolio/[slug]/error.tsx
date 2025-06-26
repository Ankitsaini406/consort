'use client';

import { useEffect } from 'react';
import { Button3 } from '@/ui';
import { FeatherRefreshCw, FeatherHome } from '@subframe/core';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Product page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-default-background">
            <div className="max-w-md mx-auto text-center px-6">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-red-500 mb-4">⚠️</h1>
                    <h2 className="text-2xl font-semibold text-default-font mb-2">
                        Something went wrong!
                    </h2>
                    <p className="text-subtext-color mb-4">
                        We encountered an error while loading this product page.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <details className="text-left bg-neutral-100 p-4 rounded-md mb-4">
                            <summary className="cursor-pointer font-medium">Error Details</summary>
                            <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                                {error.message}
                            </pre>
                        </details>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button3
                        variant="brand-primary"
                        icon={<FeatherRefreshCw />}
                        onClick={reset}
                    >
                        Try Again
                    </Button3>
                    <Link href="/products">
                        <Button3
                            variant="neutral-secondary"
                            icon={<FeatherHome />}
                        >
                            Back to Products
                        </Button3>
                    </Link>
                </div>
            </div>
        </div>
    );
} 