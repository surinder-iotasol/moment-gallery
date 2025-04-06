'use client';

import HeartRain, { HeartDirectionSlider } from '@/components/HeartRain';
import Navbar from '@/components/Navbar';
import Footer from '@/components/common/Footer';
import CallToActionSection from '@/components/home/CallToActionSection';
import FeaturedMemoriesSection from '@/components/home/FeaturedMemoriesSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HeroSection from '@/components/home/HeroSection';
import { useState } from 'react';

export default function Home() {
  const [heartDirection, setHeartDirection] = useState(50);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Heart Rain Background */}
      <HeartRain direction={heartDirection} />
      <HeartDirectionSlider value={heartDirection} onChange={setHeartDirection} />

      {/* Main Content */}
      <HeroSection />
      <FeaturedMemoriesSection />
      <FeaturesSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
}
