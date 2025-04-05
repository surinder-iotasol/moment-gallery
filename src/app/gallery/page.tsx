'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeart, FaPlus, FaFolderPlus, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';
import Navbar from '@/components/Navbar';
import ImageCard from '@/components/ImageCard';
import ImageUpload from '@/components/ImageUpload';
import ImageViewer from '@/components/ImageViewer';
import AddSectionModal from '@/components/AddSectionModal';
import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';
import VirtualizedGallery from '@/components/VirtualizedGallery';

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
    uploadingImage,
    sectionImageCounts,
    sectionFlipDisabled,
    toggleSectionFlip
  } = useGallery();
  const router = useRouter();

  // Log section counts when they change
  useEffect(() => {
    console.log('Gallery page - sectionImageCounts changed:', sectionImageCounts);
  }, [sectionImageCounts]);
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Images are fetched automatically by the GalleryContext when it mounts

  // Note: We're using VirtualizedGallery for filtered images now
  // Group images by section for the section view
  const imagesBySection = sections.reduce<Record<string, any>>((acc, section) => {
    const sectionImages = images.filter((img: any) => img.section === section);
    if (sectionImages.length > 0 || sectionImageCounts[section] > 0) {
      acc[section] = sectionImages;
    }
    return acc;
  }, {} as Record<string, typeof images>);

  console.log(images,'selectedSection')
  const handleViewImage = (imageId: string) => {
    setSelectedImageId(imageId);
    setViewerOpen(true);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FaHeart className="text-primary text-4xl mx-auto animate-pulse" />
          <p className="mt-4 text-foreground">Loading your romantic moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />

      <main className="container mx-auto px-4 pt-24 pb-32 relative">
        {/* Upload indicator */}
        {uploadingImage && (
          <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full flex items-center shadow-lg z-50">
            <FaSpinner className="animate-spin mr-2" />
            <span>Uploading image...</span>
          </div>
        )}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Your Romantic Moments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground/70 mt-2"
          >
            Cherish and relive your special memories
          </motion.p>
        </div>

        {/* Section Tabs */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Sections</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-white rounded-full flex items-center text-sm font-medium"
              onClick={() => setAddSectionModalOpen(true)}
            >
              <FaFolderPlus className="mr-2" />
              Create Section
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSection === null
                    ? 'bg-primary text-white'
                    : 'bg-white/80 dark:bg-[#2d1a1a]/80 text-foreground hover:bg-primary/10'
                }`}
                onClick={() => setSelectedSection(null)}
              >
                All Moments
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {sectionImageCounts['all'] || images.length}
                </span>
              </motion.button>

              {sections.map((section) => (
                <motion.button
                  key={section}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSection === section
                      ? 'bg-primary text-white'
                      : 'bg-white/80 dark:bg-[#2d1a1a]/80 text-foreground hover:bg-primary/10'
                  }`}
                  onClick={() => setSelectedSection(section)}
                >
                  {section}
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {sectionImageCounts[section] || images.filter(img => img.section === section).length}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {galleryLoading ? (
          <div className="text-center py-12">
            <FaHeart className="text-primary text-4xl mx-auto animate-pulse" />
            <p className="mt-4 text-foreground">Loading your images...</p>
          </div>
        ) : (
          <>
            {selectedSection !== null ? (
              /* Selected Section View */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center">
                    <FaHeart className="text-primary mr-2" />
                    {selectedSection}
                    {sectionImageCounts[selectedSection] > 0 && (
                      <span className="ml-2 text-sm text-foreground/70">
                        ({sectionImageCounts[selectedSection]} images)
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div
                      className="flex items-center cursor-pointer px-3 py-1.5 bg-white/10 dark:bg-white/5 hover:bg-white/20 rounded-full transition-colors border border-white/10 hover:border-white/20"
                      onClick={() => toggleSectionFlip(selectedSection)}
                      title={sectionFlipDisabled[selectedSection] ? "Enable flip effect" : "Disable flip effect"}
                    >
                      {sectionFlipDisabled[selectedSection] ? (
                        <FaToggleOff className="text-gray-400 mr-2" size={18} />
                      ) : (
                        <FaToggleOn className="text-green-500 mr-2" size={18} />
                      )}
                      <span className="text-sm font-medium">{sectionFlipDisabled[selectedSection] ? "Flip Off" : "Flip On"}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary text-white rounded-full flex items-center text-sm font-medium"
                      onClick={() => {
                        setUploadSectionName(selectedSection);
                        document.querySelector<HTMLButtonElement>('.upload-button')?.click();
                      }}
                    >
                      <FaPlus className="mr-2" />
                      Add Image
                    </motion.button>
                  </div>
                </div>


                {/* Virtualized Gallery for Selected Section */}
                <VirtualizedGallery
                  section={selectedSection}
                  onViewImage={handleViewImage}
                />
              </div>
            ) : (
              /* All Sections View */
              <div className="space-y-12">
                {Object.keys(imagesBySection).length === 0 ? (
                  <div className="text-center py-12 bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg">
                    <p className="text-foreground/70">You haven&apos;t added any images yet</p>
                    <button
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-full flex items-center mx-auto"
                      onClick={() => {
                        setUploadSectionName('Memories'); // Default to Memories section
                        document.querySelector<HTMLButtonElement>('.upload-button')?.click();
                      }}
                    >
                      <FaPlus className="mr-2" />
                      Add Your First Image
                    </button>
                  </div>
                ) : (
                  Object.entries(imagesBySection).map(([section, sectionImages]) => (
                    <div key={section} className="mb-8">
                      <div className="flex justify-between items-center mb-4">
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
                            onClick={() => {
                              setUploadSectionName(section);
                              document.querySelector<HTMLButtonElement>('.upload-button')?.click();
                            }}
                          >
                            <FaPlus className="mr-1" size={12} />
                            Add Image
                          </motion.button>

                          {sectionImages.length > 6 && (
                            <button
                              className="text-primary hover:underline text-sm font-medium"
                              onClick={() => setSelectedSection(section)}
                            >
                              View All ({sectionImageCounts[section] || sectionImages.length})
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sectionImages.slice(0, 6).map((image) => (
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
                              onView={() => handleViewImage(image.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
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
