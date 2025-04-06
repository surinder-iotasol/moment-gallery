'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCamera, FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { UserProfile } from '@/types/profile';

interface ProfileHeaderProps {
  user: any;
  profile: UserProfile;
  isEditing: boolean;
  imagePreview: string | null;
  setIsEditing: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProfileUpdate: () => void;
  handleCancelEdit: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({
  user,
  profile,
  isEditing,
  imagePreview,
  setIsEditing,
  handleInputChange,
  handleProfileUpdate,
  handleCancelEdit,
  handleImageUpload
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-gradient-to-r from-primary-dark to-primary p-6 text-white relative">
      {/* Edit Button */}
      {!isEditing ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Edit profile"
        >
          <FaEdit size={18} />
        </motion.button>
      ) : (
        <div className="absolute top-4 right-4 flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProfileUpdate}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Save profile"
          >
            <FaSave size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelEdit}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Cancel editing"
          >
            <FaTimes size={18} />
          </motion.button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Profile Image */}
        <div className="relative group">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white border-4 border-white/30">
            {imagePreview ? (
              <Image 
                src={imagePreview} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            ) : (
              <FaUser size={50} />
            )}
          </div>
          
          {isEditing && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCamera size={24} />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>
        
        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
          {isEditing ? (
            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              onChange={handleInputChange}
              className="text-2xl font-bold bg-transparent border-b border-white/50 focus:border-white outline-none text-white text-center md:text-left w-full"
              placeholder="Your name"
            />
          ) : (
            <h1 className="text-2xl font-bold">{profile.displayName || user.displayName || 'User'}</h1>
          )}
          
          <p className="text-white/80 flex items-center mt-1 justify-center md:justify-start">
            <FaEnvelope className="mr-2" />
            {user.email}
          </p>
          
          {/* Additional profile info */}
          <div className="mt-3 flex flex-wrap gap-3 justify-center md:justify-start">
            {profile.location && (
              <div className="flex items-center text-white/70 text-sm">
                <FaMapMarkerAlt className="mr-1" />
                {profile.location}
              </div>
            )}
            
            {profile.birthdate && (
              <div className="flex items-center text-white/70 text-sm">
                <FaCalendarAlt className="mr-1" />
                {profile.birthdate}
              </div>
            )}
          </div>
          
          {/* Social media links */}
          {(profile.instagram || profile.facebook || profile.twitter) && (
            <div className="mt-3 flex space-x-3 justify-center md:justify-start">
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80">
                  <FaInstagram size={18} />
                </a>
              )}
              {profile.facebook && (
                <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80">
                  <FaFacebook size={18} />
                </a>
              )}
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80">
                  <FaTwitter size={18} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
