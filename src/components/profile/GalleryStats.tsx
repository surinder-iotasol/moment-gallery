'use client';

import { motion } from 'framer-motion';
import { FaHeart, FaImages } from 'react-icons/fa';

interface GalleryStatsProps {
  totalImages: number;
  sectionCount: number;
  sectionCounts: Record<string, number>;
}

export default function GalleryStats({
  totalImages,
  sectionCount,
  sectionCounts
}: GalleryStatsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
        <FaImages className="text-primary mr-2" />
        Your Gallery Stats
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
            <FaImages size={24} />
          </div>
          <div>
            <p className="text-foreground/70 text-sm">Total Images</p>
            <p className="text-2xl font-bold text-foreground">{totalImages}</p>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-[#2d1a1a]/50 rounded-lg p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
            <FaHeart size={24} />
          </div>
          <div>
            <p className="text-foreground/70 text-sm">Sections</p>
            <p className="text-2xl font-bold text-foreground">{sectionCount}</p>
          </div>
        </div>
      </div>
      
      {/* Section Breakdown */}
      {Object.keys(sectionCounts).length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-foreground mb-4">Section Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(sectionCounts).map(([section, count]) => (
              <div key={section} className="flex items-center">
                <div className="w-full bg-white/30 dark:bg-[#2d1a1a]/70 rounded-full h-4 mr-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / totalImages) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex justify-between items-center min-w-[100px]">
                  <span className="text-foreground">{section}</span>
                  <span className="text-foreground font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
