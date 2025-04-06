'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { SerializableUser } from '@/utils/authUtils';
import { loginRequest, signupRequest, logoutRequest, clearError } from '@/redux/slices/authSlice';

interface AuthContextType {
  user: SerializableUser | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  // Dispatch actions to Redux
  const signup = (email: string, password: string, displayName: string) => {
    dispatch(signupRequest({ email, password, displayName }));
  };

  const login = (email: string, password: string) => {
    dispatch(loginRequest({ email, password }));
  };

  const logout = () => {
    dispatch(logoutRequest());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // Create the context value
  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    error,
    clearError: handleClearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
