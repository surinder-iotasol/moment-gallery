'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaHeart, FaArrowRight, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';
import FeaturedSlider from '@/components/FeaturedSlider';
import UnsplashGallery from '@/components/UnsplashGallery';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';

export default function Home() {
  const [heartDirection, setHeartDirection] = useState(50);
  const { user } = useAuth();
  const { featuredImages } = useGallery();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />

      {/* Hero Section */}
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

      {/* Featured Memories or Unsplash Gallery */}
      <section className="py-16 px-4 bg-white/10 dark:bg-[#2d1a1a]/20">
        <div className="container mx-auto max-w-6xl">
          {!user ? (
            <UnsplashGallery />
          ) : featuredImages.length > 0 ? (
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
                    className="relative h-64 rounded-lg overflow-hidden shadow-lg  max-h-[400px]"
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
          ) : (
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
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/30 dark:bg-[#2d1a1a]/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Features You'll <span className="text-primary">Love</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
              Our romantic gallery app is designed to help you cherish and organize your special moments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Heart Rain Animation',
                description: 'Enjoy a beautiful rain of hearts in the background that you can control with our heart-shaped slider.',
                icon: <FaHeart size={24} />
              },
              {
                title: 'Interactive Gallery',
                description: 'Organize your images in different sections and flip through them with our interactive card design.',
                icon: <FaHeart size={24} />
              },
              {
                title: 'Capture Moments',
                description: 'Add text to your images to describe the special moment and the feelings associated with it.',
                icon: <FaHeart size={24} />
              },
              {
                title: 'Secure Authentication',
                description: 'Your romantic moments are private and secure with our Firebase authentication system.',
                icon: <FaHeart size={24} />
              },
              {
                title: 'Cloud Storage',
                description: 'All your images are safely stored in the cloud, accessible from any device.',
                icon: <FaHeart size={24} />
              },
              {
                title: 'Beautiful Design',
                description: 'Enjoy a visually appealing interface with smooth animations and a romantic color palette.',
                icon: <FaHeart size={24} />
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card-bg dark:bg-[#3a2222] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
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

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-primary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaHeart size={24} className="text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">Romantic Moments</span>
            </div>

            <p className="text-foreground/70 text-sm">
              © {new Date().getFullYear()} Romantic Moments Gallery. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
