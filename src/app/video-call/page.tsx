'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaVideo, FaHeart } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import StartCallButton from '@/components/video-call/StartCallButton';
import Navbar from '@/components/Navbar';
import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';
import LoadingIndicator from '@/components/gallery/LoadingIndicator';
import { useState } from 'react';

export default function VideoCallPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [heartDirection, setHeartDirection] = useState(50);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <LoadingIndicator message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />

      <main className="container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-bg dark:bg-[#3a2222] rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/10 p-6 border-b border-primary/20">
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <FaVideo className="mr-3 text-primary" />
                Private Video Call
              </h1>
              <p className="text-foreground/70 mt-2">
                Connect with your partner through a private video call. Only the person with your unique link can join.
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg p-6 text-center">
                <div className="mb-6">
                  <FaHeart className="text-primary text-5xl mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Start a Private Video Call
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Click the button below to start a new video call. You'll get a unique link to share with your partner.
                  </p>
                </div>

                <StartCallButton size="lg" className="mx-auto" />
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/30 dark:bg-[#2d1a1a]/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Private & Secure</h3>
                  <p className="text-foreground/70 text-sm">
                    Your call is private and can only be joined by someone with your unique link.
                  </p>
                </div>
                <div className="bg-white/30 dark:bg-[#2d1a1a]/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">High Quality</h3>
                  <p className="text-foreground/70 text-sm">
                    Enjoy high-quality video and audio for the best experience.
                  </p>
                </div>
                <div className="bg-white/30 dark:bg-[#2d1a1a]/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Easy to Use</h3>
                  <p className="text-foreground/70 text-sm">
                    No downloads required. Just share the link and start talking.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
