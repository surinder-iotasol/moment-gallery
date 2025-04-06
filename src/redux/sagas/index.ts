import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { gallerySaga } from '../gallery/saga';

// Root saga
export default function* rootSaga() {
  try {
    yield all([
      fork(authSaga),
      fork(gallerySaga)
      // Add other sagas here as needed
    ]);
  } catch (error) {
    console.error('Root saga error:', error);
  }
}
