import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselDots, CarouselItem } from "../ui/carousel";
import Image from "next/image";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import React, { useEffect, useState } from "react";

// Dynamic Firebase imports to avoid SSR issues
async function loadFirebase() {
  if (typeof window === 'undefined') return null;
  
  const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/firebase/firebaseconfig')
  ]);
  
  return { collection, getDocs, query, where, db };
}

const advance = [
    {
      title: "TETRA for Refineries",
      subtitle: "DMR - TETRA - MCX",
      src: "/oil-rig.avif",
      alt: "TETRA for Refineries",
      badges: [
        { text: "Crisis", variant: "warning" as const },
        { text: "Command", variant: "brand" as const }
      ]
    },
  
    {
      title: "MCX ONE™ for Airport Ground Operations",
      subtitle: "DMR - TETRA - MCX",
      src: "/airport-image.avif",
      alt: "Airport Ground Operations",
      badges: [
        { text: "Airport", variant: "neutral" as const },
        { text: "Efficiency", variant: "success" as const }
      ]
    },
    {
      title: "TETRA Helo Deck Communication System (HDCS)",
      subtitle: "DMR - TETRA - MCX",
      src: "/helicopter-image.avif",
      alt: "Helicopter Deck Communication",
      badges: [
        { text: "Maritime", variant: "neutral" as const },
        { text: "DMR Tech", variant: "brand" as const }
      ]
    },
    {
      title: "LTE for Metro Trains",
      subtitle: "DMR - TETRA - MCX",
      src: "/train-image.avif",
      alt: "LTE for Metro Trains",
      badges: [
        { text: "Energy", variant: "warning" as const },
        { text: "SecureCom", variant: "brand" as const }
      ]
    },
    {
      title: "MultiTech Radio System for Police Communication",
      subtitle: "DMR - TETRA - MCX",
      src: "/public-safety.avif",
      alt: "Police Communication System",
      badges: [
        { text: "Maritime", variant: "neutral" as const },
        { text: "DMR Tech", variant: "brand" as const }
      ]
    },
    {
      title: "TETRA Radio Solution for OITDS",
      subtitle: "DMR - TETRA - MCX",
      src: "/maritime-image.avif",
      alt: "TETRA Radio for OITDS",
      badges: [
        { text: "Oil & Gas", variant: "dark" as const },
        { text: "TETRA", variant: "brand" as const }
      ]
    },
  
  ]

  interface SolutionItem {
    id: string;
    title: string;
    subtitle: string;
    heroImage: string;
    alt?: string;
    badges: { text: string; variant: string }[];
  }


export default function LandingCarousel() {


    const [data, setData] = useState<SolutionItem[]>([]);

    useEffect(() => {
      async function fetchSolution() {
        try {
          const firebase = await loadFirebase();
          if (!firebase) {
            console.warn('[CAROUSEL] Firebase not available in SSR context');
            return;
          }
          
          const { collection, getDocs, query, where, db } = firebase;
          const solutionRef = collection(db, "solutions");
          // ✅ Filter out drafts from public view
          const q = query(solutionRef, where('isDraft', '==', false));
          const snapshot = await getDocs(q);
    
          const solution = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          })) as SolutionItem[];
    
          setData(solution);
        } catch (error) {
          console.error("Error fetching solutions:", error);
        }
      }
    
      fetchSolution();
    }, []);


    return(
        <div className="relative w-full max-w-[1280px] flex flex-wrap items-start justify-center gap-6">
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
            {data.map((logo, index) => (
              <CarouselItem key={index} className="pl-8 md:flex-[0_0_75%] mobile:flex-[0_0_100%] ">
                <div className="relative flex min-w-[250px] grow shrink-0 basis-0 flex-col items-center self-stretch overflow-hidden rounded-md bg-default-background shadow-a1 h-[512px] mobile:h-80"> {/* Added h-80 mobile:h-56 here */}
                  <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    src={logo.heroImage}
                    alt={logo.heroImage || `Image for ${logo.heroImage}`}
                    fill
                    priority={index === 0} // Prioritize loading the first image
                  />
                  <div
                    className="absolute bottom-4 left-5 z-10 flex w-auto flex-col items-start gap-4 lg:px-9 lg:py-6 md:p-6 backdrop-blur-sm rounded-lg [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1.0)_60%,rgba(0,0,0,0)_100%)]"
                  // Styling Guide:
                  // Position: `absolute` with `bottom-X left-X` (or top/right). Parent needs `relative`.
                  // Size: `w-auto` (content-based), `w-N/M` (fraction), `max-w-X` (max width), or `w-[value]` (fixed).
                  // Padding: `p-X` (overall), `px-X py-Y` (axis-specific).
                  // Background: `bg-color/opacity` (e.g., bg-black/10). Works with `backdrop-blur-md`.
                  // Border: `border border-style border-color/opacity rounded-X` (e.g., border border-solid border-black/30 rounded-md).
                  >
                    <div className="flex w-full items-start md:h-full gap-2">
                      <div className="flex grow flex-col justify-between self-stretch px-2">
                        <div className="flex w-full flex-col items-start gap-2">
                          {/* <h3 className="line-clamp-2 mobile:text-heading-4-sm md:text-heading-4-md lg:text-heading-4 !font-bold font-heading-3 leading-tight text-white mobile:font-body-lg-bold [text-shadow:_0_1px_3px_rgba(0,0,0,0.4),_0_0_1px_rgba(0,0,0,0.6)]">
                            {logo.title}
                          </h3> */}
                        </div>
                        <div className="flex w-full items-end justify-between pt-3">
                          <div className="flex items-start gap-2">
                            {/* {logo.badges && logo.badges.map((badge, badgeIndex) => (
                              <BadgeConsort key={badgeIndex} variant={badge.variant as any}>
                                {badge.text}
                              </BadgeConsort>
                            ))} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious className="left-2 sm:-left-6"  /> */}
          <CarouselDots />
          {/* <CarouselNext className="right-2 sm:-right-6"/> */}
        </Carousel>
      </div>
    )
}


