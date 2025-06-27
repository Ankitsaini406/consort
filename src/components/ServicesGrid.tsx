"use client";

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from "framer-motion";
import SingleRowCompanyLogos from './SingleRowCompanyLogos';
import { Button3 } from '@/ui/components/Button3';
import { FeatherArrowRight } from '@subframe/core';
import type { ServiceConfig } from '@/config/servicesConfig';
import SafeImage from './SafeImage';

// Using unified service configuration
type Service = ServiceConfig;

// Props interface for static data passing
interface ServicesGridProps {
    services: ServiceConfig[];
}

// Company logos data
const companyLogos = [
    { src: "/logos/ESSAR.jpg", alt: "ESSAR" },
    { src: "/logos/OPAL.webp", alt: "OPAL" },
    { src: "/logos/Suzuki.webp", alt: "Suzuki" },
    { src: "/logos/BARC.webp", alt: "BARC" },
    { src: "/logos/adani.webp", alt: "Adani" },
    { src: "/logos/Shell.webp", alt: "Shell" },
    { src: "/logos/Tata.webp", alt: "Tata" },
    { src: "/logos/jsw.png", alt: "JSW" },
    { src: "/logos/Nayara.webp", alt: "Nayara" },
    { src: "/logos/alstom1.png", alt: "Alstom" },
    { src: "/logos/nagpur.jpg", alt: "Nagpur Metro" },
    { src: "/logos/siemens1.png", alt: "Siemens" },
    { src: "/logos/ongc.jpg", alt: "ONGC" },
    { src: "/logos/crrc2.png", alt: "CRRC" },
    { src: "/logos/mmrda.webp", alt: "MMRDA" },
    { src: "/logos/mauritiusmetro.webp", alt: "Mauritius Metro" },
    { src: "/logos/noida.svg", alt: "Noida Metro" },
    { src: "/logos/caf.png", alt: "CAF" },
];

// Services data will be passed as props for SSG

// Service Card Component with Performance Optimizations
const ServiceCard: React.FC<{ service: Service; index: number }> = React.memo(({ service, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"],
    });

    // Create a subtle swirl movement based on scroll and card index
    const swirlY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const swirlRotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

    return (
        <Link href={`/services/${service.slug}`} className="block">
            <div
                ref={cardRef}
                className={`
                    group relative overflow-hidden rounded-2xl cursor-pointer h-80
                    transition-all duration-500 ease-out
                    ${isHovered
                        ? 'bg-white shadow-2xl shadow-consort-blue/20 border border-consort-blue/20'
                        : 'bg-gradient-to-br from-consort-blue via-consort-blue to-consort-blue/90 shadow-lg hover:shadow-xl'
                    }
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    animationDelay: `${index * 150}ms`,
                }}
            >
            {/* Background Swirl Image */}
            <motion.div
                style={{
                    y: swirlY,
                    rotate: swirlRotate,
                }}
                className={`absolute inset-0 z-10 transition-opacity duration-500 ${isHovered ? 'opacity-5' : 'opacity-15'}`}
            >
                <SafeImage
                    src="/bg-swirl.png"
                    alt="Background swirl"
                    fill
                    className="object-cover"
                    priority={index <= 2}
                    loading={index > 2 ? 'lazy' : 'eager'}
                />
            </motion.div>

            {/* Subtle pattern overlay for additional texture */}
            <div className={`absolute inset-0 opacity-5 transition-opacity duration-500 z-15 ${isHovered ? 'opacity-0' : 'opacity-10'}`}>
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col justify-end p-6 z-20">

                {/* Default Content - Title & Subtitle (Bottom Aligned) */}
                <div className={`transition-all duration-400 ease-out ${isHovered ? 'opacity-0 transform translate-y-3 pointer-events-none' : 'opacity-100 transform translate-y-0'}`}>
                    <h3 className="text-heading-4 font-heading-4 text-white mb-3 leading-tight">
                        {service.title}
                    </h3>
                    <p className="text-caption font-caption text-white/90 leading-relaxed">
                        {service.subtitle}
                    </p>
                </div>

                {/* Hover Content - Benefits */}
                <div className={`absolute inset-6 flex flex-col justify-center transition-all duration-400 ease-out ${isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-6 pointer-events-none'}`}>
                    <div className="text-left mb-3">
                        <h3 className="text-body-lg font-body text-left text-consort-blue mb-2 leading-tight">
                            {service.title}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {service.benefits.map((benefit, benefitIndex) => (
                            <motion.div
                                key={benefitIndex}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -10 }}
                                animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                transition={{
                                    duration: 0.3,
                                    delay: isHovered ? benefitIndex * 0.1 : 0,
                                    ease: "easeOut"
                                }}
                            >
                                <div className="w-2 h-2 rounded-full bg-consort-blue mr-3 mt-1.5 flex-shrink-0"></div>
                                <span className="text-caption font-caption text-subtext-color leading-relaxed">
                                    {benefit}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Corner Number Indicator */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-caption-bold font-caption-bold transition-all duration-400 ${isHovered ? 'bg-consort-blue/10 text-consort-blue' : 'bg-white/20 text-white'}`}>
                    {String(index + 1).padStart(2, '0')}
                </div>

                {/* Bottom Gradient Border */}
                <div className={`absolute bottom-0 left-0 right-0 bg-transparent h-1 transition-all duration-400 ${isHovered ? 'bg-gradient-to-r from-consort-blue via-consort-red to-consort-blue' : ''}`}></div>
            </div>

            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${isHovered ? 'shadow-inner' : ''}`}></div>
            </div>
        </Link>
    );
});

// Main ServicesGrid Component
const ServicesGrid: React.FC<ServicesGridProps> = ({ services }) => {
    // Memoize services for performance
    const memoizedServices = useMemo(() => services, [services]);
    return (
        <section className="w-full py-12" role="main" aria-labelledby="services-heading">
            <div className="max-w-[1024px] mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-6 text-center mb-16">
                    <div>

                        <h2
                            id="services-heading"
                            className="lg:text-heading-2 md:text-heading-2-md mobile:text-heading-2-sm font-heading-2 text-consort-blue mb-6"
                        >
                            Mission Critical Services
                        </h2>
                        <p className="max-w-[768px] mx-auto lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm font-body-xl text-subtext-color leading-relaxed">
                            From initial design to ongoing support, we provide end-to-end communication solutions tailored to your mission-critical requirements
                        </p>
                    </div>
                    {/* Hero Buttons */}
                    <div className="px-1 flex flex-wrap items-start gap-4 pt-2 mobile:px-0">
                        <Button3
                            variant="destructive-primary"
                            iconRight={<FeatherArrowRight />}
                            // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
                        >
                            Speak to Expert
                        </Button3>
                        <Button3
                            variant="destructive-secondary"
                            iconRight={<FeatherArrowRight />}
                            // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
                        >
                            Our Portfolio
                        </Button3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mobile:gap-6">
                    {memoizedServices.map((service: ServiceConfig, index: number) => (
                        <ServiceCard key={service.id} service={service} index={index} />
                    ))}
                </div>

                {/* Elegant bottom section */}
                <div className="text-center mt-20">

                </div>
                <SingleRowCompanyLogos logos={companyLogos} title="Trusted Across by Industry Leaders" delay={2100} />
            </div>
        </section>
    );
};

export default ServicesGrid;
; 