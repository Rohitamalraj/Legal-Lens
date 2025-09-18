import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD0crY42Tel9CAwxLDlCHPpSpYKDAP_THw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'legal-lens-dd723.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'legal-lens-dd723',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'legal-lens-dd723.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '771696574971',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:771696574971:web:3ba2e0383b9e1c004a0b5e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-HH5Y3F3L1L'
};

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (for future use)
export const auth = getAuth(app);

// For development - connect to emulator if running locally
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Only connect to emulator in development
    console.log('Development mode - Firebase will use production database');
    // Uncomment below if you want to use local emulator
    // connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firestore setup info:', error);
  }
}

export default app;