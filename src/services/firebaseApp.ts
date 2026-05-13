import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

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

/**
 * In-memory auth only: admin must sign in again after a full app restart.
 * (Same Firebase project is only used for admin; public app features do not
 * rely on a persisted user session.)
 */
function createAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    return getAuth(app);
  }
}

export const auth: Auth | null = firebaseApp ? createAuth(firebaseApp) : null;
