"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from "embla-carousel-autoplay";

const logos = [
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

export default function CompanyLogoMarquee() {
  const half = Math.ceil(logos.length / 2);
  const firstHalf = logos.slice(0, half);
  const secondHalf = logos.slice(half);

  const [emblaRef1] = useEmblaCarousel(
    { loop: true, duration: 15000 },
    [Autoplay({ delay: 0, stopOnInteraction: false })]
  );

  const [emblaRef2] = useEmblaCarousel(
    { loop: true, duration: 15000, direction: 'rtl' },
    [Autoplay({ delay: 0, stopOnInteraction: false })]
  );

  return (
    <div className="relative mx-auto w-full overflow-hidden space-y-8 mobile:space-y-2">
      <style jsx>{`
        .logo-separator:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem; /* -12px to center between gap-3 (12px) */
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 36px;
          background-color: #f5f5f5; /* neutral-100 */
        }
        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
          filter: grayscale(1);
          opacity: 0.65;
          overflow: hidden;
          border-radius: 2px;
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        .logo-img:hover {
          filter: grayscale(0);
          opacity: 1;
        }
      `}</style>
      
      {/* Top row (left to right) */}
      <div className="relative w-full overflow-hidden pb-2">
        <div className="pointer-events-none absolute -ml-0.5 top-0 left-0 h-full w-16 mobile:w-6 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
        <div className="pointer-events-none absolute -mr-0.5 top-0 right-0 h-full w-16 mobile:w-6 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />

        <div className="overflow-hidden" ref={emblaRef1}>
          <div className="flex gap-3 items-center">
            {firstHalf.map((logo, index) => (
              <div 
                key={logo.src}
                className="logo-separator flex justify-center items-center flex-[0_0_auto] lg:w-[12.5%] md:w-[16.66%] mobile:w-[20%] lg:h-[65px] md:h-[65px] mobile:h-[36px]"
              >
                <img
                  src={logo.src}
                  alt={logo.alt || `Logo ${index + 1}`}
                  className="logo-img"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom row (right to left) */}
      <div className="relative w-full overflow-hidden pt-2">
        <div className="pointer-events-none absolute -ml-0.5 top-0 left-0  h-full w-16 mobile:w-6 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
        <div className="pointer-events-none absolute -mr-0.5 top-0 right-0 h-full w-16 mobile:w-6 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />

        <div className="overflow-hidden" ref={emblaRef2}>
          <div className="flex gap-3 flex-row-reverse items-center">
            {secondHalf.map((logo, index) => (
              <div 
                key={logo.src}
                className="logo-separator flex justify-center items-center flex-[0_0_auto] lg:w-[12.5%] md:w-[15%] mobile:w-[20%] lg:h-[65px] md:h-[65px] mobile:h-[36px]"
              >
                <img
                  src={logo.src}
                  alt={logo.alt || `Logo ${index + 1 + firstHalf.length}`}
                  className="logo-img"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
