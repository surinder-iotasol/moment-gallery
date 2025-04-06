import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  addImageStart, 
  addImageSuccess, 
  addImageFailure,
  deleteImageStart,
  deleteImageSuccess,
  deleteImageFailure,
  fetchInitialDataStart,
  fetchInitialDataSuccess,
  fetchInitialDataFailure,
  loadMoreImagesStart,
  loadMoreImagesSuccess,
  loadMoreImagesFailure,
  updateImageStart,
  updateImageSuccess,
  updateImageFailure,
  markImageAsFeaturedStart,
  markImageAsFeaturedSuccess,
  markImageAsFeaturedFailure,
  removeImageFromFeaturedStart,
  removeImageFromFeaturedSuccess,
  removeImageFromFeaturedFailure,
  addSectionStart,
  addSectionSuccess,
  addSectionFailure
} from '../slices/gallerySlice';
import { 
  DEFAULT_SECTIONS, 
  galleryService, 
  Image, 
  IMAGES_PER_BATCH, 
  IMAGES_PER_SECTION 
} from '@/services/galleryService';
import { AppDispatch, RootState } from '../store';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

// Define types for thunk parameters and return values
interface FetchInitialDataResult {
  images: Image[];
  featuredImages: Image[];
  sections: string[];
  sectionImageCounts: Record<string, number>;
  flipOnHoverSettings: Record<string, boolean>;
  sectionLastDocs: Record<string, QueryDocumentSnapshot<DocumentData>>;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

interface LoadMoreImagesParams {
  userId: string;
  section?: string;
}

interface LoadMoreImagesResult {
  newImages: Image[];
  section?: string;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

interface AddImageParams {
  userId: string;
  image: Omit<Image, 'id'>;
  file: File;
}

interface DeleteImageParams {
  userId: string;
  imageId: string;
  imageUrl: string;
}

interface DeleteImageResult {
  imageId: string;
  section: string;
}

interface UpdateImageParams {
  userId: string;
  imageId: string;
  updates: Partial<Image>;
}

interface UpdateImageResult {
  imageId: string;
  updates: Partial<Image>;
  oldSection?: string;
}

interface MarkImageAsFeaturedParams {
  userId: string;
  imageId: string;
}

interface MarkImageAsFeaturedResult {
  imageId: string;
  description: string;
}

interface RemoveImageFromFeaturedParams {
  userId: string;
  imageId: string;
}

interface AddSectionParams {
  userId: string;
  sectionName: string;
}

// Fetch initial data
export const fetchInitialData = (userId: string) => async (dispatch: AppDispatch): Promise<void> => {
  try {
    dispatch(fetchInitialDataStart(userId));

    // Fetch all sections
    const fetchedSections: string[] = await galleryService.fetchSections(userId);
    
    // Fetch section counts
    const sectionCounts: Record<string, number> = await galleryService.fetchSectionCounts(userId, fetchedSections);
    
    // Track all images in a set to avoid duplicates
    const allImageMap: Map<string, Image> = new Map<string, Image>();
    const sectionDocs: Record<string, QueryDocumentSnapshot<DocumentData>> = {};
    const initialFlipSettings: Record<string, boolean> = {};
    const featuredImgs: Image[] = [];

    // Fetch images for each section (limited to IMAGES_PER_SECTION)
    const sectionFetchPromises: Promise<{
      images: Image[];
      lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    }>[] = fetchedSections.map(section =>
      galleryService.fetchImagesBySection(userId, section, IMAGES_PER_SECTION)
    );

    const sectionResults = await Promise.all(sectionFetchPromises);

    // Process results
    sectionResults.forEach((result, index) => {
      const section: string = fetchedSections[index];
      const { images, lastDoc } = result;

      // Add images to the map to avoid duplicates
      images.forEach((image: Image) => {
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
    const allImagesResult = await galleryService.fetchAllImages(userId, IMAGES_PER_BATCH);
    
    // Add these images to our map too
    allImagesResult.images.forEach((image: Image) => {
      allImageMap.set(image.id, image);
      
      // Set flip settings
      initialFlipSettings[image.id] = true;
      
      // Add to featured if needed
      if (image.featured && !featuredImgs.some(feat => feat.id === image.id)) {
        featuredImgs.push(image);
      }
    });

    // Convert map to array and sort
    const allImagesArray: Image[] = Array.from(allImageMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Dispatch success action with all fetched data
    dispatch(fetchInitialDataSuccess({
      images: allImagesArray,
      featuredImages: featuredImgs,
      sections: fetchedSections,
      sectionImageCounts: sectionCounts,
      flipOnHoverSettings: initialFlipSettings,
      sectionLastDocs: sectionDocs,
      lastDoc: allImagesResult.lastDoc,
      hasMore: allImagesResult.images.length === IMAGES_PER_BATCH
    }));
  } catch (error: unknown) {
    console.error('Error fetching initial data:', error);
    dispatch(fetchInitialDataFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Load more images
export const loadMoreImages = (
  { userId, section }: LoadMoreImagesParams
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  try {
    dispatch(loadMoreImagesStart({ userId, section }));
    
    const state: RootState = getState();
    let newImages: Image[] = [];
    let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
    
    if (section) {
      // Load more images for a specific section
      const sectionLastDoc: QueryDocumentSnapshot<DocumentData> | null = state.gallery.sectionLastDocs[section];
      const result = await galleryService.fetchImagesBySection(
        userId,
        section,
        IMAGES_PER_BATCH,
        sectionLastDoc || undefined
      );
      
      newImages = result.images;
      lastDoc = result.lastDoc;
    } else {
      // Load more images for all sections
      if (!state.gallery.lastDoc) {
        dispatch(loadMoreImagesFailure('No last document available for pagination'));
        return;
      }
      
      const result = await galleryService.fetchAllImages(
        userId,
        IMAGES_PER_BATCH,
        state.gallery.lastDoc
      );
      
      newImages = result.images;
      lastDoc = result.lastDoc;
    }
    
    // Dispatch success action
    dispatch(loadMoreImagesSuccess({
      newImages,
      section,
      lastDoc,
      hasMore: newImages.length === IMAGES_PER_BATCH
    }));
  } catch (error: unknown) {
    console.error('Error loading more images:', error);
    dispatch(loadMoreImagesFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Add image
export const addImage = (
  { userId, image, file }: AddImageParams
) => async (dispatch: AppDispatch): Promise<void> => {
  try {
    dispatch(addImageStart({ userId, image, file }));
    
    // Add image using service
    const newImage: Image = await galleryService.addImage(
      userId,
      file,
      image.moment,
      image.section,
      image.featured,
      image.description
    );
    
    // Dispatch success action
    dispatch(addImageSuccess(newImage));
  } catch (error: unknown) {
    console.error('Error adding image:', error);
    dispatch(addImageFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Delete image
export const deleteImage = (
  { userId, imageId, imageUrl }: DeleteImageParams
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  try {
    dispatch(deleteImageStart({ userId, imageId, imageUrl }));
    
    // Find the image to get its section
    const state: RootState = getState();
    const imageToDelete: Image | undefined = state.gallery.images.find(img => img.id === imageId);
    
    if (!imageToDelete) {
      dispatch(deleteImageFailure('Image not found'));
      return;
    }
    
    // Delete from Firestore
    await galleryService.deleteImage(imageId);
    
    // Dispatch success action
    dispatch(deleteImageSuccess({
      imageId,
      section: imageToDelete.section
    }));
  } catch (error: unknown) {
    console.error('Error deleting image:', error);
    dispatch(deleteImageFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Update image
export const updateImage = (
  { userId, imageId, updates }: UpdateImageParams
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  try {
    dispatch(updateImageStart({ userId, imageId, updates }));
    
    // Find the image to get its current state
    const state: RootState = getState();
    const imageToUpdate: Image | undefined = state.gallery.images.find(img => img.id === imageId);
    
    if (!imageToUpdate) {
      dispatch(updateImageFailure('Image not found'));
      return;
    }
    
    // Track old section if section is being updated
    const oldSection: string | undefined = updates.section ? imageToUpdate.section : undefined;
    
    // Update in Firestore based on what's being updated
    if (updates.section) {
      await galleryService.updateImageSection(imageId, updates.section);
    }
    
    if (updates.moment) {
      await galleryService.updateImageMoment(imageId, updates.moment);
    }
    
    if (updates.description !== undefined) {
      await galleryService.updateImageDescription(imageId, updates.description);
    }
    
    if (updates.featured !== undefined) {
      await galleryService.toggleFeaturedStatus(
        imageId,
        !updates.featured, // If we're setting featured to true, then current state is false
        updates.description
      );
    }
    
    // Dispatch success action
    dispatch(updateImageSuccess({
      imageId,
      updates,
      oldSection
    }));
  } catch (error: unknown) {
    console.error('Error updating image:', error);
    dispatch(updateImageFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Mark image as featured
export const markImageAsFeatured = (
  { userId, imageId }: MarkImageAsFeaturedParams
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  try {
    dispatch(markImageAsFeaturedStart({ userId, imageId }));
    
    // Find the image
    const state: RootState = getState();
    const image: Image | undefined = state.gallery.images.find(img => img.id === imageId);
    
    if (!image) {
      dispatch(markImageAsFeaturedFailure('Image not found'));
      return;
    }
    
    // Toggle featured status in Firestore
    await galleryService.toggleFeaturedStatus(
      imageId,
      false, // Current state is not featured
      image.description
    );
    
    // Dispatch success action
    dispatch(markImageAsFeaturedSuccess({
      imageId,
      description: image.description || ''
    }));
  } catch (error: unknown) {
    console.error('Error marking image as featured:', error);
    dispatch(markImageAsFeaturedFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Remove image from featured
export const removeImageFromFeatured = (
  { userId, imageId }: RemoveImageFromFeaturedParams
) => async (dispatch: AppDispatch): Promise<void> => {
  try {
    dispatch(removeImageFromFeaturedStart({ userId, imageId }));
    
    // Toggle featured status in Firestore
    await galleryService.toggleFeaturedStatus(
      imageId,
      true, // Current state is featured
      ''
    );
    
    // Dispatch success action
    dispatch(removeImageFromFeaturedSuccess(imageId));
  } catch (error: unknown) {
    console.error('Error removing image from featured:', error);
    dispatch(removeImageFromFeaturedFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Add section
export const addSection = (
  { userId, sectionName }: AddSectionParams
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  try {
    // Check if section already exists
    const state: RootState = getState();
    if (state.gallery.sections.includes(sectionName)) {
      return; // Section already exists, no need to add
    }
    
    dispatch(addSectionStart({ userId, sectionName }));
    
    // Add section to Firestore
    await galleryService.addSection(userId, sectionName);
    
    // Dispatch success action
    dispatch(addSectionSuccess(sectionName));
  } catch (error: unknown) {
    console.error('Error adding section:', error);
    dispatch(addSectionFailure(error instanceof Error ? error.message : 'Unknown error'));
  }
};
