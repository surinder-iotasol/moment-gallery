import { Image } from '@/services/galleryService';

// Utility functions for managing gallery state

// Update section counts when adding an image
export const updateCountsOnAdd = (
  prevCounts: Record<string, number>,
  section: string
): Record<string, number> => {
  return {
    ...prevCounts,
    [section]: (prevCounts[section] || 0) + 1,
    'all': (prevCounts['all'] || 0) + 1
  };
};

// Update section counts when deleting an image
export const updateCountsOnDelete = (
  prevCounts: Record<string, number>,
  section: string
): Record<string, number> => {
  return {
    ...prevCounts,
    [section]: Math.max(0, (prevCounts[section] || 0) - 1),
    'all': Math.max(0, (prevCounts['all'] || 0) - 1)
  };
};

// Update section counts when changing an image's section
export const updateCountsOnSectionChange = (
  prevCounts: Record<string, number>,
  oldSection: string,
  newSection: string
): Record<string, number> => {
  return {
    ...prevCounts,
    [oldSection]: Math.max(0, (prevCounts[oldSection] || 0) - 1),
    [newSection]: (prevCounts[newSection] || 0) + 1
  };
};

// Filter out duplicate images
export const filterDuplicateImages = (
  existingImages: Image[],
  newImages: Image[]
): Image[] => {
  const existingIds = new Set(existingImages.map(img => img.id));
  return newImages.filter(img => !existingIds.has(img.id));
};

// Find featured images from a list of images
export const extractFeaturedImages = (images: Image[]): Image[] => {
  return images.filter(img => img.featured);
};

// Update an image in an array
export const updateImageInArray = (
  images: Image[],
  imageId: string,
  updates: Partial<Image>
): Image[] => {
  return images.map(img => 
    img.id === imageId ? { ...img, ...updates } : img
  );
};
