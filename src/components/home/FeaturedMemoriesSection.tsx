'use client';

import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaHeart } from 'react-icons/fa';
import UnsplashGallery from '../UnsplashGallery';

export default function FeaturedMemoriesSection() {
  const { user } = useAuth();
  const { featuredImages } = useGallery();

  // If user is not logged in, show Unsplash Gallery
  if (!user) {
    return (
      <section className="py-16 px-4 bg-white/10 dark:bg-[#2d1a1a]/20">
        <div className="container mx-auto max-w-6xl">
          <UnsplashGallery />
        </div>
      </section>
    );
  }

  // If user has no featured images
  if (featuredImages.length === 0) {
    return (
      <section className="py-16 px-4 bg-white/10 dark:bg-[#2d1a1a]/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center">
              <FaHeart className="text-primary mr-2" />
              No Featured Memories Yet
            </h2>
            <p className="text-foreground/70 mb-6">
              You haven't featured any memories yet. Visit your gallery to add some special moments to feature here.
            </p>
            <Link href="/gallery">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary text-white rounded-full flex items-center font-medium mx-auto"
              >
                Go to Gallery <FaArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // If user has featured images
  return (
    <section className="py-16 px-4 bg-white/10 dark:bg-[#2d1a1a]/20">
      <div className="container mx-auto max-w-6xl">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
            <FaHeart className="text-primary mr-2" />
            Your Featured Memories
          </h2>
          <p className="text-foreground/70 mb-8">
            These are your special moments that you've chosen to feature. You can manage them from your gallery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-64 rounded-lg overflow-hidden shadow-lg max-h-[400px]"
              >
                <Image
                  src={image.url}
                  alt={image.moment}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold">{image.moment}</h3>
                  {image.description && (
                    <p className="text-white/90 text-sm mt-1">{image.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
