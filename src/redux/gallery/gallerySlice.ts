// src/store/features/gallerySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Image } from '@/services/galleryService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { DEFAULT_SECTIONS, IMAGES_PER_BATCH } from '@/services/galleryService';

interface GalleryState {
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
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  sectionLastDocs: Record<string, QueryDocumentSnapshot<DocumentData> | null>;
}

const initialState: GalleryState = {
  images: [],
  featuredImages: [],
  sections: DEFAULT_SECTIONS,
  loading: false,
  loadingMore: false,
  uploadingImage: false,
  hasMore: true,
  error: null,
  sectionImageCounts: {},
  flipOnHoverSettings: {},
  sectionFlipDisabled: {},
  lastDoc: null,
  sectionLastDocs: {},
};

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.loadingMore = action.payload;
    },
    setUploadingImage: (state, action: PayloadAction<boolean>) => {
      state.uploadingImage = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Pagination
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setLastDoc: (state, action: PayloadAction<QueryDocumentSnapshot<DocumentData> | null>) => {
      state.lastDoc = action.payload;
    },
    setSectionLastDoc: (state, action: PayloadAction<{section: string, doc: QueryDocumentSnapshot<DocumentData> | null}>) => {
      state.sectionLastDocs = {
        ...state.sectionLastDocs,
        [action.payload.section]: action.payload.doc
      };
    },
    
    // Image actions
    setImages: (state, action: PayloadAction<Image[]>) => {
      state.images = action.payload;
    },
    addImages: (state, action: PayloadAction<Image[]>) => {
      // Create a map of existing images by ID for quick lookup
      const existingImageMap = new Map(state.images.map(img => [img.id, img]));
      
      // Add new images
      action.payload.forEach(newImg => {
        existingImageMap.set(newImg.id, newImg);
      });
      
      // Convert map back to array and sort
      state.images = Array.from(existingImageMap.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    removeImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter(img => img.id !== action.payload);
      state.featuredImages = state.featuredImages.filter(img => img.id !== action.payload);
    },
    updateImage: (state, action: PayloadAction<{id: string, updates: Partial<Image>}>) => {
      const { id, updates } = action.payload;
      
      // Update in main images array
      state.images = state.images.map(img => 
        img.id === id ? { ...img, ...updates } : img
      );
      
      // Update in featured images if needed
      if (state.featuredImages.some(img => img.id === id)) {
        state.featuredImages = state.featuredImages.map(img => 
          img.id === id ? { ...img, ...updates } : img
        );
      }
      
      // Handle featured status change
      const updatedImage = state.images.find(img => img.id === id);
      if (updatedImage) {
        if ('featured' in updates) {
          if (updates.featured && !state.featuredImages.some(img => img.id === id)) {
            // Add to featured
            state.featuredImages.push(updatedImage);
          } else if (!updates.featured) {
            // Remove from featured
            state.featuredImages = state.featuredImages.filter(img => img.id !== id);
          }
        }
      }
    },
    
    // Featured images
    setFeaturedImages: (state, action: PayloadAction<Image[]>) => {
      state.featuredImages = action.payload;
    },
    
    // Sections
    setSections: (state, action: PayloadAction<string[]>) => {
      state.sections = action.payload;
    },
    addSection: (state, action: PayloadAction<string>) => {
      if (!state.sections.includes(action.payload)) {
        state.sections.push(action.payload);
      }
    },
    
    // Section counts
    setSectionImageCounts: (state, action: PayloadAction<Record<string, number>>) => {
      state.sectionImageCounts = action.payload;
    },
    updateSectionCount: (state, action: PayloadAction<{section: string, count: number}>) => {
      state.sectionImageCounts = {
        ...state.sectionImageCounts,
        [action.payload.section]: action.payload.count
      };
    },
    incrementSectionCount: (state, action: PayloadAction<string>) => {
      const section = action.payload;
      state.sectionImageCounts = {
        ...state.sectionImageCounts,
        [section]: (state.sectionImageCounts[section] || 0) + 1
      };
    },
    decrementSectionCount: (state, action: PayloadAction<string>) => {
      const section = action.payload;
      state.sectionImageCounts = {
        ...state.sectionImageCounts,
        [section]: Math.max(0, (state.sectionImageCounts[section] || 0) - 1)
      };
    },
    updateSectionCountOnMove: (state, action: PayloadAction<{oldSection: string, newSection: string}>) => {
      const { oldSection, newSection } = action.payload;
      state.sectionImageCounts = {
        ...state.sectionImageCounts,
        [oldSection]: Math.max(0, (state.sectionImageCounts[oldSection] || 0) - 1),
        [newSection]: (state.sectionImageCounts[newSection] || 0) + 1
      };
    },
    
    // Flip settings
    setFlipOnHoverSettings: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.flipOnHoverSettings = action.payload;
    },
    toggleFlipOnHover: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.flipOnHoverSettings = {
        ...state.flipOnHoverSettings,
        [imageId]: !state.flipOnHoverSettings[imageId]
      };
    },
    setSectionFlipDisabled: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.sectionFlipDisabled = action.payload;
    },
    toggleSectionFlip: (state, action: PayloadAction<string>) => {
      const section = action.payload;
      state.sectionFlipDisabled = {
        ...state.sectionFlipDisabled,
        [section]: !state.sectionFlipDisabled[section]
      };
    },
    
    // Action Triggers (for Sagas)
    fetchInitialDataRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    addImageRequest: (state, action: PayloadAction<{
      userId: string;
      file: File;
      moment: string;
      section: string;
      featured?: boolean;
      description?: string;
    }>) => {
      state.uploadingImage = true;
      state.error = null;
    },
    deleteImageRequest: (state, action: PayloadAction<{userId: string; imageId: string}>) => {
      state.error = null;
    },
    updateImageSectionRequest: (state, action: PayloadAction<{
      userId: string;
      imageId: string;
      newSection: string;
    }>) => {
      state.loading = true;
      state.error = null;
    },
    updateImageMomentRequest: (state, action: PayloadAction<{
      userId: string;
      imageId: string;
      newMoment: string;
    }>) => {
      state.loading = true;
      state.error = null;
    },
    addSectionRequest: (state, action: PayloadAction<{userId: string; sectionName: string}>) => {
      state.loading = true;
      state.error = null;
    },
    loadMoreImagesRequest: (state, action: PayloadAction<{
      userId: string;
      section?: string | null;
    }>) => {
      state.loadingMore = true;
      state.error = null;
    },
    toggleFeaturedStatusRequest: (state, action: PayloadAction<{
      userId: string;
      imageId: string;
      description?: string;
    }>) => {
      state.error = null;
    },
    updateImageDescriptionRequest: (state, action: PayloadAction<{
      userId: string;
      imageId: string;
      description: string;
    }>) => {
      state.loading = true;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setLoadingMore,
  setUploadingImage,
  setError,
  clearError,
  setHasMore,
  setLastDoc,
  setSectionLastDoc,
  setImages,
  addImages,
  removeImage,
  updateImage,
  setFeaturedImages,
  setSections,
  addSection,
  setSectionImageCounts,
  updateSectionCount,
  incrementSectionCount,
  decrementSectionCount,
  updateSectionCountOnMove,
  setFlipOnHoverSettings,
  toggleFlipOnHover,
  setSectionFlipDisabled,
  toggleSectionFlip,
  // Saga action triggers
  fetchInitialDataRequest,
  addImageRequest,
  deleteImageRequest,
  updateImageSectionRequest,
  updateImageMomentRequest,
  addSectionRequest,
  loadMoreImagesRequest,
  toggleFeaturedStatusRequest,
  updateImageDescriptionRequest,
} = gallerySlice.actions;

// Export reducer
export default gallerySlice.reducer;

