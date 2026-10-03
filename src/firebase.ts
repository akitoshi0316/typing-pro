import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to ensure reliable connectivity inside preview iframes
const firestoreDbId =
  config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? config.firestoreDatabaseId
    : undefined;

initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firestoreDbId
);

export const db = getFirestore(app, config.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Ensure user has valid anonymous auth UID or persistent client ID
export function getOrCreateClientId(): string {
  try {
    let id = localStorage.getItem('typemaster_client_id');
    if (!id || id.length < 8) {
      id = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('typemaster_client_id', id);
    }
    return id;
  } catch {
    return 'usr_guest_' + Date.now().toString(36);
  }
}

export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch {
      // Anonymous auth may not be enabled on the project; fallback to client ID
    }
  }
  return auth.currentUser;
}

// Connection check with graceful offline fallback
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // If offline or network is slow, Firestore automatically operates in offline cache mode
  }
}
testConnection();
