'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from "embla-carousel-autoplay";

interface Logo {
    src: string;
    alt: string;
}

interface SingleRowCompanyLogosProps {
    logos: Logo[];
    title?: string;
    delay?: number;
}

export default function SingleRowCompanyLogos({ 
    logos, 
    title = "Trusted by Industry Leaders",
    delay = 2100 
}: SingleRowCompanyLogosProps) {
    const [isClient, setIsClient] = useState(false);
    const [emblaRef] = useEmblaCarousel(
        { loop: true },
        [Autoplay({ delay, stopOnInteraction: false })]
    );

    // Ensure client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!logos || logos.length === 0) return null;

    // Conditional logic: static display for < 8 logos, carousel for >= 8
    const useCarousel = logos.length >= 8 && isClient;

    return (
        <div className="flex w-full flex-col items-center gap-6 mobile:gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-8 shadow-sm mobile:px-4 mobile:py-5">
            <span className="text-body-bold font-body-bold text-center leading-snug mobile:text-sm mobile:font-body">
                {title}
            </span>
            <div className="relative w-full overflow-hidden">
                {!useCarousel && (
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-3 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
                )}
                {!useCarousel && (
                    <div className="pointer-events-none absolute top-0 right-0 h-full w-3 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />
                )}
                
                {useCarousel ? (
                    // Carousel for 8+ logos
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-1 mobile:gap-4 items-center">
                            {logos.map((logo, index) => (
                                <div key={index} className="flex justify-center items-center flex-[0_0_auto] w-[13%] mobile:w-[20%]">
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        className="h-[60px] mobile:h-14 object-contain p-0.5 justify-items-center-safe grayscale hover:grayscale-0 opacity-65 hover:opacity-100 overflow-hidden rounded-sm"
                                    />
                                </div>
                            ))}
                            {/* Duplicate for seamless loop */}
                            {logos.map((logo, index) => (
                                <div key={`duplicate-${index}`} className="flex justify-center items-center flex-[0_0_auto] w-[13%] mobile:w-[15%]">
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        className="h-[60px] mobile:h-10 object-contain p-0.5 justify-items-center-safe grayscale hover:grayscale-0 opacity-65 hover:opacity-100 overflow-hidden rounded-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Static grid for < 8 logos
                    <div className="flex gap-10 mobile:gap-6 items-center justify-center flex-wrap">
                        {logos.map((logo, index) => (
                            <div key={index} className="flex justify-center items-center">
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    className="h-[60px] mobile:h-14 object-contain p-0.5 grayscale hover:grayscale-0 opacity-65 hover:opacity-100 overflow-hidden rounded-sm transition-all duration-300"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 