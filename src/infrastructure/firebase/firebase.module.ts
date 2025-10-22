import { Module } from '@nestjs/common';
import { firebaseProvider, firebaseStorageProvider } from './firebase.provider';

@Module({
  providers: [firebaseProvider, firebaseStorageProvider],
  exports: [firebaseProvider, firebaseStorageProvider],
})
export class FirebaseModule {}
