'use client';

import { useEffect, useRef, useState } from 'react';
import './scroll-animations.css';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: 0 | 0.1 | 0.25 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6;
    highlightIndex?: number;
    className?: string;
    immediate?: boolean; // ✅ For above-the-fold content
}

export default function ScrollReveal({ 
    children, 
    delay = 0, 
    highlightIndex,
    className = "",
    immediate = false // ✅ For above-the-fold content
}: ScrollRevealProps) {
    const [isClient, setIsClient] = useState(false);
    const [isVisible, setIsVisible] = useState(immediate); // ✅ Start visible if immediate
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !elementRef.current || immediate) return; // ✅ Skip observer for immediate animations

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '-25% 0px -25% 0px' // Matches framer-motion viewport margin
            }
        );

        observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, [isClient, immediate]); // ✅ Add immediate to dependencies

    // Generate delay class based on delay prop or highlight index
    const getDelayClass = () => {
        if (highlightIndex !== undefined) {
            return `scroll-reveal-highlight-${Math.min(highlightIndex, 5)}`;
        }
        
        // Convert delay number to class name
        const delayMap = {
            0: 'scroll-reveal-0',
            0.1: 'scroll-reveal-1', 
            0.25: 'scroll-reveal-25',
            0.2: 'scroll-reveal-2',
            0.3: 'scroll-reveal-3',
            0.4: 'scroll-reveal-4',
            0.5: 'scroll-reveal-5',
            0.6: 'scroll-reveal-6'
        };
        
        return delayMap[delay] || 'scroll-reveal-0';
    };

    // ✅ IMPROVED: For immediate animations, start with animate class even during SSR
    if (!isClient) {
        return (
            <div className={`${immediate ? `scroll-reveal ${getDelayClass()} animate` : ''} ${className}`}>
                {children}
            </div>
        );
    }

    return (
        <div
            ref={elementRef}
            className={`scroll-reveal ${getDelayClass()} ${isVisible ? 'animate' : ''} ${className}`}
        >
            {children}
        </div>
    );
} 