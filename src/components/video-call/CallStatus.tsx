'use client';

import { useVideoCall } from '@/context/VideoCallContext';
import { FaSpinner } from 'react-icons/fa';

export default function CallStatus() {
  const { isCallConnected, isCallEnded } = useVideoCall();

  if (isCallEnded) {
    return (
      <div className="bg-red-500/10 text-red-500 py-2 px-4 rounded-md text-sm flex items-center">
        <span>Call ended</span>
      </div>
    );
  }

  if (isCallConnected) {
    return (
      <div className="bg-green-500/10 text-green-500 py-2 px-4 rounded-md text-sm flex items-center">
        <span className="relative flex h-3 w-3 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/10 text-yellow-500 py-2 px-4 rounded-md text-sm flex items-center">
      <FaSpinner className="animate-spin mr-2" />
      <span>Waiting for connection...</span>
    </div>
  );
}
