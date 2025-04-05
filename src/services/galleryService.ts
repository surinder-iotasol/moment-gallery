import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc, 
  limit, 
  startAfter, 
  getCountFromServer,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/cloudinary';

// Define types
export interface Image {
  id: string;
  url: string;
  moment: string;
  section: string;
  createdAt: Date;
  userId: string;
  featured?: boolean;
  description?: string;
}

export interface SectionCount {
  section: string;
  count: number;
}

export interface ImageQueryResult {
  images: Image[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

// Constants
export const IMAGES_PER_BATCH = 9;
export const IMAGES_PER_SECTION = 6;
export const DEFAULT_SECTIONS = ['Favorites', 'Memories', 'Special Moments'];

// Gallery service functions
export const galleryService = {
  // Fetch images by section with pagination
  async fetchImagesBySection(userId: string, sectionName: string, limitCount: number, startAfterDoc?: QueryDocumentSnapshot<DocumentData>): Promise<ImageQueryResult> {
    try {
      let imageQuery = query(
        collection(db, 'images'),
        where('userId', '==', userId),
        where('section', '==', sectionName),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      // Add pagination if startAfterDoc is provided
      if (startAfterDoc) {
        imageQuery = query(
          collection(db, 'images'),
          where('userId', '==', userId),
          where('section', '==', sectionName),
          orderBy('createdAt', 'desc'),
          startAfter(startAfterDoc),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(imageQuery);
      const images: Image[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        images.push({
          id: doc.id,
          url: data.url,
          moment: data.moment,
          section: data.section,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          featured: data.featured || false,
          description: data.description || ''
        });
      });
      
      return { 
        images, 
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null 
      };
    } catch (error) {
      console.error('Error fetching images by section:', error);
      throw error;
    }
  },
  
  // Fetch all images with pagination
  async fetchAllImages(userId: string, limitCount: number, startAfterDoc?: QueryDocumentSnapshot<DocumentData>): Promise<ImageQueryResult> {
    try {
      let imageQuery = query(
        collection(db, 'images'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      // Add pagination if startAfterDoc is provided
      if (startAfterDoc) {
        imageQuery = query(
          collection(db, 'images'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          startAfter(startAfterDoc),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(imageQuery);
      const images: Image[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        images.push({
          id: doc.id,
          url: data.url,
          moment: data.moment,
          section: data.section,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          featured: data.featured || false,
          description: data.description || ''
        });
      });
      
      return { 
        images, 
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null 
      };
    } catch (error) {
      console.error('Error fetching all images:', error);
      throw error;
    }
  },
  
  // Fetch section counts
  async fetchSectionCounts(userId: string, sections: string[]): Promise<Record<string, number>> {
    try {
      const countsMap: Record<string, number> = {};
      
      // Get counts for each section
      const countPromises = sections.map(async (section) => {
        const countQuery = query(
          collection(db, 'images'),
          where('userId', '==', userId),
          where('section', '==', section)
        );
        
        const countSnapshot = await getCountFromServer(countQuery);
        return { section, count: countSnapshot.data().count };
      });
      
      // Get total count of all images
      const totalCountQuery = query(
        collection(db, 'images'),
        where('userId', '==', userId)
      );
      
      const totalCountSnapshot = await getCountFromServer(totalCountQuery);
      const totalCount = totalCountSnapshot.data().count;
      
      // Process the results
      const counts = await Promise.all(countPromises);
      counts.forEach(({ section, count }) => {
        countsMap[section] = count;
      });
      
      // Add the total count
      countsMap['all'] = totalCount;
      
      return countsMap;
    } catch (error) {
      console.error('Error fetching section counts:', error);
      throw error;
    }
  },
  
  // Fetch all sections
  async fetchSections(userId: string): Promise<string[]> {
    try {
      const sectionsQuery = query(
        collection(db, 'sections'),
        where('userId', '==', userId)
      );
      
      const sectionsSnapshot = await getDocs(sectionsQuery);
      const sectionNames = sectionsSnapshot.docs.map((doc) => doc.data().name);
      
      // Add default sections
      const allSections = new Set([
        ...sectionNames,
        ...DEFAULT_SECTIONS
      ]);
      
      return Array.from(allSections);
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  },
  
  // Add a new image
  async addImage(userId: string, file: File, moment: string, section: string, featured: boolean = false, description: string = ''): Promise<Image> {
    try {
      // Upload image to Cloudinary
      const uploadResult = await uploadImage(file);
      
      // Add image metadata to Firestore
      const imageData = {
        url: uploadResult.secure_url,
        moment,
        section,
        createdAt: new Date(),
        userId,
        featured,
        description: featured ? description : ''
      };
      
      const docRef = await addDoc(collection(db, 'images'), imageData);
      
      // Return the new image object
      return {
        id: docRef.id,
        ...imageData
      };
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  },
  
  // Delete an image
  async deleteImage(imageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'images', imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
  
  // Update image section
  async updateImageSection(imageId: string, newSection: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'images', imageId), {
        section: newSection
      });
    } catch (error) {
      console.error('Error updating image section:', error);
      throw error;
    }
  },
  
  // Update image moment
  async updateImageMoment(imageId: string, newMoment: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'images', imageId), {
        moment: newMoment
      });
    } catch (error) {
      console.error('Error updating image moment:', error);
      throw error;
    }
  },
  
  // Add a new section
  async addSection(userId: string, sectionName: string): Promise<void> {
    try {
      await addDoc(collection(db, 'sections'), {
        name: sectionName,
        userId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding section:', error);
      throw error;
    }
  },
  
  // Toggle featured status
  async toggleFeaturedStatus(imageId: string, currentFeaturedStatus: boolean, description?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'images', imageId), {
        featured: !currentFeaturedStatus,
        description: !currentFeaturedStatus && description ? description : ''
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  },
  
  // Update image description
  async updateImageDescription(imageId: string, description: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'images', imageId), {
        description
      });
    } catch (error) {
      console.error('Error updating image description:', error);
      throw error;
    }
  }
};
