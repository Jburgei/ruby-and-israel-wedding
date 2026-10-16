import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArqnpqXuHFaSv7aeVfuFPt7xmPaOSz980",
  authDomain: "ruby-israel-wedding.firebaseapp.com",
  projectId: "ruby-israel-wedding",
  storageBucket: "ruby-israel-wedding.firebasestorage.app",
  messagingSenderId: "699735064242",
  appId: "1:699735064242:web:4f0677abf15745526c93ab",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Guests no longer register with a password — signing up is just name +
// phone number, and the phone/browser remembers them afterwards. Under the
// hood we still need *some* Firebase Auth identity so Firestore security
// rules have a request.auth.uid to check post ownership against, so every
// guest gets a plain anonymous session. ensureSignedIn() makes sure one
// exists (reusing the existing one if the browser already has it — that's
// what makes a guest "remembered" after their first visit) and resolves
// once we have a uid to work with.
export function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    signInAnonymously(auth).then(
      (cred) => resolve(cred.user),
      (err) => reject(err)
    );
  });
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function logoutGuest() {
  return signOut(auth);
}
