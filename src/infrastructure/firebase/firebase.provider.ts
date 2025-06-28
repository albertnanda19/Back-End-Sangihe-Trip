import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '../../config/firebase.config';

export const FIREBASE_APP = 'FIREBASE_APP';
export const FIREBASE_STORAGE = 'FIREBASE_STORAGE';

export const firebaseProvider = {
  provide: FIREBASE_APP,
  useFactory: (): FirebaseApp => {
    if (!firebaseConfig.storageBucket) {
      throw new Error(
        'Firebase storageBucket is not defined. Please check your .env file and ensure FIREBASE_STORAGE_BUCKET is set.',
      );
    }
    return initializeApp(firebaseConfig);
  },
};

export const firebaseStorageProvider = {
  provide: FIREBASE_STORAGE,
  useFactory: (app: FirebaseApp): FirebaseStorage => {
    return getStorage(app);
  },
  inject: [FIREBASE_APP],
};
