"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { highlighterConfig } from '@/data/home-data';

export function ClientHighlighter({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {/* Highlighter background effect */}
      <motion.svg
        className="absolute left-0 w-full pointer-events-none -z-10 mobile:hidden"
        style={{
          top: highlighterConfig.verticalOffset,
          height: highlighterConfig.height
        }}
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: highlighterConfig.animationDelay }}
      >
        {/* Main highlighter stroke - simplified to a single upward curve */}
        <motion.path
          d="M 5 50 Q 100 20 195 50" // Simplified path for a single upward curve
          stroke={highlighterConfig.color}
          strokeWidth={highlighterConfig.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={highlighterConfig.opacity}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: highlighterConfig.opacity }}
          transition={{
            duration: highlighterConfig.animationDuration,
            delay: highlighterConfig.animationDelay,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          style={{
            filter: `blur(0.5px) drop-shadow(0 0 4px ${highlighterConfig.color}30)` // Reduced blur and shadow for clarity
          }}
        />
      </motion.svg>
      {children}
    </span>
  );
} 