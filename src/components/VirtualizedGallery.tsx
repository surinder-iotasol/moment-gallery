'use client';

import { useEffect, useState, useCallback } from 'react';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { useGallery } from '@/context/GalleryContext';
import ImageCard from './ImageCard';

interface VirtualizedGalleryProps {
  section?: string | null;
  onViewImage: (imageId: string) => void;
}

export default function VirtualizedGallery({ section, onViewImage }: VirtualizedGalleryProps) {
  const { images, loadMoreImages, loadingMore, uploadingImage, hasMore, sectionImageCounts } = useGallery();
  const [filteredImages, setFilteredImages] = useState<typeof images>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
console.log(filteredImages,'filteredImages')
  // Filter images by section and load section-specific images if needed
  useEffect(() => {
    // Initial filtering of existing images
    if (section) {
      const sectionImages = images.filter(img => img.section === section);
      setFilteredImages(sectionImages);

      // Always try to load more images when a section is selected
      if (!initialLoadDone) {
        console.log(`Loading images for section ${section}. Current count: ${sectionImages.length}`);
        loadMoreImages(section);
        setInitialLoadDone(true);
      }
    } else {
      setFilteredImages(images);
    }
  }, [images, section, loadMoreImages, initialLoadDone]);

  // Reset initialLoadDone when section changes
  useEffect(() => {
    console.log(`Section changed to: ${section}`);
    setInitialLoadDone(false);
  }, [section]);

  // Load more images when reaching the end
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadMoreImages(section);
    }
  }, [loadingMore, hasMore, loadMoreImages, section]);

  // Render each image card
  const ItemRenderer = useCallback(
    (index: number) => {
      const image = filteredImages[index];
      if (!image) return null;

      return (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="p-2"
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
      );
    },
    [filteredImages, onViewImage]
  );

  // Render the footer with loading indicator
  const FooterRenderer = useCallback(() => {
    // If we're loading the initial batch for a section
    const isInitialSectionLoad = section &&
      filteredImages.length === 0 &&
      (sectionImageCounts[section] > 0 || loadingMore) &&
      !uploadingImage;

    if (isInitialSectionLoad) {
      return (
        <div className="flex flex-col justify-center items-center py-12 bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg">
          <FaSpinner className="animate-spin text-primary text-3xl mb-4" />
          <p className="text-foreground/70">Loading images...</p>
        </div>
      );
    }

    // Normal loading states
    return loadingMore ? (
      <div className="flex justify-center items-center py-4">
        <FaSpinner className="animate-spin text-primary text-2xl" />
      </div>
    ) : hasMore ? (
      <div className="flex justify-center items-center py-4">
        <button
          onClick={loadMore}
          className="px-4 py-2 bg-primary text-white rounded-full"
        >
          Load More
        </button>
      </div>
    ) : filteredImages.length > 0 ? (
      <div className="text-center py-4 text-foreground/70">
        No more images to load
      </div>
    ) : (
      <div className="text-center py-12 bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg">
        <p className="text-foreground/70">No images in this section yet</p>
      </div>
    );
  }, [loadingMore, hasMore, loadMore, filteredImages.length, section, sectionImageCounts, uploadingImage]);

  // If we're in a section with no images but there should be some, show a loading state
  if (section && filteredImages.length === 0 && sectionImageCounts[section] > 0 && loadingMore && !uploadingImage) {
    return (
      <div className="flex flex-col justify-center items-center py-12 bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg">
        <FaSpinner className="animate-spin text-primary text-3xl mb-4" />
        <p className="text-foreground/70">Loading images for {section}...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <VirtuosoGrid
        style={{ height: '100%', minHeight: '50vh' }}
        totalCount={filteredImages.length}
        useWindowScroll
        overscan={200}
        listClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
        itemClassName="w-full mb-4"
        itemContent={ItemRenderer}
        components={{
          Footer: FooterRenderer,
        }}
        endReached={loadMore}
      />
    </div>
  );
}
