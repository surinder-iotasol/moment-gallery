'use client';

import { useGallery } from '@/context/GalleryContext';
import { motion } from 'framer-motion';
import { FaHeart, FaPlus, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import VirtualizedGallery from '../VirtualizedGallery';

interface SectionViewProps {
  section: string;
  onViewImage: (imageId: string) => void;
  onAddImage: (section: string) => void;
}

export default function SectionView({ section, onViewImage, onAddImage }: SectionViewProps) {
  const { sectionImageCounts, sectionFlipDisabled, toggleSectionFlip } = useGallery();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground flex items-center">
          <FaHeart className="text-primary mr-2" />
          {section}
          {sectionImageCounts[section] > 0 && (
            <span className="ml-2 text-sm text-foreground/70">
              ({sectionImageCounts[section]} images)
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-3">
          <div
            className="flex items-center cursor-pointer px-3 py-1.5 bg-white/10 dark:bg-white/5 hover:bg-white/20 rounded-full transition-colors border border-white/10 hover:border-white/20"
            onClick={() => toggleSectionFlip(section)}
            title={sectionFlipDisabled[section] ? "Enable flip effect" : "Disable flip effect"}
          >
            {sectionFlipDisabled[section] ? (
              <FaToggleOff className="text-gray-400 mr-2" size={18} />
            ) : (
              <FaToggleOn className="text-green-500 mr-2" size={18} />
            )}
            <span className="text-sm font-medium">{sectionFlipDisabled[section] ? "Flip Off" : "Flip On"}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary text-white rounded-full flex items-center text-sm font-medium"
            onClick={() => onAddImage(section)}
          >
            <FaPlus className="mr-2" />
            Add Image
          </motion.button>
        </div>
      </div>

      {/* Virtualized Gallery for Selected Section */}
      <VirtualizedGallery
        section={section}
        onViewImage={onViewImage}
      />
    </div>
  );
}
