'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useVideoCall } from '@/context/VideoCallContext';

export default function RoomInfo() {
  const [copied, setCopied] = useState(false);
  const { roomId, copyRoomLink } = useVideoCall();

  const handleCopyLink = () => {
    copyRoomLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!roomId) return null;

  const roomLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/video-call/${roomId}`;

  return (
    <div className="bg-white/90 dark:bg-[#2d1a1a]/90 backdrop-blur-md p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-foreground font-medium mb-2">Share this link with your partner</h3>
      <div className="flex items-center">
        <input
          type="text"
          value={roomLink}
          readOnly
          className="flex-1 bg-background/50 dark:bg-[#1a1212]/50 border border-primary/20 rounded-l-md py-2 px-3 text-foreground text-sm"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className="bg-primary text-white py-2 px-3 rounded-r-md"
        >
          {copied ? <FaCheck /> : <FaCopy />}
        </motion.button>
      </div>
      <p className="text-foreground/70 text-xs mt-2">
        Only share this link with your partner. Anyone with this link can join your call.
      </p>
    </div>
  );
}
