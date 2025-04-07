'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaCog } from 'react-icons/fa';
import { useGallery } from '@/context/GalleryContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface SliderSettings {
  autoplay: boolean;
  interval: number;
  speed: number;
}

const DEFAULT_SETTINGS: SliderSettings = {
  autoplay: true,
  interval: 5000,
  speed: 500,
};

export default function FeaturedSlider() {
  const { featuredImages } = useGallery();
  const [settings, setSettings] = useState<SliderSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const swiperRef = useRef<SwiperType>();

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (swiperRef.current?.autoplay) {
        swiperRef.current.autoplay.stop();
      }
    };
  }, []);

  // Toggle autoplay with safety checks
  const toggleAutoplay = () => {
    setSettings((prev) => {
      const newAutoplay = !prev.autoplay;
      if (swiperRef.current?.autoplay) {
        if (newAutoplay) {
          swiperRef.current.autoplay.start();
        } else {
          swiperRef.current.autoplay.stop();
        }
      }
      return { ...prev, autoplay: newAutoplay };
    });
  };

  // Update interval with validation
  const updateInterval = (value: number) => {
    const validValue = Math.max(1000, Math.min(value, 10000));
    setSettings((prev) => ({ ...prev, interval: validValue }));

    if (swiperRef.current?.autoplay) {
      swiperRef.current.params.autoplay = {
        delay: validValue,
        disableOnInteraction: false
      };
      if (settings.autoplay) {
        swiperRef.current.autoplay.start();
      }
    }
  };

  // Update speed with validation
  const updateSpeed = (value: number) => {
    const validValue = Math.max(200, Math.min(value, 1000));
    setSettings((prev) => ({ ...prev, speed: validValue }));

    if (swiperRef.current) {
      swiperRef.current.params.speed = validValue;
    }
  };

  if (!Array.isArray(featuredImages) || featuredImages.length === 0) {
    return (
      <div className="w-full h-[400px] bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center">
        <p className="text-foreground/70">No featured images yet</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] max-h-[700px] sm:h-[550px] h-96 max-w-[80vw] rounded-xl overflow-hidden shadow-xl">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
        }}
        pagination={{
          clickable: true,
        }}
        autoplay={
          settings.autoplay
            ? {
                delay: settings.interval,
                disableOnInteraction: false,
              }
            : false
        }
        speed={settings.speed}
        effect="fade"
        loop={true}
        className="h-full w-full rounded-xl [&_.swiper-wrapper]:!h-full"
      >
        {featuredImages.map((image, index) => (
          <SwiperSlide key={`${image.id}-${index}`} className="relative !h-full">
            <div className="relative w-full h-full">
              <Image
                src={image.url}
                alt={image.moment || 'Featured image'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                className="object-cover object-center"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-medium">{image.moment}</h3>
                {image.description && (
                  <p className="text-white/90 mt-2 line-clamp-2">{image.description}</p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-30">
        <button
          onClick={toggleAutoplay}
          className="w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={settings.autoplay ? "Pause slideshow" : "Play slideshow"}
        >
          {settings.autoplay ? <FaPause size={14} /> : <FaPlay size={14} />}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Slider settings"
        >
          <FaCog size={14} />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-16 right-4 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white z-30 min-w-[200px]"
          >
            <h4 className="font-medium mb-2">Slider Settings</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="interval" className="block text-sm mb-1">Interval (seconds)</label>
                <input
                  id="interval"
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={settings.interval}
                  onChange={(e) => updateInterval(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="text-xs text-right">{settings.interval / 1000}s</div>
              </div>
              <div>
                <label htmlFor="speed" className="block text-sm mb-1">Transition Speed</label>
                <input
                  id="speed"
                  type="range"
                  min="200"
                  max="1000"
                  step="100"
                  value={settings.speed}
                  onChange={(e) => updateSpeed(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="text-xs text-right">{settings.speed / 1000}s</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
