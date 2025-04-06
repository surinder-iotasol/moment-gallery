'use client';

import { motion } from 'framer-motion';
import { FaUser, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { UserProfile } from '@/types/profile';

interface ProfileDetailsProps {
  profile: UserProfile;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function ProfileDetails({
  profile,
  handleInputChange
}: ProfileDetailsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-8 overflow-hidden"
    >
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
        <FaUser className="text-primary mr-2" />
        Profile Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-foreground/70 text-sm mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg bg-white/50 dark:bg-[#2d1a1a]/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your location"
          />
        </div>
        
        <div>
          <label className="block text-foreground/70 text-sm mb-1">Birthdate</label>
          <input
            type="date"
            name="birthdate"
            value={profile.birthdate}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg bg-white/50 dark:bg-[#2d1a1a]/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Social Media</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center text-foreground/70 text-sm mb-1">
            <FaInstagram className="mr-1" /> Instagram
          </label>
          <input
            type="text"
            name="instagram"
            value={profile.instagram}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg bg-white/50 dark:bg-[#2d1a1a]/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Username"
          />
        </div>
        
        <div>
          <label className="flex items-center text-foreground/70 text-sm mb-1">
            <FaFacebook className="mr-1" /> Facebook
          </label>
          <input
            type="text"
            name="facebook"
            value={profile.facebook}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg bg-white/50 dark:bg-[#2d1a1a]/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Username"
          />
        </div>
        
        <div>
          <label className="flex items-center text-foreground/70 text-sm mb-1">
            <FaTwitter className="mr-1" /> Twitter
          </label>
          <input
            type="text"
            name="twitter"
            value={profile.twitter}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg bg-white/50 dark:bg-[#2d1a1a]/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Username"
          />
        </div>
      </div>
    </motion.div>
  );
}
