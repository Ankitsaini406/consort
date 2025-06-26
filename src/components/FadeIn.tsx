import { motion } from 'framer-motion';

export function FadeIn({ children, delay = 0, y = 20, duration = 0.8 }) {
    return (
      <motion.div
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, ease: 'easeOut', delay }}
      >
        {children}
      </motion.div>
    );
  }
  