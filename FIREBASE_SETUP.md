# Firebase setup for Taking Monday

This app currently uses a **local mock backend** (`src/services/mockBackend.ts`) so you can run UI and flows without Firebase. When you are ready, wire in Firebase using the steps below.

## 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. **Add an Android app** to the project (package name must match your Expo/EAS app id, e.g. `com.yourorg.takingmonday`).
3. Download `google-services.json` — you will need it for a **development build** (Expo Go does not use your custom native config unless you use a dev client).

## 2. Enable Firestore

1. In Firebase Console, enable **Cloud Firestore**.
2. Start in **production mode**, then tighten rules (below are **not** final production rules — they illustrate structure).

Suggested collections (aligned with the app spec):

- `counters` — single document `global` with `goodThingsTotal`, `goodThingsToday`, `goodWishesTotal`, `goodWishesToday`, `lastResetDate` (string `YYYY-MM-DD` in `America/New_York`).
- `wall_entries` — one document per person: `displayName`, `location`, `totalWishes`, `active`, `sortOrder`, `createdAt`.
- `device_clicks` — keyed by anonymous `deviceId`: `dailyClickCount`, `lastResetDate` (Eastern calendar date).
- `admins` — admin records (hashed passwords only; never store plaintext).

**Important:** Do **not** allow clients to increment counters directly with open write rules. Use **Cloud Functions** (callable or HTTPS) with:

- `FieldValue.increment(1)` or a transaction
- Server-side **67 clicks/day** enforcement using Eastern date
- Server-side **daily reset** for `*Today` fields (or a scheduled function at Eastern midnight)

## 3. Install Firebase in the repo

From the project root:

```bash
npx expo install firebase
```

Add a **Firebase web app** in the console and copy the web config into environment variables (Expo public vars are prefixed with `EXPO_PUBLIC_`):

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Create a `.env` file (keep it out of git; `.gitignore` should include `.env`).

Initialize Firebase in something like `src/services/firebaseApp.ts` and export `db`, `functions`, etc.

## 4. Realtime UI

- Subscribe to `counters/global` with `onSnapshot`.
- Subscribe to `wall_entries` where `active == true`, ordered by `sortOrder`.
- On each tap: **optimistic local bump**, then call your **increment** Cloud Function; on error or snapshot mismatch, **reconcile** from Firestore.

## 5. Admin + CAPTCHA

- Keep admin **write** operations behind authenticated admin only (custom token / session from your `POST /admin/login` equivalent).
- Verify CAPTCHA **on the server** (e.g. reCAPTCHA Enterprise or similar), not only in the app.

## 6. App Check (recommended)

Enable **Firebase App Check** before public launch to reduce scripted abuse alongside your click limit.

## 7. Replace the mock

When Firebase is ready:

1. Implement `src/services/firebaseBackend.ts` with the same operations as the mock (`hydrate`, increments, wall CRUD, reorder).
2. Switch `AppDataProvider` (or a small factory) to use the Firebase implementation when `EXPO_PUBLIC_USE_FIREBASE=1` (or similar).

---

**Security reminder:** Never commit service account JSON, private keys, or personal access tokens. If a token was ever committed, **revoke and rotate** it in Figma and Google/Firebase consoles.
