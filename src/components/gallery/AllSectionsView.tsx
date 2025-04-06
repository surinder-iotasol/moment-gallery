'use client';

import { useGallery } from '@/context/GalleryContext';
import { motion } from 'framer-motion';
import { FaHeart, FaPlus, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import ImageCard from '../ImageCard';

interface AllSectionsViewProps {
  onViewImage: (imageId: string) => void;
  onAddImage: (section: string) => void;
  onSelectSection: (section: string) => void;
}

export default function AllSectionsView({ 
  onViewImage, 
  onAddImage, 
  onSelectSection 
}: AllSectionsViewProps) {
  const { images, sections, sectionImageCounts, sectionFlipDisabled, toggleSectionFlip } = useGallery();

  // Group images by section for the section view
  const imagesBySection = sections.reduce<Record<string, any>>((acc, section) => {
    const sectionImages = images.filter((img: any) => img.section === section);
    if (sectionImages.length > 0 || sectionImageCounts[section] > 0) {
      acc[section] = sectionImages;
    }
    return acc;
  }, {} as Record<string, typeof images>);

  if (Object.keys(imagesBySection).length === 0) {
    return (
      <div className="text-center py-12 bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg">
        <p className="text-foreground/70">You haven&apos;t added any images yet</p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded-full flex items-center mx-auto"
          onClick={() => onAddImage('Memories')} // Default to Memories section
        >
          <FaPlus className="mr-2" />
          Add Your First Image
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(imagesBySection).map(([section, sectionImages]) => (
        <div key={section} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <FaHeart className="text-primary mr-2" />
              {section}
            </h2> 

            <div className="flex items-center space-x-4">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleSectionFlip(section)}
                title={sectionFlipDisabled[section] ? "Enable flip effect" : "Disable flip effect"}
              >
                {sectionFlipDisabled[section] ? (
                  <FaToggleOff className="text-gray-400 mr-1" size={16} />
                ) : (
                  <FaToggleOn className="text-green-500 mr-1" size={16} />
                )}
                <span className="text-xs">{sectionFlipDisabled[section] ? "Flip Off" : "Flip On"}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-primary text-white rounded-full flex items-center text-sm font-medium"
                onClick={() => onAddImage(section)}
              >
                <FaPlus className="mr-1" size={12} />
                Add Image
              </motion.button>

              {sectionImageCounts[section] > 6 && (
                <button
                  className="text-primary hover:underline text-sm font-medium"
                  onClick={() => onSelectSection(section)}
                >
                  View All ({sectionImageCounts[section] || (sectionImages as any[]).length})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(sectionImages as any[]).slice(0, 6).map((image) => (
              <motion.div
                key={image.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ImageCard
                  id={image.id}
                  imageUrl={image.url}
                  moment={image.moment}
                  section={image.section}
                  featured={image.featured}
                  description={image.description}
                  onView={() => onViewImage(image.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
