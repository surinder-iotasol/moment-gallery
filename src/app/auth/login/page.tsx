'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeart, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
// Note: We're still using the AuthContext, but it's now a wrapper around Redux

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [localError, setLocalError] = useState('');
  const { login, error, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      setLocalError('');
      // Redux saga will handle the async operation
      login(email, password);
      router.push('/gallery');
    } catch (error) {
      setLocalError('Failed to log in. Please check your credentials.');
      console.error(error);
    }
  };

  // Display Firebase error if available
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Decorative hearts */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary-light opacity-30"
            initial={{
              x: Math.random() * 100 - 50 + '%',
              y: -50,
              scale: 0.5 + Math.random() * 1.5
            }}
            animate={{
              y: '120vh',
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          >
            <FaHeart size={20 + Math.random() * 30} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card-bg dark:bg-[#3a2222] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              className="inline-block text-primary mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <FaHeart size={48} />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-foreground/70 mt-2">Sign in to access your romantic moments</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-primary/70" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-primary/70" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 dark:bg-[#2d1a1a]/80"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {localError && (
              <div className="text-red-500 text-sm mb-4">{localError}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-medium transition-colors ${
                loading
                  ? 'bg-primary/50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/70">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
