'use client';

import { FaHeart } from 'react-icons/fa';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Loading your romantic moments...' }: LoadingIndicatorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <FaHeart className="text-primary text-4xl mx-auto animate-pulse" />
        <p className="mt-4 text-foreground">{message}</p>
      </div>
    </div>
  );
}
