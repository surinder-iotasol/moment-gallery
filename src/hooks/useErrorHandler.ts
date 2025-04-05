'use client';

import { useState, useCallback } from 'react';

interface ErrorHandlerResult {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

export function useErrorHandler(): ErrorHandlerResult {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('An unknown error occurred');
    }
    console.error('Error:', error);
  }, []);

  return { error, setError, clearError, handleError };
}
