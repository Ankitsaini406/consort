"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Scroll reveal animation component with blur effect
const ClientScrollReveal = ({
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

export default ClientScrollReveal; 