import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

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

export function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject);
      }
    });
  });
}