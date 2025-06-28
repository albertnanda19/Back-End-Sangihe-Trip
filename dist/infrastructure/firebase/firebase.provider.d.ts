import { FirebaseApp } from 'firebase/app';
import { FirebaseStorage } from 'firebase/storage';
export declare const FIREBASE_APP = "FIREBASE_APP";
export declare const FIREBASE_STORAGE = "FIREBASE_STORAGE";
export declare const firebaseProvider: {
    provide: string;
    useFactory: () => FirebaseApp;
};
export declare const firebaseStorageProvider: {
    provide: string;
    useFactory: (app: FirebaseApp) => FirebaseStorage;
    inject: string[];
};
