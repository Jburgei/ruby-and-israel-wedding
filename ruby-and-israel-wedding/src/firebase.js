import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

// Guests register/log in with a name + password instead of an e-mail.
// Firebase Auth needs an e-mail-shaped identifier under the hood, so we
// build one from a normalized version of the name under a fixed, fake
// domain — guests never see or type this, it's just plumbing.
function nameToEmail(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug || "guest"}@guest.burkachi.com`;
}

export async function registerGuest(name, password) {
  const cred = await createUserWithEmailAndPassword(auth, nameToEmail(name), password);
  return cred.user;
}

export async function loginGuest(name, password) {
  const cred = await signInWithEmailAndPassword(auth, nameToEmail(name), password);
  return cred.user;
}

export function logoutGuest() {
  return signOut(auth);
}

// Subscribes to auth state; callback receives the Firebase user or null.
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
