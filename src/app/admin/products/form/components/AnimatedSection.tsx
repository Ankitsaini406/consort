'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedSectionProps {
    children: React.ReactNode;
    isNew?: boolean;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, isNew = false }) => {
    const [shouldAnimate, setShouldAnimate] = useState(isNew);

    useEffect(() => {
        if (isNew) {
            setShouldAnimate(true);
            const timer = setTimeout(() => {
                setShouldAnimate(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isNew]);

    return (
        <div
            className={`transition-all duration-[2000ms] ease-out rounded-md ${
                shouldAnimate 
                    ? 'bg-brand-100/30' 
                    : 'bg-default-background'
            }`}
        >
            {children}
        </div>
    );
}; 