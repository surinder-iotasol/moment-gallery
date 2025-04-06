'use client';

import { FaSpinner } from 'react-icons/fa';

export default function UploadIndicator() {
  return (
    <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full flex items-center shadow-lg z-50">
      <FaSpinner className="animate-spin mr-2" />
      <span>Uploading image...</span>
    </div>
  );
}
