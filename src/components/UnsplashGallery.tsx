'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

// Sample romantic images from Unsplash
const UNSPLASH_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    caption: 'Romantic sunset walk on the beach',
    credit: 'Unsplash'
  },
  {
    url: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    caption: 'Couple holding hands in the city',
    credit: 'Unsplash'
  },
  {
    url: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    caption: 'Romantic dinner by candlelight',
    credit: 'Unsplash'
  },
  {
    url: 'https://images.unsplash.com/photo-1539841072057-c9d9665a2ad6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    caption: 'Couple watching the sunset',
    credit: 'Unsplash'
  },
  {
    url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    caption: 'Romantic walk in the park',
    credit: 'Unsplash'
  },
  {
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    caption: 'Couple dancing in the moonlight',
    credit: 'Unsplash'
  }
];

export default function UnsplashGallery() {
  const [images, setImages] = useState(UNSPLASH_IMAGES);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
        <FaHeart className="text-primary mr-2" />
        Romantic Inspiration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative h-64 rounded-lg overflow-hidden shadow-lg"
          >
            <Image
              src={image.url}
              alt={image.caption}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-semibold">{image.caption}</h3>
              <p className="text-white/70 text-sm">Photo by {image.credit}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
