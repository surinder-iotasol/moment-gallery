'use client';

import { motion } from 'framer-motion';
import { FaVideo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function VideoCallButton() {
  const router = useRouter();

  const handleStartCall = () => {
    router.push('/video-call');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleStartCall}
      className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
    >
      <FaVideo />
      <span>Start Video Call</span>
    </motion.button>
  );
}
