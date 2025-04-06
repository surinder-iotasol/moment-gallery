'use client';

import { FaHeart } from 'react-icons/fa';
import { UserProfile } from '@/types/profile';

interface ProfileBioProps {
  profile: UserProfile;
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function ProfileBio({
  profile,
  isEditing,
  handleInputChange
}: ProfileBioProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
        <FaHeart className="text-primary mr-2" />
        About Me
      </h2>
      
      {isEditing ? (
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleInputChange}
          className="w-full min-h-[100px] p-3 rounded-lg bg-white/50 dark:bg-[#2d1a1a]/50 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tell your story..."
        />
      ) : (
        <p className="text-foreground/80 bg-white/30 dark:bg-[#2d1a1a]/30 p-4 rounded-lg">{profile.bio}</p>
      )}
    </div>
  );
}
