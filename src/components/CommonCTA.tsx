"use client";

import { Button3 } from "@/ui/components/Button3";
import { FeatherArrowRight } from "@subframe/core";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Scroll reveal animation component with blur effect
const ScrollReveal = ({ 
    children, 
    delay = 0, 
    className = "", 
    duration = 0.8,
    blurAmount = 8
  }: { 
    children: React.ReactNode; 
    delay?: number; 
    className?: string;
    duration?: number;
    blurAmount?: number;
  }) => {
    return (
      <motion.div
        className={`${className} relative`}
        initial={{ 
          opacity: 0, 
          y: 50,
          filter: `blur(${blurAmount}px)`
        }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          filter: "blur(0px)"
        }}
        viewport={{ once: true, margin: "-25%" }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        {children}
      </motion.div>
    );
  };
  

export default function Questions() {

    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const swirlY = useTransform(scrollYProgress, [0, 1], ["-75%", "75%"]);

    return (
        <ScrollReveal>

            <div ref={containerRef} className="relative mx-auto my-4 w-full lg:max-w-[1080px] md:w-[95%] mobile:max-w-[90%] bg-brand-900 rounded-3xl flex flex-col items-center justify-center gap-12 p-4 mobile:p-0 overflow-hidden">
                
                <motion.div style={{ y: swirlY }} className="absolute inset-0 z-10">
                    <Image
                        src="/bg-swirl.avif"
                        alt="Common CTA"
                        fill
                        className="opacity-25"
                    />
                </motion.div>
                <div className="relative z-20 flex w-full max-w-[1024px] flex-col items-center justify-center gap-14 px-12 pt-24 pb-16 mobile:px-9 mobile:py-16">
                    <div className="flex w-full max-w-[768px] flex-col items-center justify-center gap-6">
                        <h2 className="w-full lg:text-heading-1 md:text-heading-2 font-heading-1 text-white text-center -tracking-[0.035em] mobile:text-heading-3 mobile:font-heading-3">
                        Let our specialists design your communication backbone
                        </h2>
                        <h3 className="w-full whitespace-pre-wrap text-body-xl font-body-xl text-amber-300 text-center -tracking-[0.025em] mobile:text-body-lg mobile:font-body-lg">
                            {"Have Question? \nDiscuss your requirements with our Experts"}
                        </h3>
                        {/* <h3 className="w-full whitespace-pre-wrap text-body-xl font-body-xl text-brand-200 text-center -tracking-[0.025em] mobile:text-body-lg mobile:font-body-lg">
                            {"India | Signapore | Murutius"}
                        </h3> */}
                    </div>
                    <div className="flex items-center justify-center gap-5 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
                        <Button3
                            variant="destructive-primary"
                            size="large"
                            iconRight={<FeatherArrowRight />}
                            onClick={() => router.push('/cta')}
                        >
                            Speak to Expert
                        </Button3>
                        <div className="h-[28px] w-[2px] ml-4 bg-white/50 mobile:hidden"></div>
                        <Button3
                            variant="inverse"
                            size="large"
                            iconRight={<FeatherArrowRight />}
                        // onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                        >
                            Request Callback
                        </Button3>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    )
}