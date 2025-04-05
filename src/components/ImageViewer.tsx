'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaStar, FaRegStar, FaEdit } from 'react-icons/fa';
import { useGallery } from '@/context/GalleryContext';

interface Image {
  id: string;
  url: string;
  moment: string;
  featured?: boolean;
  description?: string;
}

interface ImageViewerProps {
  images: Image[];
  initialImageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageViewer({ images, initialImageId, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  const { toggleFeaturedStatus, updateImageDescription } = useGallery();

  // Set initial index based on initialImageId
  useEffect(() => {
    if (isOpen && initialImageId) {
      const index = images.findIndex(img => img.id === initialImageId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [initialImageId, images, isOpen]);

  // Update description when current image changes
  useEffect(() => {
    if (images[currentIndex]) {
      setDescription(images[currentIndex].description || '');
      setIsEditingDescription(false);
    }
  }, [currentIndex, images]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleToggleFeatured = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;

    await toggleFeaturedStatus(currentImage.id, description);
  };

  const handleSaveDescription = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;

    await updateImageDescription(currentImage.id, description);
    setIsEditingDescription(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full h-full flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <FaTimes size={24} />
            </button>

            {/* Image container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={currentImage.url}
                  alt={currentImage.moment}
                  width={1200}
                  height={800}
                  className="object-contain max-h-[80vh]"
                  priority
                />
              </div>

              {/* Caption and Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-lg font-medium">{currentImage.moment}</p>

                    {/* Description */}
                    {isEditingDescription ? (
                      <div className="mt-2">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full p-2 bg-black/50 border border-white/30 rounded text-white"
                          placeholder="Add a description for this featured image"
                          rows={3}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingDescription(false);
                              setDescription(currentImage.description || '');
                            }}
                            className="px-3 py-1 bg-gray-700 rounded text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveDescription}
                            className="px-3 py-1 bg-primary rounded text-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : currentImage.description ? (
                      <p className="text-white/80 mt-1">{currentImage.description}</p>
                    ) : currentImage.featured ? (
                      <p className="text-white/60 italic mt-1">No description for this featured image</p>
                    ) : null}
                  </div>

                  {/* Featured Controls */}
                  <div className="flex items-center space-x-2">
                    {currentImage.featured && !isEditingDescription && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingDescription(true);
                        }}
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        title="Edit description"
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                    <button
                      onClick={handleToggleFeatured}
                      className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      title={currentImage.featured ? "Remove from featured" : "Add to featured"}
                    >
                      {currentImage.featured ? (
                        <FaStar size={16} className="text-yellow-400" />
                      ) : (
                        <FaRegStar size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-colors"
                >
                  <FaChevronLeft size={24} />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-colors"
                >
                  <FaChevronRight size={24} />
                </button>

                {/* Image counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
