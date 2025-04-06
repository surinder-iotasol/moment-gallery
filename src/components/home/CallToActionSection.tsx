'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CallToActionSection() {
  const { user } = useAuth();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary-dark to-primary rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Capturing Your Romantic Moments Today
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Create your free account and begin building your gallery of special memories that you can cherish forever.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link href="/gallery">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-primary rounded-full font-medium"
                >
                  Go to Gallery
                </motion.button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white text-primary rounded-full font-medium"
                  >
                    Get Started
                  </motion.button>
                </Link>
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-transparent border border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
