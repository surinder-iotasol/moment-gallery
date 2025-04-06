'use client';

import { useGallery } from '@/context/GalleryContext';
import { motion } from 'framer-motion';
import { FaFolderPlus } from 'react-icons/fa';

interface SectionTabsProps {
  selectedSection: string | null;
  onSelectSection: (section: string | null) => void;
  onAddSectionClick: () => void;
}

export default function SectionTabs({
  selectedSection,
  onSelectSection,
  onAddSectionClick
}: SectionTabsProps) {
  const { sections, sectionImageCounts, images } = useGallery();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Sections</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary text-white rounded-full flex items-center text-sm font-medium"
          onClick={onAddSectionClick}
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
            className={`px-4 py-2 rounded-full min-w-fit text-sm font-medium transition-colors ${
              selectedSection === null
                ? 'bg-primary text-white'
                : 'bg-white/80 dark:bg-[#2d1a1a]/80 text-foreground hover:bg-primary/10'
            }`}
            onClick={() => onSelectSection(null)}
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
              className={`px-4 py-2 rounded-full text-sm font-medium min-w-fit transition-colors ${
                selectedSection === section
                  ? 'bg-primary text-white'
                  : 'bg-white/80 dark:bg-[#2d1a1a]/80 text-foreground hover:bg-primary/10'
              }`}
              onClick={() => onSelectSection(section)}
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
  );
}
