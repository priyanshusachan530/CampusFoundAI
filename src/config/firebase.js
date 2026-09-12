import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdCnS-oJtyDNbU92imQqap9HBbSALx3uA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campusfoundai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campusfoundai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campusfoundai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "477128388127",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:477128388127:web:3a3a7b60861ec9b4742f2a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WB57SJE9QX"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  String(firebaseConfig.apiKey).trim() !== ""
);

// Initialize or retrieve existing app instance safely
export const app = isFirebaseConfigured
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let analytics = null;
if (typeof window !== "undefined" && app) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
export { analytics };

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false
    }
  };
  console.warn(`[Firestore ${operationType}] (${path}):`, errInfo.error);
  return errInfo;
}
