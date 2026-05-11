import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readConfig(): FirebaseConfig | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

const firebaseConfig = readConfig();

export const firebaseEnabled = Boolean(firebaseConfig);

export const firebaseApp: FirebaseApp | null = firebaseConfig
  ? (getApps()[0] ?? initializeApp(firebaseConfig))
  : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

function createAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  // `getReactNativePersistence` is only exported from the RN bundle of
  // `firebase/auth`; its types live behind the package's conditional
  // exports and aren't visible to TypeScript, so we resolve it dynamically.
  // Without it, Firebase Auth on RN runs with in-memory persistence and
  // logs a warning, which would sign admins out on every reload.
  try {
    const firebaseAuth = require('firebase/auth') as {
      getReactNativePersistence?: (storage: unknown) => Persistence;
    };
    const rnPersistence = firebaseAuth.getReactNativePersistence;
    if (typeof rnPersistence === 'function') {
      return initializeAuth(app, { persistence: rnPersistence(AsyncStorage) });
    }
  } catch {
    // fall through to default getAuth
  }
  return getAuth(app);
}

export const auth: Auth | null = firebaseApp ? createAuth(firebaseApp) : null;
