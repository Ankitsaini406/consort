"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Autoplay from "embla-carousel-autoplay";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import { advance } from '@/data/home-data';

export default function HeroCarousel() {
  return (
    <motion.div
      className="relative w-full max-w-[1280px] flex flex-wrap items-start justify-center gap-6"
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.9,
        delay: 2,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {/* Left fade overlay */}
      <div className="pointer-events-none absolute top-0 left-0 h-full -ml-0.5 w-20 bg-fade-left-white z-10 hidden sm:block" />
      {/* Right fade overlay */}
      <div className="pointer-events-none absolute top-0 right-0 h-full -mr-0.5 w-20 bg-fade-right-white z-10 hidden sm:block" />

      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[Autoplay({
          delay: 4000,
        })]}
        className="w-full"
      >
        <CarouselContent className="-ml-8 py-8">
          {advance.map((logo, index) => {
            // Validate image src to prevent URL construction errors
            const validSrc = logo.src && (logo.src.startsWith('http') || logo.src.startsWith('/'))
              ? logo.src
              : '/icons/Placeholder.png';

            return (
              <CarouselItem key={index} className="pl-8 md:flex-[0_0_75%] mobile:flex-[0_0_100%] ">
                <div className="relative flex min-w-[250px] grow shrink-0 basis-0 flex-col items-center self-stretch overflow-hidden rounded-md bg-default-background shadow-a1 h-[512px] mobile:h-80">
                  <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    src={validSrc}
                    alt={logo.alt || `Image for ${logo.title}`}
                    fill
                    priority={index === 0} // Prioritize loading the first image
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-4 left-5 z-10 flex w-auto flex-col items-start gap-4 lg:px-5 lg:py-6 md:p-6 mobile:p-3 backdrop-blur-sm rounded-md [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1.0)_70%,rgba(0,0,0,0)_100%)]">
                    <Image 
                      src="https://firebasestorage.googleapis.com/v0/b/consortdigital-327d9.firebasestorage.app/o/Consort-White.svg?alt=media&token=2f14f3da-12bc-48d2-b4d9-1692c5c0208f"
                      alt="Consort Logo" 
                      width={120} 
                      height={100}
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDEyMHYxMDBIMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4="
                      placeholder="blur"
                      loading="eager"
                    />
                  </div>
                  <div className="absolute bottom-4 left-5 z-10 flex w-auto flex-col items-start gap-4 lg:px-9 lg:py-6 md:p-6 backdrop-blur-sm rounded-lg [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1.0)_70%,rgba(0,0,0,0)_100%)]">
                    <div className="flex w-full items-start md:h-full gap-2">
                      <div className="flex grow flex-col justify-between self-stretch px-2">
                        <div className="flex w-full flex-col items-start gap-2">
                          <h3 className="line-clamp-2 mobile:text-heading-4-sm md:text-heading-4-md lg:text-heading-4 !font-bold font-heading-3 leading-tight text-white mobile:font-body-lg-bold [text-shadow:_0_1px_3px_rgba(0,0,0,0.4),_0_0_1px_rgba(0,0,0,0.6)]">
                            {logo.title}
                          </h3>
                        </div>
                        <div className="flex w-full items-end justify-between pt-3">
                          <div className="flex items-start gap-2">
                            {logo.badges && logo.badges.map((badge, badgeIndex) => (
                              <BadgeConsort key={badgeIndex} variant={badge.variant}>
                                {badge.text}
                              </BadgeConsort>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </motion.div>
  );
} 