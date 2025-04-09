// src/contexts/GalleryContext.tsx
'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchInitialDataRequest, addImageRequest, deleteImageRequest, updateImageSectionRequest, updateImageMomentRequest, addSectionRequest, loadMoreImagesRequest, toggleFlipOnHover, toggleSectionFlip, toggleFeaturedStatusRequest, updateImageDescriptionRequest } from '@/redux/gallery/gallerySlice';
import { selectGallery } from '@/redux/gallery/selector';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearError } from '@/redux/slices/authSlice';
import { Image } from '@/services/galleryService';


// Define the context type (keeping the same interface as before)
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
 // src/contexts/GalleryContext.tsx (continued)
 const context = useContext(GalleryContext);
 if (context === undefined) {
   throw new Error('useGallery must be used within a GalleryProvider');
 }
 return context;
}

// Gallery provider component
export function GalleryProvider({ children }: { children: ReactNode }) {
 // Get user from auth context
 const { user } = useAuth();
 
 // Use Redux hooks
 const dispatch = useAppDispatch();
 const {
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
 } = useAppSelector(selectGallery);

 // Fetch initial data when user changes
 useEffect(() => {
   if (user) {
     dispatch(fetchInitialDataRequest(user.uid));
   }
 }, [user, dispatch]);

 // Actions
 const addImage = async (
   file: File,
   moment: string,
   section: string,
   featured: boolean = false,
   description: string = ''
 ): Promise<string | undefined> => {
   if (!user) return;
   
   // Dispatch the action to add an image
   dispatch(addImageRequest({
     userId: user.uid,
     file,
     moment,
     section,
     featured,
     description
   }));
   
   // Note: We can't easily return the new image ID here because of the async Redux flow
   // A workaround would be to store the most recently added image ID in Redux and return it
   // For now, we'll return undefined
   return undefined;
 };

 const deleteImage = async (imageId: string): Promise<void> => {
   if (!user) return;
   
   dispatch(deleteImageRequest({
     userId: user.uid,
     imageId
   }));
 };

 const updateImageSection = async (imageId: string, newSection: string): Promise<void> => {
   if (!user) return;
   
   dispatch(updateImageSectionRequest({
     userId: user.uid,
     imageId,
     newSection
   }));
 };

 const updateImageMoment = async (imageId: string, newMoment: string): Promise<void> => {
   if (!user) return;
   
   dispatch(updateImageMomentRequest({
     userId: user.uid,
     imageId,
     newMoment
   }));
 };

 const addSection = async (sectionName: string): Promise<void> => {
   if (!user) return;
   
   dispatch(addSectionRequest({
     userId: user.uid,
     sectionName
   }));
 };

 const loadMoreImages = async (section?: string | null): Promise<void> => {
   if (!user) return;
   
   dispatch(loadMoreImagesRequest({
     userId: user.uid,
     section
   }));
 };

 const toggleFlipOnHoverHandler = (imageId: string): void => {
   dispatch(toggleFlipOnHover(imageId));
 };

 const toggleSectionFlipHandler = (section: string): void => {
   dispatch(toggleSectionFlip(section));
 };

 const toggleFeaturedStatus = async (imageId: string, description?: string): Promise<void> => {
   if (!user) return;
   
   dispatch(toggleFeaturedStatusRequest({
     userId: user.uid,
     imageId,
     description
   }));
 };

 const updateImageDescription = async (imageId: string, description: string): Promise<void> => {
   if (!user) return;
   
   dispatch(updateImageDescriptionRequest({
     userId: user.uid,
     imageId,
     description
   }));
 };

 const clearErrorHandler = () => {
   dispatch(clearError());
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
   toggleFlipOnHover: toggleFlipOnHoverHandler,
   toggleSectionFlip: toggleSectionFlipHandler,
   toggleFeaturedStatus,
   updateImageDescription,
   clearError: clearErrorHandler
 };

 return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}
