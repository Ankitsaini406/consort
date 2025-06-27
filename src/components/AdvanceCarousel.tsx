import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FeatherArrowRight } from '@subframe/core';
import { Button3 } from '@/ui/components/Button3';

const dummyAdvance = [
  {
    title: 'TETRA for Oil & Gas',
    subtitle: 'DMR - TETRA - MCX',
    src: 'https://source.unsplash.com/random/400x300?oil',
  },
  {
    title: 'DMR for Maritime',
    subtitle: 'DMR - TETRA - MCX',
    src: 'https://source.unsplash.com/random/400x300?ship',
  },
  {
    title: 'Smart Mining Solutions',
    subtitle: 'IoT - AI - Analytics',
    src: 'https://source.unsplash.com/random/400x300?mining',
  },
  {
    title: 'Public Safety Networks',
    subtitle: 'Mission Critical Comms',
    src: 'https://source.unsplash.com/random/400x300?police',
  },
  {
    title: '5G Private Networks',
    subtitle: 'Next-Gen Connectivity',
    src: 'https://source.unsplash.com/random/400x300?5g',
  },
];

export default function AdvanceCarousel({ advance = dummyAdvance }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 4000 })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
  }, [emblaApi]);

  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      {/* Left fade overlay */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />

      {/* Right fade overlay */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />

      {/* Embla viewport */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex -ml-8 py-8">
          {(advance || []).map((logo, index) => (
            <div key={index} className="flex-[0_0_60%] pl-8">
              <div className="flex min-w-[288px] grow shrink-0 flex-col items-center self-stretch overflow-hidden rounded-md bg-white px-1 py-1 shadow-lg">
                <div className="flex w-full flex-col items-start gap-4 px-6 pt-6 pb-2">
                  <div className="flex w-full flex-col items-start gap-1">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        {logo.title}
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {logo.subtitle}
                      </span>
                      <Button3
                        variant="brand-tertiary"
                        iconRight={<FeatherArrowRight />}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full px-2 py-2">
                  <img
                    className="h-64 w-full rounded-md object-cover"
                    src={logo.src}
                    alt={logo.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Pagination */}
      <div className="flex justify-center gap-2 mt-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition ${
              index === selectedIndex ? 'bg-gray-800' : 'bg-gray-400'
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
