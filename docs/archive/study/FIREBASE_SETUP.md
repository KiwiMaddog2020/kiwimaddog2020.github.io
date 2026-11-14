# Study sign-in: Firebase setup (one-time)

Google sign-in + cloud progress sync is built and shipped **inert** — it does
nothing until the Firebase web config is pasted into `assets/learn.js`
(`firebaseConfig`, currently `PASTE_…` placeholders). These are the one-time
console steps. The config values are **public** (safe to commit); access is
gated by Firestore rules + authorized domains, below.

## 1. Create the project
1. https://console.firebase.google.com → **Add project** → name it (e.g. `kiwimaddog-study`).
   Google Analytics is optional — you can skip it.

## 2. Enable Google sign-in
2. Left nav → **Build → Authentication → Get started**.
3. **Sign-in method** tab → **Google** → enable → pick a support email → **Save**.
4. **Settings** tab → **Authorized domains** → **Add domain** → `kiwimaddog2020.github.io`
   (`localhost` is already there for local testing).

## 3. Create Firestore + lock it down
5. **Build → Firestore Database → Create database** → **Production mode** →
   region `northamerica-northeast1` (Montreal) or `nam5` → enable.
6. **Rules** tab → paste exactly this → **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /study_progress/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
   This means: a signed-in user can read/write only their own progress doc, nobody else's.

## 4. Get the web config
7. **Project settings** (gear, top-left) → **General** → scroll to **Your apps** →
   click the **Web** icon `</>` → register an app (nickname `study`, no Hosting needed) →
   copy the `firebaseConfig` object it shows (apiKey, authDomain, projectId, appId, …).

## 5. Hand it to me
8. Paste that `firebaseConfig` object here in chat. I'll drop it into
   `study/assets/learn.js`, commit (the cache hash updates automatically), and the
   **Sign in** button goes live in the Study nav. Then sign in once on the live site
   to test — your existing local progress merges into the cloud on first sign-in
   (nothing is lost), and from then on it follows your Google account across devices
   and history clears.

## What the integration does (already built)
- **Sign in / Sign out** control in the Study top nav (appears only once configured).
- On sign-in: pulls your cloud progress, **merges** with whatever is in this browser
  (completed lessons kept from either side, quizzes keep the higher score, flashcard
  decks union), writes the merged result back. No progress is ever dropped.
- Afterward: every progress change (lesson complete, quiz best, flashcard, last-lesson)
  is mirrored to Firestore (debounced ~1.5s) and to localStorage, so it works offline
  and instantly, and survives a history wipe once you're signed in.
- Signed out, or before setup: behaves exactly as today (localStorage only).
