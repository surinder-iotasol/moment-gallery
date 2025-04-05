'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaHeart } from 'react-icons/fa';
import { useGallery } from '@/context/GalleryContext';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSectionModal({ isOpen, onClose }: AddSectionModalProps) {
  const [sectionName, setSectionName] = useState('');
  const [error, setError] = useState('');
  const { sections, addSection } = useGallery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate section name
    if (!sectionName.trim()) {
      setError('Please enter a section name');
      return;
    }
    
    // Check if section already exists
    if (sections.includes(sectionName.trim())) {
      setError('This section already exists');
      return;
    }
    
    // Add the new section
    addSection(sectionName.trim());
    
    // Reset form and close modal
    setSectionName('');
    setError('');
    onClose();
  };

  return (
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
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <FaHeart className="text-primary mr-2" />
                Create New Section
              </h2>
              <button
                onClick={onClose}
                className="text-foreground/70 hover:text-primary"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="sectionName" className="block text-sm font-medium text-foreground/80 mb-1">
                  Section Name
                </label>
                <input
                  id="sectionName"
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="Enter a name for your new section"
                  className="w-full p-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-primary/30 rounded-md text-foreground hover:bg-primary/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Create Section
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
