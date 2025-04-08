'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaHeart } from 'react-icons/fa';
import { useVideoCall } from '@/context/VideoCallContext';
import RoomInfo from './RoomInfo';

export default function VideoCall() {
  const {
    localStream,
    remoteStream,
    isCallConnected,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    endCall,
  } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col h-full">
      {/* Room info and sharing link */}
      <RoomInfo />

      {/* Video container */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
        {/* Remote video (full size) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1212]">
            <div className="text-center">
              <FaHeart className="text-primary text-5xl mx-auto mb-4 animate-pulse" />
              <p className="text-white text-lg">
                {isCallConnected
                  ? "Connecting to your partner's video..."
                  : "Waiting for your partner to join..."}
              </p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-primary">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-[#1a1212] flex items-center justify-center">
              <FaVideoSlash className="text-white text-2xl" />
            </div>
          )}
        </div>
      </div>

      {/* Call controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className={`p-4 rounded-full ${
            isMuted ? 'bg-red-500' : 'bg-primary'
          } text-white`}
        >
          {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 text-white"
        >
          <FaPhoneSlash size={24} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleVideo}
          className={`p-4 rounded-full ${
            isVideoOff ? 'bg-red-500' : 'bg-primary'
          } text-white`}
        >
          {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
        </motion.button>
      </div>
    </div>
  );
}
