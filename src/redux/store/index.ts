import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import authReducer from '../slices/authSlice';
import rootSaga from '../sagas';

// Configure persist options for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'] // Only persist these fields
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Combine reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer
  // Add other reducers here as needed
});

// Create saga middleware with error handling
const sagaMiddleware = createSagaMiddleware({
  onError: (error, { sagaStack }) => {
    console.error('Saga error:', error);
    console.error('Saga stack:', sagaStack);
  }
});

// Create store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
          // Add actions that contain non-serializable values
          'auth/loginSuccess',
          'auth/signupSuccess',
          'auth/setUser'
        ],
        // Ignore these field paths in the state
        ignoredPaths: [
          'auth.user'
        ],
      },
    }).concat(sagaMiddleware),
});

// Run saga
try {
  sagaMiddleware.run(rootSaga);
} catch (error) {
  console.error('Error running saga middleware:', error);
}

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
