import Link from 'next/link';
import { Button3 } from '@/ui';
import { FeatherArrowLeft, FeatherHome } from '@subframe/core';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-default-background">
            <div className="max-w-md mx-auto text-center px-6">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-consort-blue mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-default-font mb-2">
                        Product Not Found
                    </h2>
                    <p className="text-subtext-color mb-8">
                        The product you're looking for doesn't exist or may have been moved.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/products">
                        <Button3
                            variant="brand-primary"
                            icon={<FeatherArrowLeft />}
                        >
                            Back to Products
                        </Button3>
                    </Link>
                    <Link href="/">
                        <Button3
                            variant="neutral-secondary"
                            icon={<FeatherHome />}
                        >
                            Go Home
                        </Button3>
                    </Link>
                </div>
            </div>
        </div>
    );
} 