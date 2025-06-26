"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button3 } from '@/ui';
import { FeatherArrowRight } from '@subframe/core';

const industries = [
  {
    id: 'maritime',
    name: 'Maritime',
    icon: '/icons/maritime.svg',
    image: '/maritime1.jpg',
    description: 'Fail-safe solutions for the world\'s harshest and most inaccessible maritime environments, ensuring reliable voice and data communication.',
    url: '/industries/maritime',
  },
  {
    id: 'public-safety',
    name: 'Public Safety',
    icon: '/icons/public-safety.svg',
    image: '/public-safety.avif',
    description: 'Empowering first responders with mission-critical communication systems that ensure seamless coordination during emergencies.',
    url: '/industries/public-safety',
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas',
    icon: '/icons/oil.svg',
    image: '/oilgas.avif',
    description: 'Robust and reliable communication solutions for offshore platforms, refineries, and pipelines, ensuring safety and operational efficiency.',
    url: '/industries/oil-gas',
  },
  {
    id: 'mass-transit',
    name: 'Mass Transit',
    icon: '/icons/mass-transit.svg',
    image: '/train.avif',
    description: 'Scalable and interoperable communication systems for railways, metros, and airports, enhancing passenger safety and operational control.',
    url: '/industries/mass-transit',
  },
   {
    id: 'mining',
    name: 'Mining',
    icon: '/icons/mining.svg',
    image: '/mining.jpg',
    description: 'Dependable communication solutions for underground and open-pit mining operations, ensuring worker safety and productivity.',
    url: '/industries/mining',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: '/icons/infra.svg',
    image: '/train-image.avif',
    description: 'Scalable and interoperable communication systems for railways, metros, and airports, enhancing passenger safety and operational control.',
    url: '/industries/mass-transit',
  },
  {
    id: 'factory',
    name: 'Manufacturing',
    icon: '/icons/mfg.svg',
    image: '/factory.jpg',
    description: 'Robust and reliable communication solutions for offshore platforms, refineries, and pipelines, ensuring safety and operational efficiency.',
    url: '/industries/oil-gas',
  },
];

export default function InteractiveIndustrySection() {
  const [activeIndustry, setActiveIndustry] = useState(industries[0]);
  const [shouldLoadImages, setShouldLoadImages] = useState(false);

  // Simple 10-second delay for image loading
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoadImages(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-[1080px] mx-auto md:px-2 mobile:px-0 overflow-visible ">
      

      <div className="flex flex-col md:flex-row bg-neutral-100 rounded-md shadow-md lg:p-4 md:p-0 mobile:p-2 gap-0 lg:min-h-[480px] shadow-[0px_0px_55px_-2px_rgba(0,_0,_0,_0.1)]">

        {/* Right Column: Dynamic Content */}
        <div className="w-full md:w-[75%] relative overflow-hidden rounded-md mobile:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndustry.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {shouldLoadImages && (
                <Image
                  src={activeIndustry.image}
                  alt={activeIndustry.name}
                  fill
                  className="object-cover"
                  loading="lazy"
                  priority={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-8 flex flex-col items-start justify-end">
                <h3 className="lg:text-heading-3 md:text-heading-3-md text-white font-bold font-heading-3">{activeIndustry.name}</h3>
                <p className="text-body-lg text-neutral-200 mt-2 mb-4 max-w-md font-body">{activeIndustry.description}</p>
                <Button3 variant="destructive-primary" size="medium" iconRight={<FeatherArrowRight />}>
                  Learn More
                </Button3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Left Column: Industry List */}
        <div className="w-full md:w-[25%] flex flex-col gap-2 py-4">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => setActiveIndustry(industry)}
              className={`relative text-consort-blue text-left w-full py-3 pl-6 pr-2 rounded-sm transition-colors duration-200 mobile:pointer-events-none ${
                activeIndustry.id === industry.id
                  ? 'bg-neutral-200 !text-consort-red mobile:bg-transparent'
                  : 'hover:bg-neutral-200 mobile:hover:bg-transparent'
              }`}
            >
              <div className="flex flex-row items-center gap-5">
                {shouldLoadImages && (
                  <Image src={industry.icon} alt={`${industry.name} icon`} width={40} height={40}
                    className="w-8 h-8 mobile:w-8 mobile:h-8 lg:block md:hidden"
                    loading="lazy"
                    priority={false}
                  />
                )}
                <h2 className="mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl-md font-body-xl text-inherit">{industry.name}</h2>
              </div>
              {activeIndustry.id === industry.id && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-consort-red mobile:hidden"
                  layoutId="active-industry-indicator"
                />
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
} 