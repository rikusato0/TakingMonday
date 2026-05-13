import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, firebaseEnabled } from './firebaseApp';

const ADMINS_COLLECTION = 'admins';

export type AdminUser = {
  uid: string;
  email: string | null;
};

export type AdminAuthState = {
  user: AdminUser | null;
  isAdmin: boolean;
  initializing: boolean;
};

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

function ensureAuth() {
  if (!firebaseEnabled || !auth || !db) {
    throw new AdminAuthError(
      'Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* values and restart Expo.',
    );
  }
}

async function checkAdminRole(uid: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    if (!snap.exists()) return false;
    const data = snap.data() as { active?: boolean };
    return data.active !== false;
  } catch {
    // Firestore rules may reject the read when the caller is not actually
    // an admin. Treat that as "not an admin" rather than a crash.
    return false;
  }
}

/**
 * Signs an admin in with email + password and verifies they have an
 * `admins/{uid}` doc with `active != false`. Throws AdminAuthError on
 * any failure (bad credentials, not an admin, network).
 */
export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  ensureAuth();

  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new AdminAuthError('Enter email and password.');
  }

  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth!, trimmedEmail, password);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-email'
    ) {
      throw new AdminAuthError('Invalid email or password.');
    }
    if (code === 'auth/too-many-requests') {
      throw new AdminAuthError('Too many sign-in attempts. Try again in a few minutes.');
    }
    if (code === 'auth/network-request-failed') {
      throw new AdminAuthError('Network error. Check your connection and try again.');
    }
    if (code === 'auth/user-disabled') {
      throw new AdminAuthError('This account has been disabled.');
    }
    throw new AdminAuthError(
      (e as Error)?.message ?? 'Could not sign in. Please try again.',
    );
  }

  const isAdmin = await checkAdminRole(cred.user.uid);
  if (!isAdmin) {
    // Sign back out so a non-admin Firebase user can't linger in the session.
    try {
      await signOut(auth!);
    } catch {
      // best-effort
    }
    throw new AdminAuthError('This account is not authorized for admin access.');
  }

  return { uid: cred.user.uid, email: cred.user.email };
}

export async function signOutAdmin(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

/** Re-authenticate and set a new Firebase password (admin-only session). */
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  ensureAuth();

  const user = auth!.currentUser;
  if (!user?.email) throw new AdminAuthError('Sign in again to change your password.');

  const cur = currentPassword.trim();
  const next = newPassword.trim();

  if (!cur || !next) {
    throw new AdminAuthError('Enter your current password and a new password.');
  }
  if (next.length < 6) {
    throw new AdminAuthError('Use at least 6 characters for the new password.');
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, cur);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, next);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      throw new AdminAuthError('Current password is incorrect.');
    }
    if (code === 'auth/weak-password') {
      throw new AdminAuthError('That new password is too weak. Choose a stronger one.');
    }
    if (code === 'auth/requires-recent-login') {
      throw new AdminAuthError('Sign out and sign back in, then change your password.');
    }
    if (code === 'auth/network-request-failed') {
      throw new AdminAuthError('Network error. Check your connection and try again.');
    }
    throw new AdminAuthError((e as Error)?.message ?? 'Could not update password.');
  }
}

export function getCurrentAdmin(): AdminUser | null {
  const u = auth?.currentUser ?? null;
  return u ? { uid: u.uid, email: u.email } : null;
}

/**
 * Subscribes to Firebase Auth changes and re-checks the admin role doc on
 * every change. Calls back with the latest snapshot. Returns an unsubscribe.
 */
export function subscribeAdminAuth(cb: (state: AdminAuthState) => void): () => void {
  if (!auth) {
    cb({ user: null, isAdmin: false, initializing: false });
    return () => {};
  }

  // Emit an initializing state so the UI can render a loader before the
  // first onAuthStateChanged callback fires.
  cb({
    user: getCurrentAdmin(),
    isAdmin: false,
    initializing: true,
  });

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      cb({ user: null, isAdmin: false, initializing: false });
      return;
    }
    const isAdmin = await checkAdminRole(user.uid);
    cb({
      user: { uid: user.uid, email: user.email },
      isAdmin,
      initializing: false,
    });
  });
}
