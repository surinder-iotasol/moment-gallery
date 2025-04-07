/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/firebase';
import { serializeUser } from '@/utils/authUtils';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { eventChannel, EventChannel } from 'redux-saga';
import { all, call, fork, put, take, takeLatest } from 'redux-saga/effects';
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  logoutFailure,
  logoutRequest,
  logoutSuccess,
  setLoading,
  setUser,
  signupFailure,
  signupRequest,
  signupSuccess
} from '../slices/authSlice';

// Create an event channel for auth state changes
function createAuthChannel() {
  return eventChannel(emit => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      emit({ user });
    }, (error) => {
      console.error('Auth state changed error:', error);
      emit(new Error(error.message));
    });
    
    // Return unsubscribe function
    return unsubscribe;
  });
}

// Watch for auth state changes
function* watchAuthState() {
  const authChannel: EventChannel<{ user: User | null }> = yield call(createAuthChannel);
  
  try {
    while (true) {
      // Use the take effect from redux-saga
      const payload: { user: User | null } = yield take(authChannel);
      const user = payload.user;
      
      // Convert Firebase User to serializable object
      const serializableUserData = serializeUser(user);
      yield put(setUser(serializableUserData));
    }
  } catch (error) {
    console.error('Auth channel error:', error);
  } finally {
    if (authChannel) {
      authChannel.close();
    }
  }
}

// Login saga
function* loginSaga(action: PayloadAction<{ email: string; password: string }>): Generator<any, void, any> {
  try {
    const { email, password } = action.payload;
    yield put(setLoading(true));
    
    const userCredential = yield call(
      signInWithEmailAndPassword,
      auth,
      email,
      password
    );
    
    // Convert Firebase User to serializable object
    const serializableUserData = serializeUser(userCredential.user);
    yield put(loginSuccess(serializableUserData!));
  } catch (error) {
    yield put(loginFailure((error as Error).message));
  }
}

// Signup saga
function* signupSaga(action: PayloadAction<{ email: string; password: string; displayName: string }>): Generator<any, void, any> {
  try {
    const { email, password, displayName } = action.payload;
    yield put(setLoading(true));
    
    const userCredential = yield call(
      createUserWithEmailAndPassword,
      auth,
      email,
      password
    );
    
    if (userCredential.user) {
      yield call(
        updateProfile,
        userCredential.user,
        { displayName }
      );
    }
    
    // Convert Firebase User to serializable object
    const serializableUserData = serializeUser(userCredential.user);
    yield put(signupSuccess(serializableUserData!));
  } catch (error) {
    yield put(signupFailure((error as Error).message));
  }
}

// Logout saga
function* logoutSaga() {
  try {
    yield put(setLoading(true));
    yield call(signOut, auth);
    yield put(logoutSuccess());
  } catch (error) {
    yield put(logoutFailure((error as Error).message));
  }
}

// Root auth saga
export function* authSaga() {
  yield all([
    fork(watchAuthState),
    takeLatest(loginRequest.type, loginSaga),
    takeLatest(signupRequest.type, signupSaga),
    takeLatest(logoutRequest.type, logoutSaga)
  ]);
}
