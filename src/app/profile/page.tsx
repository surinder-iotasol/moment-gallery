'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// import { FaHeart, FaUser, FaEnvelope, FaSignOutAlt, FaImages } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/context/GalleryContext';
import Navbar from '@/components/Navbar';
import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBio from '@/components/profile/ProfileBio';
import ProfileDetails from '@/components/profile/ProfileDetails';
import GalleryStats from '@/components/profile/GalleryStats';
import LogoutButton from '@/components/profile/LogoutButton';
import VideoCallButton from '@/components/profile/VideoCallButton';
import { UserProfile } from '@/types/profile';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [heartDirection, setHeartDirection] = useState(50);
  const { user, logout, loading: authLoading } = useAuth();
  const { images, sections } = useGallery();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: 'Share your story here...',
    location: '',
    birthdate: '',
    instagram: '',
    facebook: '',
    twitter: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize profile with user data
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        displayName: user.displayName || '',
        // Use localStorage to persist profile data
        bio: localStorage.getItem(`profile_bio_${user.uid}`) || 'Share your story here...',
        location: localStorage.getItem(`profile_location_${user.uid}`) || '',
        birthdate: localStorage.getItem(`profile_birthdate_${user.uid}`) || '',
        instagram: localStorage.getItem(`profile_instagram_${user.uid}`) || '',
        facebook: localStorage.getItem(`profile_facebook_${user.uid}`) || '',
        twitter: localStorage.getItem(`profile_twitter_${user.uid}`) || '',
        profileImage: localStorage.getItem(`profile_image_${user.uid}`) || null
      }));

      // Set image preview if available
      const savedImage = localStorage.getItem(`profile_image_${user.uid}`);
      if (savedImage) {
        setImagePreview(savedImage);
      }
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setProfile(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    if (!user) return;

    // Save profile data to localStorage
    localStorage.setItem(`profile_bio_${user.uid}`, profile.bio);
    localStorage.setItem(`profile_location_${user.uid}`, profile.location);
    localStorage.setItem(`profile_birthdate_${user.uid}`, profile.birthdate);
    localStorage.setItem(`profile_instagram_${user.uid}`, profile.instagram);
    localStorage.setItem(`profile_facebook_${user.uid}`, profile.facebook);
    localStorage.setItem(`profile_twitter_${user.uid}`, profile.twitter);

    if (profile.profileImage) {
      localStorage.setItem(`profile_image_${user.uid}`, profile.profileImage);
    }

    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to saved values
    if (user) {
      setProfile(prev => ({
        ...prev,
        displayName: user.displayName || '',
        bio: localStorage.getItem(`profile_bio_${user.uid}`) || 'Share your story here...',
        location: localStorage.getItem(`profile_location_${user.uid}`) || '',
        birthdate: localStorage.getItem(`profile_birthdate_${user.uid}`) || '',
        instagram: localStorage.getItem(`profile_instagram_${user.uid}`) || '',
        facebook: localStorage.getItem(`profile_facebook_${user.uid}`) || '',
        twitter: localStorage.getItem(`profile_twitter_${user.uid}`) || '',
      }));

      // Reset image preview
      const savedImage = localStorage.getItem(`profile_image_${user.uid}`);
      setImagePreview(savedImage);
    }

    setIsEditing(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-primary text-4xl mx-auto animate-pulse">❤️</div>
          <p className="mt-4 text-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }
  // Calculate stats
  const totalImages = images.length;
  const sectionCounts = sections.reduce((acc, section) => {
    const count = images.filter(img => img.section === section).length;
    if (count > 0) {
      acc[section] = count;
    }
    return acc;
  }, {} as Record<string, number>);

  const sectionCount = Object.keys(sectionCounts).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />

      <main className="container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-bg dark:bg-[#3a2222] rounded-xl shadow-xl overflow-hidden"
          >
            {/* Profile Header */}
            <ProfileHeader
              user={user}
              profile={profile}
              isEditing={isEditing}
              imagePreview={imagePreview}
              setIsEditing={setIsEditing}
              handleInputChange={handleInputChange}
              handleProfileUpdate={handleProfileUpdate}
              handleCancelEdit={handleCancelEdit}
              handleImageUpload={handleImageUpload}
            />

            {/* Profile Content */}
            <div className="p-6">
              {/* Bio Section */}
              <ProfileBio
                profile={profile}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
              />

              {/* Additional Profile Fields (only shown when editing) */}
              {isEditing && (
                <ProfileDetails
                  profile={profile}
                  handleInputChange={handleInputChange}
                />
              )}

              {/* Gallery Stats */}
              <GalleryStats
                totalImages={totalImages}
                sectionCount={sectionCount}
                sectionCounts={sectionCounts}
              />

              {/* Video Call and Logout Buttons */}
              <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                <VideoCallButton />
                <LogoutButton onLogout={handleLogout} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
