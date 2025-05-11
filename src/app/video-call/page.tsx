'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { VideoCallProvider } from '@/context/VideoCallContext';
import VideoCallUI from '@/components/videoCall/VideoCallUI';
import PartnerInvitation from '@/components/videoCall/PartnerInvitation';
import { motion } from 'framer-motion';
import { FaHeart, FaVideo } from 'react-icons/fa';

export default function VideoCallPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <FaHeart className="text-primary text-4xl" />
          </motion.div>
          <p className="text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <VideoCallProvider>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <FaVideo className="text-primary mr-2" />
            Video Call with Your Partner
          </h1>
          <p className="text-foreground/70 mt-2">
            Connect face-to-face with your loved one in a private video call
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partner invitation section */}
          <div className="lg:col-span-1">
            <PartnerInvitation />
          </div>
          
          {/* Video call section */}
          <div className="lg:col-span-2 h-[600px]">
            <VideoCallUI />
          </div>
        </div>
      </div>
    </VideoCallProvider>
  );
}
