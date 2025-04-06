'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  loginRequest, 
  signupRequest, 
  logoutRequest, 
  clearError 
} from '@/redux/slices/authSlice';

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = (email: string, password: string) => {
    dispatch(loginRequest({ email, password }));
  };

  const signup = (email: string, password: string, displayName: string) => {
    dispatch(signupRequest({ email, password, displayName }));
  };

  const logout = () => {
    dispatch(logoutRequest());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    clearError: handleClearError
  };
}
