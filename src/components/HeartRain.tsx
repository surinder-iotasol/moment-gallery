'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HeartRainProps {
  direction: number; // 0-100 value from slider
}

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export default function HeartRain({ direction }: HeartRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate the angle based on direction (0-100)
  // 0 = falling straight down, 50 = straight down, 100 = falling right
  const angle = ((direction - 50) / 50) * Math.PI / 3; // Convert to radians, max ±60 degrees

  // Colors for hearts
  const heartColors = [
    '#ff6b6b', // primary
    '#ffb8b8', // primary-light
    '#c83e3e', // primary-dark
    '#ff9999', // accent
  ];

  // Initialize canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        setDimensions({ width: canvas.width, height: canvas.height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create hearts
  useEffect(() => {
    if (dimensions.width === 0) return;

    // Initialize hearts
    const initialHearts: Heart[] = [];
    const heartCount = Math.floor(dimensions.width / 40); // Adjust density based on screen width

    for (let i = 0; i < heartCount; i++) {
      initialHearts.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height * -1, // Start above the screen
        size: 10 + Math.random() * 20,
        speed: 1 + Math.random() * 3,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03
      });
    }

    setHearts(initialHearts);
  }, [dimensions]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || hearts.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentHearts = [...hearts];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const updatedHearts = currentHearts.map(heart => {
        // Draw heart
        drawHeart(ctx, heart.x, heart.y, heart.size, heart.color, heart.rotation);

        // Update position based on direction
        const xMove = Math.sin(angle) * heart.speed;
        const yMove = Math.cos(angle) * heart.speed;

        let newX = heart.x + xMove;
        let newY = heart.y + yMove;
        let newRotation = heart.rotation + heart.rotationSpeed;

        // Reset if heart goes off screen
        if (newY > canvas.height + heart.size) {
          newY = -heart.size;
          newX = Math.random() * canvas.width;
        }

        // Reset if heart goes off sides
        if (newX < -heart.size * 2) {
          newX = canvas.width + heart.size;
        } else if (newX > canvas.width + heart.size * 2) {
          newX = -heart.size;
        }

        return {
          ...heart,
          x: newX,
          y: newY,
          rotation: newRotation
        };
      });

      currentHearts = updatedHearts;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hearts.length, angle, dimensions]);

  // Function to draw a heart
  const drawHeart = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    rotation: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 30, size / 30); // Scale based on size

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -10, -15, 0, 0, 10);
    ctx.bezierCurveTo(15, 0, 10, -10, 0, 0);

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// Heart Direction Slider Component
export function HeartDirectionSlider({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-[#2d1a1a]/80 backdrop-blur-md p-4 rounded-full shadow-lg">
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="text-primary"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-40 h-2 bg-primary-light rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-dark) 100%)`,
          }}
        />

        <motion.div
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="text-primary"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
