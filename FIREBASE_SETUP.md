# Firebase setup for Taking Monday

This app uses a **Firebase-only backend** (`src/services/firebaseBackend.ts`)
plus **Firebase Authentication** for the admin dashboard
(`src/services/adminAuth.ts`). Complete the steps below so the app can run
with your Firebase project.

## 1. Create a Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/) and
   create a project (or use an existing one).
2. Add a **Web app** to the project — its config is what the Expo client
   uses (`EXPO_PUBLIC_FIREBASE_*` env vars below).
3. If you also build a native Android/iOS app, add those platforms too and
   download the platform config files (`google-services.json` /
   `GoogleService-Info.plist`) for your dev build.

## 2. Enable Firestore

1. Enable **Cloud Firestore**, starting in **production mode**.
2. Suggested collections (aligned with the app spec):

   - `counters` — single document `global` with `goodThingsTotal`,
     `goodThingsToday`, `goodWishesTotal`, `goodWishesToday`, and
     `lastResetDate` (string `YYYY-MM-DD` in `America/New_York`).
   - `wall_entries` — one document per person: `displayName`, `location`,
     `totalWishes`, `active`, `sortOrder`, `createdAt`.
   - `device_clicks` — keyed by anonymous `deviceId`: `dailyClickCount`,
     `lastResetDate` (Eastern calendar date).
   - `admins` — keyed by **Firebase Auth UID** of each admin. Documents
     hold `email`, `active` (boolean), optional `displayName`, and a
     server `updatedAt` timestamp. **Never store plaintext passwords.**

3. **Important:** do **not** allow clients to increment counters directly
   with open write rules. In production, gate writes behind Cloud
   Functions (callable or HTTPS) that:

   - Use `FieldValue.increment(1)` or a transaction
   - Enforce **67 clicks/day** per device (Eastern date) server-side
   - Reset `*Today` fields at Eastern midnight (scheduled function)

### Suggested Firestore rules

These rules let any signed-in user (including anonymous) read the public
data, but restrict admin-only writes (`wall_entries`, `admins`) to UIDs
that exist as an active admin document.

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
        && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.active != false;
    }

    match /counters/{doc} {
      allow read: if true;
      // Tighten in production: move writes behind Cloud Functions and
      // disallow direct client writes entirely.
      allow write: if true;
    }

    match /wall_entries/{entryId} {
      allow read: if true;
      // Clients may only bump `totalWishes` by exactly 1. Admins may
      // change anything.
      allow update: if isAdmin()
        || (request.resource.data.diff(resource.data).changedKeys().hasOnly(['totalWishes'])
            && request.resource.data.totalWishes == resource.data.totalWishes + 1);
      allow create, delete: if isAdmin();
    }

    match /admins/{uid} {
      // An admin can read their own record (to verify role) and other
      // admins. Non-admins cannot enumerate the collection.
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow write: if isAdmin();
    }

    match /device_clicks/{deviceId} {
      allow read, write: if true;
    }
  }
}
```

Adjust to your security model before launch.

## 3. Install Firebase env in the repo

From the project root:

```bash
npx expo install firebase
```

Already done in `package.json`. Add a `.env` (kept out of git) with your
**Web app** config — these vars must be prefixed with `EXPO_PUBLIC_` so
they're inlined into the client bundle:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

`src/services/firebaseApp.ts` initializes Firebase, Firestore (`db`), and
Auth (`auth`). On native it uses AsyncStorage persistence so admins stay
signed in between app launches.

## 4. Realtime UI

- Subscribe to `counters/global` with `onSnapshot`.
- Subscribe to `wall_entries` where `active == true`, ordered by `sortOrder`.
- On each tap: **optimistic local bump**, then call your **increment**
  Cloud Function; on error or snapshot mismatch, **reconcile** from
  Firestore.

## 5. Admin authentication

The admin login screen at `app/admin/login.tsx` calls
`signInWithEmailAndPassword` against Firebase Auth and then verifies the
user has an `admins/{uid}` document with `active != false`. If either
step fails, the session is signed out and the screen shows a clear error.

### Enable Email/Password sign-in

1. In Firebase Console → **Authentication → Sign-in method**, enable
   **Email/Password** (leave passwordless link disabled unless you want it).
2. Optionally enable **App Check** (see below) and **reCAPTCHA Enterprise**
   for stronger client-side abuse protection.

### Create your first admin

Clients can't bootstrap an admin record because the Firestore rules
above require an existing admin to write `admins/{uid}`. Pick one of
the two paths below.

#### Option A — manual, no extra install (recommended for the first admin)

1. **Authentication → Users → Add user**: enter the admin email +
   password (Firebase will hash the password for you).
2. Copy the **User UID** Firebase shows for that new user.
3. **Firestore → Start collection** (if missing) named `admins`.
4. Add a document with **Document ID = that UID** and these fields:

   | Field         | Type      | Value                  |
   | ------------- | --------- | ---------------------- |
   | `email`       | string    | the admin's email      |
   | `active`      | boolean   | `true`                 |
   | `displayName` | string    | (optional)             |
   | `updatedAt`   | timestamp | (use "current time")   |

5. Publish the suggested Firestore rules from §2. (If you need to
   loosen them temporarily for step 4, do it inside the Rules tab,
   then tighten right after.)

The app's login screen will now accept that admin's email + password
and the admin role check will pass.

#### Option B — scripted, via `firebase-admin` (good for additional admins / CI)

```bash
# One-time install of the Admin SDK (dev dependency)
npm install --save-dev firebase-admin
```

Then generate a service-account JSON in Firebase Console:
**Project settings → Service accounts → "Generate new private key"**.
Save it locally (`./serviceAccount.json`) and **never commit it** —
`.gitignore` already covers `.env` but you should add `serviceAccount*.json`
too.

Run the seed script. Note that env-var syntax differs per shell:

**Git Bash / WSL / macOS / Linux**

```bash
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  npm run seed:admin -- --email you@example.com --password 'StrongPass!' --name "You"
```

**Windows CMD**

```bat
set GOOGLE_APPLICATION_CREDENTIALS=.\serviceAccount.json
npm run seed:admin -- --email you@example.com --password "StrongPass!" --name "You"
```

**PowerShell**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\serviceAccount.json"
npm run seed:admin -- --email you@example.com --password "StrongPass!" --name "You"
```

The script will:

- Create the Firebase Auth user (or reuse + update an existing one).
- Write `admins/{uid}` with `{ email, active: true, displayName?, updatedAt }`.
- Set a custom claim `{ admin: true }` (useful if you migrate to
  claim-based rules later).

To revoke admin access without deleting the auth user, pass
`--inactive` and omit `--password`:

```bat
:: Windows CMD
set GOOGLE_APPLICATION_CREDENTIALS=.\serviceAccount.json
npm run seed:admin -- --email you@example.com --inactive
```

> **Troubleshooting `npm install firebase-admin` →
> `UNABLE_TO_VERIFY_LEAF_SIGNATURE`**: your machine is behind a TLS-
> intercepting proxy or antivirus (Zscaler, corporate firewall, etc.)
> and Node doesn't trust its root CA. Fix in this order:
>
> 1. `set NODE_OPTIONS=--use-system-ca` (Windows CMD) or
>    `export NODE_OPTIONS=--use-system-ca` (bash), then retry the
>    install. Works on Node 18.18+ / 20+ / 22+.
> 2. Check for a stale proxy/CA in npm config:
>    `npm config get https-proxy`, `npm config get cafile`. Clear
>    stale values with `npm config delete https-proxy` etc.
> 3. If your org issued a root CA bundle, point npm at it:
>    `npm config set cafile "C:\path\to\corporate-root-ca.pem"`.
> 4. **Last resort, one-off:** `npm config set strict-ssl false`,
>    install, then `npm config delete strict-ssl`. Don't leave it off.
>
> If the install keeps failing, Option A is fine — you don't need
> `firebase-admin` installed locally to ship the app.

### Sign-in flow in the app

1. Long-press the Taking Monday logo on the home screen for 5s to reach
   the admin login screen.
2. Enter the admin's email + password and the local CAPTCHA word
   (`monday`). The CAPTCHA is a soft client-side speedbump — real
   protection comes from Firebase Auth + the Firestore rules above.
3. After sign-in, `app/admin/_layout.tsx` redirects authenticated admins
   to the dashboard and bounces unauthenticated visitors back to login.
4. The dashboard header shows the admin's email and a **Sign out** button.

> ⚠️ The Firebase JS SDK only supports server-side reCAPTCHA Enterprise
> via Cloud Functions or REST. If you need real CAPTCHA in the mobile
> client, wrap login in a Cloud Function and validate the token there
> before authenticating.

## 6. App Check (recommended)

Enable **Firebase App Check** before public launch to reduce scripted
abuse alongside the per-device click limit. Use the **Play Integrity** /
**App Attest** providers on native and **reCAPTCHA Enterprise** for web.

## 7. Current status

- Public app reads `counters/global` and active `wall_entries` from
  Firestore.
- Public taps go through `firebaseBackend.ts` (currently direct writes —
  swap to a callable Cloud Function before launch, see §2.3).
- Admin login is real: Firebase Auth + admin-role check + persistent
  session.
- Admin dashboard CRUD already runs through Firestore via
  `AppDataContext`.

---

**Security reminder:** Never commit `serviceAccount.json`, `.env`, API
keys, or personal access tokens. If a token was ever committed, **revoke
and rotate** it in Firebase and Google consoles. The `.env` file is
already covered by `.gitignore`.
