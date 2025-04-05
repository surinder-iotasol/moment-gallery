'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHeart, FaEdit, FaTrash, FaExchangeAlt } from 'react-icons/fa';
import { useGallery } from '@/context/GalleryContext';

interface ImageCardProps {
  id: string;
  imageUrl: string;
  moment: string;
  section: string;
  onView: () => void;
}

export default function ImageCard({ id, imageUrl, moment, section, onView }: ImageCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMoment, setEditedMoment] = useState(moment);
  const { deleteImage, updateImageMoment, flipOnHoverSettings, toggleFlipOnHover, sectionFlipDisabled } = useGallery();

  // Check if this card should flip on hover
  // First check if the section has flip disabled, then check individual image setting
  const shouldFlipOnHover = !sectionFlipDisabled[section] && flipOnHoverSettings[id] !== false;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteImage(id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateImageMoment(id, editedMoment);
    setIsEditing(false);
  };

  return (
    <motion.div
      className={`card-container relative w-full h-64 rounded-lg overflow-hidden shadow-lg cursor-pointer ${shouldFlipOnHover ? 'flip-on-hover' : ''}`}
      whileHover={{ scale: 1.03 }}
      onClick={() => !isEditing && onView()}
      data-section={section}
      data-flip-disabled={sectionFlipDisabled[section] ? 'true' : 'false'}
    >
      <div className={`card w-full h-full ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card (Image) */}
        <div className="card-front bg-card-bg rounded-lg overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={moment}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-semibold truncate">{moment}</h3>
              <p className="text-white/80 text-sm">{section}</p>
            </div>
          </div>
        </div>

        {/* Back of card (Moment text) */}
        <div className="card-back bg-card-bg rounded-lg p-4 flex flex-col justify-center items-center">
          {isEditing ? (
            <form onSubmit={handleSave} className="w-full">
              <textarea
                value={editedMoment}
                onChange={(e) => setEditedMoment(e.target.value)}
                className="w-full h-32 p-2 border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditedMoment(moment);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-primary text-white rounded-md text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              <FaHeart className="text-primary text-3xl mb-4 floating-heart" />
              <p className="text-center text-foreground">{moment}</p>
              <p className="text-center text-sm text-foreground/70 mt-2">
                From: {section}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center text-primary"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(!isFlipped);
          }}
          title="Flip card"
        >
          <FaHeart />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center ${shouldFlipOnHover ? 'text-green-500' : 'text-gray-500'}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFlipOnHover(id);
          }}
          title={shouldFlipOnHover ? "Disable flip on hover" : "Enable flip on hover"}
        >
          <FaExchangeAlt />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center text-blue-500"
          onClick={handleEdit}
          title="Edit moment"
        >
          <FaEdit />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center text-red-500"
          onClick={handleDelete}
          title="Delete image"
        >
          <FaTrash />
        </motion.button>
      </div>
    </motion.div>
  );
}
