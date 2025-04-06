'use client';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  DEFAULT_SECTIONS,
  galleryService,
  Image,
  IMAGES_PER_BATCH,
  IMAGES_PER_SECTION
} from '@/services/galleryService';
import {
  filterDuplicateImages,
  updateCountsOnAdd,
  updateCountsOnDelete,
  updateCountsOnSectionChange,
  updateImageInArray
} from '@/utils/galleryStateUtils';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Define the context type
interface GalleryContextType {
  // State
  images: Image[];
  featuredImages: Image[];
  sections: string[];
  loading: boolean;
  loadingMore: boolean;
  uploadingImage: boolean;
  hasMore: boolean;
  error: string | null;
  sectionImageCounts: Record<string, number>;
  flipOnHoverSettings: Record<string, boolean>;
  sectionFlipDisabled: Record<string, boolean>;

  // Actions
  addImage: (file: File, moment: string, section: string, featured?: boolean, description?: string) => Promise<string | undefined>;
  deleteImage: (imageId: string) => Promise<void>;
  updateImageSection: (imageId: string, newSection: string) => Promise<void>;
  updateImageMoment: (imageId: string, newMoment: string) => Promise<void>;
  addSection: (sectionName: string) => Promise<void>;
  loadMoreImages: (section?: string | null) => Promise<void>;
  toggleFlipOnHover: (imageId: string) => void;
  toggleSectionFlip: (section: string) => void;
  toggleFeaturedStatus: (imageId: string, description?: string) => Promise<void>;
  updateImageDescription: (imageId: string, description: string) => Promise<void>;
  clearError: () => void;
}

// Create the context
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Custom hook to use the gallery context
export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}

// Gallery provider component
export function GalleryProvider({ children }: { children: ReactNode }) {
  // State
  const [images, setImages] = useState<Image[]>([]);
  const [featuredImages, setFeaturedImages] = useState<Image[]>([]);
  const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [sectionLastDocs, setSectionLastDocs] = useState<Record<string, QueryDocumentSnapshot<DocumentData> | null>>({});
  const [sectionImageCounts, setSectionImageCounts] = useState<Record<string, number>>({});
  const [flipOnHoverSettings, setFlipOnHoverSettings] = useState<Record<string, boolean>>({});
  const [sectionFlipDisabled, setSectionFlipDisabled] = useState<Record<string, boolean>>({});

  // Get user from auth context
  const { user } = useAuth();

  // Use error handler
  const { error, setError, clearError, handleError } = useErrorHandler();

  // Fetch initial data when user changes
  useEffect(() => {
    if (!user) {
      setImages([]);
      setFeaturedImages([]);
      setSections(DEFAULT_SECTIONS);
      setSectionImageCounts({});
      setLoading(false);
      return;
    }
  
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Fetch all sections
        const fetchedSections = await galleryService.fetchSections(user.uid);
        setSections(fetchedSections);
  
        // Fetch section counts
        const sectionCounts = await galleryService.fetchSectionCounts(user.uid, fetchedSections);
        setSectionImageCounts(sectionCounts);
  
        // Track all images in a set to avoid duplicates
        const allImageMap = new Map<string, Image>();
        const sectionDocs: Record<string, QueryDocumentSnapshot<DocumentData> | null> = {};
        const initialFlipSettings: Record<string, boolean> = {};
        const featuredImgs: Image[] = [];
  
        // Fetch images for each section (limited to IMAGES_PER_SECTION)
        const sectionFetchPromises = fetchedSections.map(section =>
          galleryService.fetchImagesBySection(user.uid, section, IMAGES_PER_SECTION)
        );
  
        const sectionResults = await Promise.all(sectionFetchPromises);
  
        // Process results
        sectionResults.forEach((result, index) => {
          const section = fetchedSections[index];
          const { images, lastDoc } = result;
  
          // Add images to the map to avoid duplicates
          images.forEach(image => {
            allImageMap.set(image.id, image);
            
            // Set flip settings for each image
            initialFlipSettings[image.id] = true; // Default to flip on hover
  
            // Add to featured images if needed
            if (image.featured) {
              featuredImgs.push(image);
            }
          });
  
          // Store the last document for each section for pagination
          if (lastDoc) {
            sectionDocs[section] = lastDoc;
          }
        });
  
        // Get all images for the main view (limited to IMAGES_PER_BATCH)
        const allImagesResult = await galleryService.fetchAllImages(user.uid, IMAGES_PER_BATCH);
        
        // Add these images to our map too
        allImagesResult.images.forEach(image => {
          allImageMap.set(image.id, image);
          
          // Set flip settings
          initialFlipSettings[image.id] = true;
          
          // Add to featured if needed
          if (image.featured && !featuredImgs.some(feat => feat.id === image.id)) {
            featuredImgs.push(image);
          }
        });
  
        // Set last document for main pagination
        if (allImagesResult.lastDoc) {
          setLastDoc(allImagesResult.lastDoc);
          setHasMore(allImagesResult.images.length === IMAGES_PER_BATCH);
        } else {
          setHasMore(false);
        }
  
        // Convert map to array and sort
        const allImagesArray = Array.from(allImageMap.values())
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
        // Update state with all fetched data
        setImages(allImagesArray);
        setFeaturedImages(featuredImgs);
        setFlipOnHoverSettings(initialFlipSettings);
        setSectionLastDocs(sectionDocs);
  
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInitialData();
  
  }, [user, handleError, setError]);
  // Add a new image
  const addImage = async (
    file: File,
    moment: string,
    section: string,
    featured: boolean = false,
    description: string = ''
  ): Promise<string | undefined> => {
    if (!user) return;
  
    try {
      setUploadingImage(true);
      setError(null);
  
      // Add image using service
      const newImage = await galleryService.addImage(
        user.uid,
        file,
        moment,
        section,
        featured,
        description
      );
  
      // Update local state using mergeImageArrays to prevent duplicates
      setImages(prevImages => mergeImageArrays(prevImages, [newImage]));
  
      // Add to featured images if needed
      if (featured) {
        setFeaturedImages(prev => mergeImageArrays(prev, [newImage]));
      }
  
      // Add section if it's new
      if (!sections.includes(section)) {
        setSections(prevSections => [...prevSections, section]);
      }
  
      // Update flip settings
      setFlipOnHoverSettings(prev => ({ ...prev, [newImage.id]: true }));
  
      // Update section counts locally
      setSectionImageCounts(prev => updateCountsOnAdd(prev, section));
  
      // Show success toast
      toast.success('Image uploaded successfully!');
  
      return newImage.id;
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
      handleError(error);
    } finally {
      setUploadingImage(false);
    }
  };
  

  // Delete an image
  const deleteImage = async (imageId: string): Promise<void> => {
    if (!user) return;

    try {
      // setLoading(true);
      setError(null);

      // Find the image to get its section before removing it
      const imageToDelete = images.find(image => image.id === imageId);
      const imageSection = imageToDelete?.section;

      // Delete from Firestore
      await galleryService.deleteImage(imageId);

      // Update local state
      setImages(prevImages => prevImages.filter(image => image.id !== imageId));

      // Also remove from featured images if it was featured
      setFeaturedImages(prev => prev.filter(image => image.id !== imageId));

      // Update section counts locally
      if (imageSection) {
        setSectionImageCounts(prev => updateCountsOnDelete(prev, imageSection));
      }

      // Show success toast
      toast.success('Image deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete image. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update image section
  const updateImageSection = async (imageId: string, newSection: string): Promise<void> => {
    if (!user) return;
  
    try {
      setLoading(true);
      setError(null);
  
      // Find the image to get its old section
      const imageToUpdate = images.find(image => image.id === imageId);
      if (!imageToUpdate) {
        throw new Error('Image not found');
      }
      
      const oldSection = imageToUpdate.section;
  
      // Update in Firestore
      await galleryService.updateImageSection(imageId, newSection);
  
      // Create updated image
      const updatedImage = { ...imageToUpdate, section: newSection };
  
      // Update local state using mergeImageArrays
      setImages(prevImages => mergeImageArrays(
        prevImages.filter(img => img.id !== imageId), 
        [updatedImage]
      ));
  
      // Update featured images if needed
      if (updatedImage.featured) {
        setFeaturedImages(prev => mergeImageArrays(
          prev.filter(img => img.id !== imageId),
          [updatedImage]  
        ));
      }
  
      // Add section if it's new
      if (!sections.includes(newSection)) {
        setSections(prevSections => [...prevSections, newSection]);
      }
  
      // Update section counts locally
      if (oldSection !== newSection) {
        setSectionImageCounts(prev =>
          updateCountsOnSectionChange(prev, oldSection, newSection)
        );
      }
  
      // Show success toast
      toast.success('Image moved to ' + newSection + '!');
    } catch (error) {
      toast.error('Failed to update image section. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update image moment
  const updateImageMoment = async (imageId: string, newMoment: string): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Update in Firestore
      await galleryService.updateImageMoment(imageId, newMoment);

      // Update local state
      setImages(prevImages =>
        prevImages.map(image =>
          image.id === imageId ? { ...image, moment: newMoment } : image
        )
      );

      // Show success toast
      toast.success('Moment updated successfully!');
    } catch (error) {
      toast.error('Failed to update moment. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new section
  const addSection = async (sectionName: string): Promise<void> => {
    if (!user) return;
    if (sections.includes(sectionName)) return;

    try {
      setLoading(true);
      setError(null);

      // Add section to Firestore
      await galleryService.addSection(user.uid, sectionName);

      // Update local state
      setSections(prevSections => [...prevSections, sectionName]);

      // Show success toast
      toast.success(`New section '${sectionName}' added!`);
    } catch (error) {
      toast.error('Failed to add section. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Load more images (for infinite scrolling)
  const loadMoreImages = async (section?: string | null): Promise<void> => {
    if (!user || loadingMore) return;
  
    try {
      setLoadingMore(true);
      setError(null);
  
      let newImages: Image[] = [];
  
      if (section) {
        // Load more images for a specific section
        const sectionLastDoc = sectionLastDocs[section];
        const result = await galleryService.fetchImagesBySection(
          user.uid,
          section,
          IMAGES_PER_BATCH,
          sectionLastDoc || undefined
        );
  
        newImages = result.images;
  
        // Update last document for this section
        if (result.lastDoc) {
          setSectionLastDocs(prev => ({
            ...prev,
            [section]: result.lastDoc
          }));
        }
      } else {
        // Load more images for all sections
        if (!lastDoc) {
          setHasMore(false);
          setLoadingMore(false);
          return;
        }
  
        const result = await galleryService.fetchAllImages(
          user.uid,
          IMAGES_PER_BATCH,
          lastDoc
        );
  
        newImages = result.images;
  
        // Update last document
        if (result.lastDoc) {
          setLastDoc(result.lastDoc);
        }
      }
  
      if (newImages.length === 0) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
  
      // Use the improved helper function to merge images
      setImages(prevImages => mergeImageArrays(prevImages, newImages));
  
      // Update flip settings for new images only
      const newFlipSettings: Record<string, boolean> = {};
      newImages.forEach(image => {
        if (!flipOnHoverSettings[image.id]) {
          newFlipSettings[image.id] = true; // Default to flip on hover
        }
      });
      
      // Only update flip settings for new images
      if (Object.keys(newFlipSettings).length > 0) {
        setFlipOnHoverSettings(prev => ({ ...prev, ...newFlipSettings }));
      }
  
      // Update featured images if any new images are featured
      const newFeaturedImages = newImages.filter(img => img.featured);
      if (newFeaturedImages.length > 0) {
        setFeaturedImages(prev => mergeImageArrays(prev, newFeaturedImages));
      }
  
      // Check if there are more images to load
      setHasMore(newImages.length === IMAGES_PER_BATCH);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingMore(false);
    }
  };
  

  // Toggle flip on hover for an image
  const toggleFlipOnHover = (imageId: string): void => {
    setFlipOnHoverSettings(prev => ({
      ...prev,
      [imageId]: !prev[imageId]
    }));
  };

  // Toggle flip for all images in a section
  const toggleSectionFlip = (section: string): void => {
    setSectionFlipDisabled(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle featured status for an image
  const toggleFeaturedStatus = async (imageId: string, description?: string): Promise<void> => {
    if (!user) return;

    try {
      // setLoading(true);
      setError(null);

      // Find the image
      const image = images.find(img => img.id === imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Toggle featured status in Firestore
      await galleryService.toggleFeaturedStatus(
        imageId,
        !!image.featured,
        description
      );

      // Toggle featured status locally
      const newFeaturedStatus = !image.featured;
      const newDescription = newFeaturedStatus && description ? description : image.description;

      // Update image in images array
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId
            ? { ...img, featured: newFeaturedStatus, description: newDescription }
            : img
        )
      );

      // Update featured images
      if (newFeaturedStatus) {
        const updatedImage = { ...image, featured: true, description: newDescription };
        setFeaturedImages(prev => [updatedImage, ...prev.filter(img => img.id !== imageId)]);
      } else {
        setFeaturedImages(prev => prev.filter(img => img.id !== imageId));
      }

      // Show success toast
      toast.success(newFeaturedStatus ? 'Image marked as featured!' : 'Image removed from featured!');
    } catch (error) {
      toast.error('Failed to update featured status. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update image description
  const updateImageDescription = async (imageId: string, description: string): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Update in Firestore
      await galleryService.updateImageDescription(imageId, description);

      // Update local state
      const updatedImages = updateImageInArray(images, imageId, { description });
      setImages(updatedImages);

      // Update featured images if needed
      const updatedImage = updatedImages.find(img => img.id === imageId);
      if (updatedImage && updatedImage.featured) {
        setFeaturedImages(prev =>
          prev.map(img => img.id === imageId ? { ...img, description } : img)
        );
      }

      // Show success toast
      toast.success('Description updated successfully!');
    } catch (error) {
      toast.error('Failed to update description. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    images,
    featuredImages,
    sections,
    loading,
    loadingMore,
    uploadingImage,
    hasMore,
    error,
    sectionImageCounts,
    flipOnHoverSettings,
    sectionFlipDisabled,
    addImage,
    deleteImage,
    updateImageSection,
    updateImageMoment,
    addSection,
    loadMoreImages,
    toggleFlipOnHover,
    toggleSectionFlip,
    toggleFeaturedStatus,
    updateImageDescription,
    clearError
  };

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

export function mergeImageArrays(existingImages: Image[], newImages: Image[]): Image[] {
  // Create a map of existing images by ID for quick lookup
  const existingImageMap = new Map(existingImages.map(img => [img.id, img]));
  
  // Process new images
  newImages.forEach(newImg => {
    // If image already exists, use the newest version
    existingImageMap.set(newImg.id, newImg);
  });
  
  // Convert map back to array and sort by createdAt (newest first)
  return Array.from(existingImageMap.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
