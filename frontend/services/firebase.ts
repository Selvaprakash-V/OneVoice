import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN, 
  FIREBASE_PROJECT_ID, 
  FIREBASE_STORAGE_BUCKET, 
  FIREBASE_MESSAGING_SENDER_ID, 
  FIREBASE_APP_ID 
} from '@env';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

let app: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error: any) {
  // Firebase already initialized
  if (error.code !== 'app/duplicate-app') {
    console.warn('Firebase initialization:', error.message);
  }
}

export { app, auth };