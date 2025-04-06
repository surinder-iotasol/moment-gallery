import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializableUser } from '@/utils/authUtils';

// Define the auth state interface
export interface AuthState {
  user: SerializableUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Auth state actions
    setUser: (state, action: PayloadAction<SerializableUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Login actions (these will be handled by sagas)
    loginRequest: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<SerializableUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Signup actions (these will be handled by sagas)
    signupRequest: (state, action: PayloadAction<{ email: string; password: string; displayName: string }>) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action: PayloadAction<SerializableUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Logout actions (these will be handled by sagas)
    logoutRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

// Export actions and reducer
export const {
  setUser,
  setLoading,
  setError,
  clearError,
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure
} = authSlice.actions;

export default authSlice.reducer;
