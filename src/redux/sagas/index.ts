import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';

// Root saga
export default function* rootSaga() {
  try {
    yield all([
      fork(authSaga)
      // Add other sagas here as needed
    ]);
  } catch (error) {
    console.error('Root saga error:', error);
  }
}
