'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaImage, FaTimes } from 'react-icons/fa';
import { useGallery } from '@/context/GalleryContext';

interface ImageUploadProps {
  defaultSection?: string;
}

export default function ImageUpload({ defaultSection }: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [sharedMoment, setSharedMoment] = useState(true); // Toggle for shared moment description
  const [moment, setMoment] = useState('');
  const [section, setSection] = useState(defaultSection || '');
  const [customSection, setCustomSection] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');

  const { addImage, sections } = useGallery();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Create previews for all files
      const newFiles = [...selectedFiles, ...acceptedFiles];
      setSelectedFiles(newFiles);

      // Generate preview URLs for the new files
      const newPreviewPromises = acceptedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      // Add new previews to existing ones
      Promise.all(newPreviewPromises).then(newPreviews => {
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviews]);
      });
    }
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true, // Allow multiple files
    maxFiles: 10, // Limit to 10 files at once
    maxSize: 5 * 1024 * 1024 // 5MB max file size
  });

  // Handle file rejection errors
  useEffect(() => {
    if (fileRejections.length > 0) {
      const errors = fileRejections.map(rejection => {
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          return `${rejection.file.name} is too large (max 5MB)`;
        } else if (rejection.errors.some(e => e.code === 'too-many-files')) {
          return 'Too many files selected (max 10)';
        } else {
          return `${rejection.file.name} is not a valid image file`;
        }
      });
      setUploadError(errors.join('. '));

      // Clear error after 5 seconds
      const timer = setTimeout(() => setUploadError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [fileRejections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0 || !moment) return;

    try {
      setIsUploading(true);
      setIsOpen(false);
      // Determine which section to use
      const finalSection = section === 'custom' ? customSection : section;

      // Make sure we have a valid section
      const sectionToUse = finalSection && finalSection.trim() ? finalSection.trim() : 'Memories';

      // Upload all images
      const uploadPromises = selectedFiles.map(file => {
        // If shared moment is enabled, use the same moment for all images
        // Otherwise, we'd need individual moments for each image (not implemented in this version)
        return addImage(file, moment, sectionToUse, featured, description);
      });

      await Promise.all(uploadPromises);

      // Reset form
      setSelectedFiles([]);
      setPreviewUrls([]);
      setMoment('');
      setSection('');
      setCustomSection('');
      setFeatured(false);
      setDescription('');
      setIsOpen(false);

      console.log(`${selectedFiles.length} images uploaded successfully to section:`, sectionToUse);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to open the upload modal
  const openUploadModal = useCallback(() => {
    // If a default section was provided, set it
    if (defaultSection && section !== defaultSection) {
      setSection(defaultSection);
    }
    setIsOpen(true);
  }, [defaultSection, section]);

  return (
    <>
      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-8 z-40 bg-primary text-white rounded-full p-4 shadow-lg upload-button"
        onClick={openUploadModal}
      >
        <FaCloudUploadAlt size={24} />
      </motion.button>

      {/* Upload Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card-bg dark:bg-[#3a2222] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-primary/20">
                <h2 className="text-xl font-semibold text-foreground">Add a Romantic Moment</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/70 hover:text-primary"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                {/* Error message */}
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded">
                    {uploadError}
                  </div>
                )}

                {/* Image Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/10'
                      : uploadError
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                        : 'border-primary/30 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />

                  {previewUrls.length > 0 ? (
                    <div>
                      <div className="flex flex-wrap justify-center gap-2 mb-3">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative w-24 h-24">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove this image from the arrays
                                setSelectedFiles(files => files.filter((_, i) => i !== index));
                                setPreviewUrls(urls => urls.filter((_, i) => i !== index));
                              }}
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-foreground/70">
                        {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'} selected.
                        Click or drag to add more.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FaImage size={48} className="text-primary/70 mb-2" />
                      <p className="text-foreground/70">
                        {isDragActive
                          ? "Drop your images here..."
                          : "Drag & drop images, or click to select"}
                      </p>
                      <p className="text-sm text-foreground/70 mt-2">
                        You can select multiple images at once
                      </p>
                    </div>
                  )}
                </div>

                {/* Moment Description */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="moment" className="block text-sm font-medium text-foreground/80">
                      {selectedFiles.length > 1 && sharedMoment
                        ? 'Describe these moments (shared description)'
                        : 'Describe this moment'}
                    </label>
                    {selectedFiles.length > 1 && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sharedMoment"
                          checked={sharedMoment}
                          onChange={() => setSharedMoment(!sharedMoment)}
                          className="mr-2"
                        />
                        <label htmlFor="sharedMoment" className="text-xs text-foreground/80">
                          Use same description for all images
                        </label>
                      </div>
                    )}
                  </div>
                  <textarea
                    id="moment"
                    value={moment}
                    onChange={(e) => setMoment(e.target.value)}
                    placeholder="What makes this moment special?"
                    className="w-full p-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80"
                    rows={3}
                    required
                  />
                </div>

                {/* Section Selection */}
                <div className="mb-4">
                  <label htmlFor="section" className="block text-sm font-medium text-foreground/80 mb-1">
                    Choose a section
                  </label>
                  <select
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full p-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80"
                  >
                    <option value="">Select a section</option>
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="custom">Create new section</option>
                  </select>
                </div>

                {/* Custom Section Input */}
                {section === 'custom' && (
                  <div className="mb-4">
                    <label htmlFor="customSection" className="block text-sm font-medium text-foreground/80 mb-1">
                      New section name
                    </label>
                    <input
                      id="customSection"
                      type="text"
                      value={customSection}
                      onChange={(e) => setCustomSection(e.target.value)}
                      placeholder="Enter a name for your new section"
                      className="w-full p-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80"
                      required
                    />
                  </div>
                )}

                {/* Featured Option */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featured}
                      onChange={() => setFeatured(!featured)}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-primary/30 rounded"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-foreground/80">
                      Feature this {selectedFiles.length > 1 ? 'collection' : 'image'} on homepage
                    </label>
                  </div>
                </div>

                {/* Description for Featured Images */}
                {featured && (
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-foreground/80 mb-1">
                      Description (shown on homepage)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a special description for your featured image"
                      className="w-full p-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80 min-h-[80px]"
                    />
                    <p className="text-xs text-foreground/60 mt-1">
                      This description will be displayed when your image is featured on the homepage.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0 || !moment || isUploading}
                  className={`w-full py-2 rounded-md text-white font-medium transition-colors ${
                    selectedFiles.length === 0 || !moment || isUploading
                      ? 'bg-primary/50 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {isUploading
                    ? 'Uploading...'
                    : `Save ${selectedFiles.length > 1 ? `${selectedFiles.length} Moments` : 'Moment'}`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
