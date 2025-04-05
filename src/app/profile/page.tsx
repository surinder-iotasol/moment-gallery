'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeart, FaUser, FaEnvelope, FaSignOutAlt, FaImages } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';
import Navbar from '@/components/Navbar';
import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';

export default function ProfilePage() {
  const [heartDirection, setHeartDirection] = useState(50);
  const { user, logout, loading: authLoading } = useAuth();
  const { images, sections } = useGallery();
  const router = useRouter();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FaHeart className="text-primary text-4xl mx-auto animate-pulse" />
          <p className="mt-4 text-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // Calculate stats
  const totalImages = images.length;
  const sectionCounts = sections.reduce((acc, section) => {
    const count = images.filter(img => img.section === section).length;
    if (count > 0) {
      acc[section] = count;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />
      
      <main className="container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-bg dark:bg-[#3a2222] rounded-xl shadow-xl overflow-hidden"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary-dark to-primary p-6 text-white">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <FaUser size={40} />
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold">{user.displayName || 'User'}</h1>
                  <p className="text-white/80 flex items-center mt-1">
                    <FaEnvelope className="mr-2" />
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <FaHeart className="text-primary mr-2" />
                Your Gallery Stats
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg p-4 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                    <FaImages size={24} />
                  </div>
                  <div>
                    <p className="text-foreground/70 text-sm">Total Images</p>
                    <p className="text-2xl font-bold text-foreground">{totalImages}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg p-4 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                    <FaHeart size={24} />
                  </div>
                  <div>
                    <p className="text-foreground/70 text-sm">Sections</p>
                    <p className="text-2xl font-bold text-foreground">{Object.keys(sectionCounts).length}</p>
                  </div>
                </div>
              </div>
              
              {/* Section Breakdown */}
              {Object.keys(sectionCounts).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-foreground mb-4">Section Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(sectionCounts).map(([section, count]) => (
                      <div key={section} className="flex items-center">
                        <div className="w-full bg-white/30 dark:bg-[#2d1a1a]/70 rounded-full h-4 mr-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / totalImages) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-primary"
                          />
                        </div>
                        <div className="flex justify-between items-center min-w-[100px]">
                          <span className="text-foreground">{section}</span>
                          <span className="text-foreground font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
