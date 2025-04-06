'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeart, FaPlus, FaFolderPlus, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import ImageViewer from '@/components/ImageViewer';
import AddSectionModal from '@/components/AddSectionModal';
import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';
import GalleryHeader from '@/components/gallery/GalleryHeader';
import SectionTabs from '@/components/gallery/SectionTabs';
import SectionView from '@/components/gallery/SectionView';
import AllSectionsView from '@/components/gallery/AllSectionsView';
import LoadingIndicator from '@/components/gallery/LoadingIndicator';
import UploadIndicator from '@/components/gallery/UploadIndicator';

export default function GalleryPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [heartDirection, setHeartDirection] = useState(50); // Default direction (middle)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [uploadSectionName, setUploadSectionName] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const {
    images,
    sections,
    loading: galleryLoading,
    uploadingImage
  } = useGallery();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleViewImage = (imageId: string) => {
    setSelectedImageId(imageId);
    setViewerOpen(true);
  };

  const handleAddImage = (section: string) => {
    setUploadSectionName(section);
    document.querySelector<HTMLButtonElement>('.upload-button')?.click();
  };

  if (authLoading || !user) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />

      <main className="container mx-auto px-4 pt-24 pb-32 relative">
        {/* Upload indicator */}
        {uploadingImage && <UploadIndicator />}

        {/* Gallery Header */}
        <GalleryHeader />

        {/* Section Tabs */}
        <SectionTabs
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          onAddSectionClick={() => setAddSectionModalOpen(true)}
        />

        {galleryLoading ? (
          <LoadingIndicator message="Loading your images..." />
        ) : (
          <>
            {selectedSection !== null ? (
              /* Selected Section View */
              <SectionView
                section={selectedSection}
                onViewImage={handleViewImage}
                onAddImage={handleAddImage}
              />
            ) : (
              /* All Sections View */
              <AllSectionsView
                onViewImage={handleViewImage}
                onAddImage={handleAddImage}
                onSelectSection={setSelectedSection}
              />
            )}
          </>
        )}
      </main>

      {/* Image Upload Component */}
      <ImageUpload defaultSection={uploadSectionName || undefined} />

      {/* Image Viewer */}
      <ImageViewer
        images={images}
        initialImageId={selectedImageId}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={addSectionModalOpen}
        onClose={() => setAddSectionModalOpen(false)}
      />
    </div>
  );
}
