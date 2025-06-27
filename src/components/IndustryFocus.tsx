"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const industries = [
  { name: "Mass Transit", icon: "/icons/mass-transit.svg" },
  { name: "Maritime", icon: "/icons/maritime.svg" },
  { name: "Public Safety", icon: "/icons/public-safety.svg" },
  { name: "Manufacturing", icon: "/icons/mfg.svg" },
  { name: "Oil & Gas", icon: "/icons/oil.svg" },
  { name: "Infrastructure", icon: "/icons/infra.svg" },
  { name: "Healthcare", icon: "/icons/healthcare.svg" },
  { name: "Mining", icon: "/icons/mining.svg" },
];

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0, x: "-50%", y: "-50%" },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    x: `calc(-50% + ${Math.cos((i / industries.length) * 2 * Math.PI) * 220}px)`,
    y: `calc(-50% + ${Math.sin((i / industries.length) * 2 * Math.PI) * 220}px)`,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
    },
  }),
};

const IndustryFocus = () => {
  return (
    <motion.section 
      className="bg-white dark:bg-gray-900 py-8 mobile:py-2"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 text-center">
        
        {/* Desktop Circular Layout */}
        <div className="hidden md:flex justify-center items-center h-[500px]">
          <motion.div
            className="relative w-[500px] h-[500px]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-10 shadow-[0px_35px_25px_-16px_rgba(0,_0,_0,_0.2)]">
              <Image src="/icons/mcxone.svg" alt="MCX ONE" width={120} height={120} />
            </div>

            {industries.map((industry, index) => {
              return (
                <motion.div
                  key={industry.name}
                  className="absolute top-1/2 left-1/2"
                  custom={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, zIndex: "20" }}
                >
                  <div className="group flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-16 h-12 flex items-center justify-center transition-all duration-300">
                      <Image
                        src={industry.icon}
                        alt={industry.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
                      />
                    </div>
                    <span className="text-caption font-body font-medium text-subtext-color dark:text-gray-200">{industry.name}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile Grid Layout */}
        <motion.div 
          className="md:hidden grid grid-cols-2 gap-x-6 gap-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {industries.map((industry) => (
            <motion.div 
              key={industry.name} 
              className="flex flex-col items-center gap-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-20 h-20 mobile:w-12 mobile:h-12 flex items-center justify-center">
                <Image
                  src={industry.icon}
                  alt={industry.name}
                  width={32}
                  height={32}
                  className="w-full h-12 object-contain"
                />
              </div>
              <span className="text-base font-medium text-gray-700 dark:text-gray-200 text-center">{industry.name}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </motion.section>
  );
};

export default IndustryFocus; 