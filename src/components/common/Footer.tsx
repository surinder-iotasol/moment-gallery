'use client';

import { FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-primary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaHeart size={24} className="text-primary mr-2" />
            <span className="text-xl font-bold text-foreground">Romantic Moments</span>
          </div>

          <p className="text-foreground/70 text-sm">
            © {new Date().getFullYear()} Romantic Moments Gallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
