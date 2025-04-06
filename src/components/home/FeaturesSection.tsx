'use client';

import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

// Define the feature type
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// List of features
const features: Feature[] = [
  {
    title: 'Heart Rain Animation',
    description: 'Enjoy a beautiful rain of hearts in the background that you can control with our heart-shaped slider.',
    icon: <FaHeart size={24} />
  },
  {
    title: 'Interactive Gallery',
    description: 'Organize your images in different sections and flip through them with our interactive card design.',
    icon: <FaHeart size={24} />
  },
  {
    title: 'Capture Moments',
    description: 'Add text to your images to describe the special moment and the feelings associated with it.',
    icon: <FaHeart size={24} />
  },
  {
    title: 'Secure Authentication',
    description: 'Your romantic moments are private and secure with our Firebase authentication system.',
    icon: <FaHeart size={24} />
  },
  {
    title: 'Cloud Storage',
    description: 'All your images are safely stored in the cloud, accessible from any device.',
    icon: <FaHeart size={24} />
  },
  {
    title: 'Beautiful Design',
    description: 'Enjoy a visually appealing interface with smooth animations and a romantic color palette.',
    icon: <FaHeart size={24} />
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-white/30 dark:bg-[#2d1a1a]/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Features You'll <span className="text-primary">Love</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            Our romantic gallery app is designed to help you cherish and organize your special moments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={feature} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature card component
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card-bg dark:bg-[#3a2222] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
      <p className="text-foreground/70">{feature.description}</p>
    </motion.div>
  );
}
