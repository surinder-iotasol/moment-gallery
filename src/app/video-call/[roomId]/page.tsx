'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useVideoCall } from '@/context/VideoCallContext';
import { useAuth } from '@/context/AuthContext';
import VideoCall from '@/components/video-call/VideoCall';
import CallStatus from '@/components/video-call/CallStatus';
import HeartRain from '@/components/HeartRain';
import LoadingIndicator from '@/components/gallery/LoadingIndicator';

interface VideoCallPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function VideoCallPage({ params }: VideoCallPageProps) {
  const { roomId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const { isInCall, joinCall } = useVideoCall();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Join the call when the component mounts
  useEffect(() => {
    if (user && roomId && !isInCall) {
      joinCall(roomId).catch((error) => {
        console.error('Failed to join call:', error);
      });
    }
  }, [user, roomId, isInCall, joinCall]);

  // Handle back button
  const handleBack = () => {
    router.push('/');
  };

  if (authLoading || !user) {
    return <LoadingIndicator message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Heart Rain Background with reduced opacity */}
      <div className="opacity-30">
        <HeartRain direction={50} />
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="mr-4 p-2 rounded-full bg-white/20 text-foreground hover:bg-white/30 transition-colors"
            >
              <FaArrowLeft />
            </motion.button>
            <h1 className="text-2xl font-bold text-foreground">Private Video Call</h1>
          </div>
          <CallStatus />
        </div>

        {/* Video Call Component */}
        <div className="flex-1 flex flex-col">
          <VideoCall />
        </div>
      </main>
    </div>
  );
}
