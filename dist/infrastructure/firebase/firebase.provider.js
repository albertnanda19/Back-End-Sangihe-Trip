"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseStorageProvider = exports.firebaseProvider = exports.FIREBASE_STORAGE = exports.FIREBASE_APP = void 0;
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firebase_config_1 = require("../../config/firebase.config");
exports.FIREBASE_APP = 'FIREBASE_APP';
exports.FIREBASE_STORAGE = 'FIREBASE_STORAGE';
exports.firebaseProvider = {
    provide: exports.FIREBASE_APP,
    useFactory: () => {
        if (!firebase_config_1.firebaseConfig.storageBucket) {
            throw new Error('Firebase storageBucket is not defined. Please check your .env file and ensure FIREBASE_STORAGE_BUCKET is set.');
        }
        return (0, app_1.initializeApp)(firebase_config_1.firebaseConfig);
    },
};
exports.firebaseStorageProvider = {
    provide: exports.FIREBASE_STORAGE,
    useFactory: (app) => {
        return (0, storage_1.getStorage)(app);
    },
    inject: [exports.FIREBASE_APP],
};
//# sourceMappingURL=firebase.provider.js.map