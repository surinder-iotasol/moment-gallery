'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaVideo, FaSpinner } from 'react-icons/fa';
import { useVideoCall } from '@/context/VideoCallContext';
import toast from 'react-hot-toast';

interface StartCallButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function StartCallButton({
  className = '',
  variant = 'primary',
  size = 'md',
}: StartCallButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { startCall } = useVideoCall();

  // Button style variants
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary/80',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
  };

  // Button size variants
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const handleStartCall = async () => {
    setIsLoading(true);
    try {
      await startCall();
      toast.success('Video call started! Share the link with your partner.');
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start video call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full flex items-center justify-center transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={handleStartCall}
      disabled={isLoading}
    >
      {isLoading ? (
        <FaSpinner className="animate-spin mr-2" />
      ) : (
        <FaVideo className="mr-2" />
      )}
      <span>Start Video Call</span>
    </motion.button>
  );
}
