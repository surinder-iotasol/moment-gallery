'use client';

import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';

interface LogoutButtonProps {
  onLogout: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <div className="mt-8 flex justify-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLogout}
        className="flex items-center px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
      >
        <FaSignOutAlt className="mr-2" />
        Sign Out
      </motion.button>
    </div>
  );
}
