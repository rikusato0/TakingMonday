#!/usr/bin/env node
/* eslint-disable */
/**
 * Seeds (or updates) an admin user in Firebase Auth + Firestore.
 *
 * Why: clients cannot bootstrap an admin record themselves — strict
 * Firestore rules require an existing admin to write `admins/{uid}`.
 * Run this from a trusted machine to grant admin access.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node scripts/seed-admin.cjs --email you@example.com --password 'SomeStrongPass!'
 *
 *   # Mark existing user inactive (revoke admin without deleting auth user):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node scripts/seed-admin.cjs --email you@example.com --inactive
 *
 *   # Or set FIREBASE_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS in your env.
 *
 * Requires firebase-admin to be installed as a dev dependency:
 *   npm install --save-dev firebase-admin
 *
 * The service account JSON must belong to your Firebase project and have
 * "Firebase Authentication Admin" + "Cloud Datastore User" (or Owner) roles.
 */

const path = require('path');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    }
  }
  return out;
}

function fail(message) {
  console.error(`\n[seed-admin] ${message}\n`);
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.email || process.env.ADMIN_EMAIL;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const displayName = args.name || process.env.ADMIN_NAME || undefined;
  const setInactive = Boolean(args.inactive);

  if (!email) {
    fail(
      'Missing --email. Usage:\n' +
        "  node scripts/seed-admin.cjs --email you@example.com --password 'StrongPass!'",
    );
  }
  if (!setInactive && !password) {
    fail(
      'Missing --password (required unless --inactive is set). Use a strong password ≥ 8 chars.',
    );
  }

  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    fail(
      'firebase-admin is not installed. Run:\n  npm install --save-dev firebase-admin\nthen rerun this script.',
    );
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    fail(
      'GOOGLE_APPLICATION_CREDENTIALS env var is not set. Point it at your Firebase service account JSON, e.g.:\n' +
        '  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seed-admin.cjs --email ...',
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`[seed-admin] Found existing Auth user: ${userRecord.uid}`);
    if (password) {
      await auth.updateUser(userRecord.uid, { password, ...(displayName ? { displayName } : {}) });
      console.log('[seed-admin] Updated password.');
    } else if (displayName) {
      await auth.updateUser(userRecord.uid, { displayName });
    }
  } catch (e) {
    if (e && e.code === 'auth/user-not-found') {
      userRecord = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName,
      });
      console.log(`[seed-admin] Created Auth user: ${userRecord.uid}`);
    } else {
      throw e;
    }
  }

  const docRef = db.collection('admins').doc(userRecord.uid);
  const payload = {
    email,
    active: !setInactive,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (displayName) payload.displayName = displayName;

  await docRef.set(payload, { merge: true });
  console.log(
    `[seed-admin] Firestore admins/${userRecord.uid} ${setInactive ? 'marked inactive' : 'set active'}.`,
  );

  // Optional custom claim — handy if you later switch to claim-based rules.
  try {
    await auth.setCustomUserClaims(userRecord.uid, { admin: !setInactive });
    console.log('[seed-admin] Set custom claim { admin: ' + !setInactive + ' }.');
  } catch (e) {
    console.warn('[seed-admin] Could not set custom claim:', e.message);
  }

  console.log('\nDone. Sign in at the app admin login screen with:');
  console.log(`  email:    ${email}`);
  if (password) console.log(`  password: ${password}`);
  console.log(`  uid:      ${userRecord.uid}`);
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
