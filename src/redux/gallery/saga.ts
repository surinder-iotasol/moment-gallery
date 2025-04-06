// src/store/sagas/gallerySaga.ts
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { galleryService } from '@/services/galleryService';
import {
  fetchInitialDataRequest,
  setImages,
  setFeaturedImages,
  setSections,
  setSectionImageCounts,
  setFlipOnHoverSettings,
  setLoading,
  setError,
  setLastDoc,
  setSectionLastDoc,
  setHasMore,
  addImageRequest,
  setUploadingImage,
  addImages,
  updateImage,
  addSection as addSectionAction,
  incrementSectionCount,
  deleteImageRequest,
  removeImage,
  decrementSectionCount,
  updateImageSectionRequest,
  updateSectionCountOnMove,
  updateImageMomentRequest,
  addSectionRequest,
  loadMoreImagesRequest,
  setLoadingMore,
  toggleFeaturedStatusRequest,
  updateImageDescriptionRequest,
} from './gallerySlice';
import { toast } from 'react-hot-toast';
import { selectGallery } from './selector';


// Worker Sagas
function* fetchInitialDataSaga(action: PayloadAction<string>) {
  try {
    const userId = action.payload;
    
    // Fetch all sections
    const fetchedSections = yield call(galleryService.fetchSections, userId);
    yield put(setSections(fetchedSections));
    
    // Fetch section counts
    const sectionCounts = yield call(galleryService.fetchSectionCounts, userId, fetchedSections);
    yield put(setSectionImageCounts(sectionCounts));
    
    // Track all images in a set to avoid duplicates
    const allImageMap = new Map();
    const sectionDocs = {};
    const initialFlipSettings = {};
    const featuredImgs = [];
    
    // Fetch images for each section
    const sectionFetchPromises = fetchedSections.map(section => 
      call(galleryService.fetchImagesBySection, userId, section, galleryService.IMAGES_PER_SECTION)
    );
    
    const sectionResults = yield Promise.all(sectionFetchPromises);
    
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
    
    // Get all images for the main view
    const allImagesResult = yield call(
      galleryService.fetchAllImages, 
      userId, 
      galleryService.IMAGES_PER_BATCH
    );
    
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
      yield put(setLastDoc(allImagesResult.lastDoc));
      yield put(setHasMore(allImagesResult.images.length === galleryService.IMAGES_PER_BATCH));
    } else {
      yield put(setHasMore(false));
    }
    
    // Convert map to array and sort
    const allImagesArray = Array.from(allImageMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Update state with all fetched data
    yield put(setImages(allImagesArray));
    yield put(setFeaturedImages(featuredImgs));
    yield put(setFlipOnHoverSettings(initialFlipSettings));
    
    // Add section docs to state one by one
    for (const [section, doc] of Object.entries(sectionDocs)) {
      yield put(setSectionLastDoc({ section, doc }));
    }
    
  } catch (error) {
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}

function* addImageSaga(
  action: PayloadAction<{
    userId: string;
    file: File;
    moment: string;
    section: string;
    featured?: boolean;
    description?: string;
  }>
) {
  try {
    const { userId, file, moment, section, featured, description } = action.payload;
    
    // Add image using service
    const newImage = yield call(
      galleryService.addImage,
      userId,
      file,
      moment,
      section,
      featured,
      description
    );
    
    // Update local state
    yield put(addImages([newImage]));
    
    // Add section if it's new
    const gallery = yield select(selectGallery);
    if (!gallery.sections.includes(section)) {
      yield put(addSectionAction(section));
    }
    
    // Update flip settings
    const flipSettings = { [newImage.id]: true };
    yield put({ 
      type: setFlipOnHoverSettings.type, 
      payload: { ...gallery.flipOnHoverSettings, ...flipSettings } 
    });
    
    // Update section counts locally
    yield put(incrementSectionCount(section));
    
    // Show success toast
    toast.success('Image uploaded successfully!');
    
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to upload image. Please try again.');
  } finally {
    yield put(setUploadingImage(false));
  }
}

function* deleteImageSaga(action: PayloadAction<{ userId: string; imageId: string }>) {
  try {
    const { imageId } = action.payload;
    
    // Find the image to get its section before removing it
    const gallery = yield select(selectGallery);
    const imageToDelete = gallery.images.find(image => image.id === imageId);
    const imageSection = imageToDelete?.section;
    
    // Delete from Firestore
    yield call(galleryService.deleteImage, imageId);
    
    // Update local state
    yield put(removeImage(imageId));
    
    // Update section counts locally
    if (imageSection) {
      yield put(decrementSectionCount(imageSection));
    }
    
    // Show success toast
    toast.success('Image deleted successfully!');
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to delete image. Please try again.');
  } finally {
    yield put(setLoading(false));
  }
}

function* updateImageSectionSaga(
  action: PayloadAction<{
    userId: string;
    imageId: string;
    newSection: string;
  }>
) {
  try {
    const { imageId, newSection } = action.payload;
    
    // Find the image to get its old section
    const gallery = yield select(selectGallery);
    const imageToUpdate = gallery.images.find(image => image.id === imageId);
    if (!imageToUpdate) {
      throw new Error('Image not found');
    }
    
    const oldSection = imageToUpdate.section;
    
    // Update in Firestore
    yield call(galleryService.updateImageSection, imageId, newSection);
    
    // Update local state
    yield put(updateImage({ id: imageId, updates: { section: newSection } }));
    
    // Add section if it's new
    if (!gallery.sections.includes(newSection)) {
      yield put(addSectionAction(newSection));
    }
    
    // Update section counts locally
    if (oldSection !== newSection) {
      yield put(updateSectionCountOnMove({ oldSection, newSection }));
    }
    
    // Show success toast
    toast.success('Image moved to ' + newSection + '!');
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to update image section. Please try again.');
  } finally {
    yield put(setLoading(false));
  }
}

function* updateImageMomentSaga(
  action: PayloadAction<{
    userId: string;
    imageId: string;
    newMoment: string;
  }>
) {
  try {
    const { imageId, newMoment } = action.payload;
    
    // Update in Firestore
    yield call(galleryService.updateImageMoment, imageId, newMoment);
    
    // Update local state
    yield put(updateImage({ id: imageId, updates: { moment: newMoment } }));
    
    // Show success toast
    toast.success('Moment updated successfully!');
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to update moment. Please try again.');
  } finally {
    yield put(setLoading(false));
  }
}

function* addSectionSaga(action: PayloadAction<{ userId: string; sectionName: string }>) {
  try {
    const { userId, sectionName } = action.payload;
    
    // Get current sections
    const gallery = yield select(selectGallery);
    if (gallery.sections.includes(sectionName)) {
      return;
    }
    
    // Add section to Firestore
    yield call(galleryService.addSection, userId, sectionName);
    
    // Update local state
    yield put(addSectionAction(sectionName));
    
    // Show success toast
    toast.success(`New section '${sectionName}' added!`);
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to add section. Please try again.');
  } finally {
    yield put(setLoading(false));
  }
}

function* loadMoreImagesSaga(
  action: PayloadAction<{
    userId: string;
    section?: string | null;
  }>
) {
  try {
    const { userId, section } = action.payload;
    const gallery = yield select(selectGallery);
    
    let newImages = [];
    
    if (section) {
      // Load more images for a specific section
      const sectionLastDoc = gallery.sectionLastDocs[section];
      const result = yield call(
        galleryService.fetchImagesBySection,
        userId,
        section,
        galleryService.IMAGES_PER_BATCH,
        sectionLastDoc || undefined
      );
      
      newImages = result.images;
      
      // Update last document for this section
      if (result.lastDoc) {
        yield put(setSectionLastDoc({ section, doc: result.lastDoc }));
      }
    } else {
      // Load more images for all sections
      if (!gallery.lastDoc) {
        yield put(setHasMore(false));
        yield put(setLoadingMore(false));
        return;
      }
      
      const result = yield call(
        galleryService.fetchAllImages,
        userId,
        galleryService.IMAGES_PER_BATCH,
        gallery.lastDoc
      );
      
      newImages = result.images;
      
      // Update last document
      if (result.lastDoc) {
        yield put(setLastDoc(result.lastDoc));
      }
    }
    
    if (newImages.length === 0) {
      yield put(setHasMore(false));
      yield put(setLoadingMore(false));
      return;
    }
    
    // Update images
    yield put(addImages(newImages));
    
    // Update flip settings for new images only
    const newFlipSettings = {};
    newImages.forEach(image => {
      if (!gallery.flipOnHoverSettings[image.id]) {
        newFlipSettings[image.id] = true; // Default to flip on hover
      }
    });
    
    // Only update flip settings for new images
    if (Object.keys(newFlipSettings).length > 0) {
      yield put({
        type: setFlipOnHoverSettings.type,
        payload: { ...gallery.flipOnHoverSettings, ...newFlipSettings }
      });
    }
    
    // Update featured images if any new images are featured
    const newFeaturedImages = newImages.filter(img => img.featured);
    if (newFeaturedImages.length > 0) {
      const updatedFeaturedImages = [
        ...gallery.featuredImages,
        ...newFeaturedImages.filter(newImg => 
          !gallery.featuredImages.some(feat => feat.id === newImg.id)
        )
      ];
      yield put(setFeaturedImages(updatedFeaturedImages));
    }
    
    // Check if there are more images to load
    yield put(setHasMore(newImages.length === galleryService.IMAGES_PER_BATCH));
  } catch (error) {
    yield put(setError(error.message));
  } finally {
    yield put(setLoadingMore(false));
  }
}

function* toggleFeaturedStatusSaga(
  action: PayloadAction<{
    userId: string;
    imageId: string;
    description?: string;
  }>
) {
  try {
    const { imageId, description } = action.payload;
    
    // Find the image
    const gallery = yield select(selectGallery);
    const image = gallery.images.find(img => img.id === imageId);
    if (!image) {
      throw new Error('Image not found');
    }
    
    // Toggle featured status in Firestore
    yield call(
      galleryService.toggleFeaturedStatus,
      imageId,
      !!image.featured,
      description
    );
    
    // Toggle featured status locally
    const newFeaturedStatus = !image.featured;
    const newDescription = newFeaturedStatus && description ? description : image.description;
    
    // Update local state
    yield put(updateImage({ 
      id: imageId, 
      updates: { 
        featured: newFeaturedStatus, 
        description: newDescription 
      } 
    }));
    
    // Show success toast
    toast.success(newFeaturedStatus ? 'Image marked as featured!' : 'Image removed from featured!');
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to update featured status. Please try again.');
  } finally {
    yield put(setLoading(false));
  }
}

function* updateImageDescriptionSaga(
  action: PayloadAction<{
    userId: string;
    imageId: string;
    description: string;
  }>
) {
  try {
    const { imageId, description } = action.payload;
    
    // Update in Firestore
    yield call(galleryService.updateImageDescription, imageId, description);
    
    // Update local state
    yield put(updateImage({ id: imageId, updates: { description } }));
    
    // Show success toast
    toast.success('Description updated successfully!');
  } catch (error) {
    yield put(setError(error.message));
    toast.error('Failed to update description. Please try again.');
  } finally {
    yield put(setLoading(false));
  }
}

// Watcher Saga
export function* gallerySaga() {
  yield takeLatest(fetchInitialDataRequest.type, fetchInitialDataSaga);
  yield takeLatest(addImageRequest.type, addImageSaga);
  yield takeLatest(deleteImageRequest.type, deleteImageSaga);
  yield takeLatest(updateImageSectionRequest.type, updateImageSectionSaga);
  yield takeLatest(updateImageMomentRequest.type, updateImageMomentSaga);
  yield takeLatest(addSectionRequest.type, addSectionSaga);
  yield takeLatest(loadMoreImagesRequest.type, loadMoreImagesSaga);
  yield takeLatest(toggleFeaturedStatusRequest.type, toggleFeaturedStatusSaga);
  yield takeLatest(updateImageDescriptionRequest.type, updateImageDescriptionSaga);
}
