'use client';

import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaHeart, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import FeaturedSlider from '../FeaturedSlider';

export default function HeroSection() {
  const { user } = useAuth();
  const { featuredImages } = useGallery();

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Capture Your <span className="text-primary">Romantic</span> Moments
            </h1>
            <p className="mt-6 text-lg text-foreground/80">
              Create a beautiful gallery of your special moments together. Store, organize, and relive your romantic memories with our heart-themed gallery app.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link href="/gallery">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary text-white rounded-full flex items-center font-medium"
                  >
                    Go to Gallery <FaArrowRight className="ml-2" />
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-primary text-white rounded-full flex items-center font-medium"
                    >
                      <FaSignInAlt className="mr-2" /> Sign In
                    </motion.button>
                  </Link>
                  <Link href="/auth/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 border border-primary text-primary rounded-full flex items-center font-medium hover:bg-primary hover:text-white transition-colors"
                    >
                      <FaUserPlus className="mr-2" /> Create Account
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            {user && featuredImages.length > 0 ? (
              <FeaturedSlider />
            ) : (
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Romantic couple"
                  fill
                  className="object-cover rounded-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <p className="text-white text-lg font-medium">"Every moment with you is a treasure worth keeping"</p>
                </div>
              </div>
            )}

            {/* Floating hearts decoration */}
            <motion.div
              className="absolute -top-6 -right-6 text-primary"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FaHeart size={40} />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 text-primary-light"
              animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <FaHeart size={30} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
