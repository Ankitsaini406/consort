'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  className?: string;
}

/**
 * ClientWrapper ensures components only render on the client-side
 * Prevents hydration mismatches and provides consistent loading states
 */
export function ClientWrapper({ 
  children, 
  fallback, 
  errorFallback,
  className 
}: ClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      setIsMounted(true);
    } catch (error) {
      console.error('[CLIENT-WRAPPER] Mount error:', error);
      setHasError(true);
    }
  }, []);

  // Show error state if something went wrong
  if (hasError) {
    return (
      <div className={className}>
        {errorFallback || (
          <div className="flex items-center justify-center p-4 text-red-600">
            <div className="text-sm">Failed to load component</div>
          </div>
        )}
      </div>
    );
  }

  // Show loading state during SSR or before mount
  if (!isMounted) {
    return (
      <div className={className}>
        {fallback || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse bg-gray-200 rounded w-full h-8"></div>
          </div>
        )}
      </div>
    );
  }

  // Render children only after mounting (client-side)
  return <div className={className}>{children}</div>;
}

/**
 * Higher-order component for wrapping components that need client-side only rendering
 */
export function withClientWrapper<T extends {}>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
    className?: string;
  }
) {
  return function WrappedComponent(props: T) {
    return (
      <ClientWrapper 
        fallback={options?.fallback}
        errorFallback={options?.errorFallback}
        className={options?.className}
      >
        <Component {...props} />
      </ClientWrapper>
    );
  };
} 