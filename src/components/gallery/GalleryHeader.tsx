'use client';

import { motion } from 'framer-motion';

export default function GalleryHeader() {
  return (
    <div className="mb-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-foreground"
      >
        Your Romantic Moments
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-foreground/70 mt-2"
      >
        Cherish and relive your special memories
      </motion.p>
    </div>
  );
}
