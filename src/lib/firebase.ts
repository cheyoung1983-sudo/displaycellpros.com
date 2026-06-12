import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // Enforces enterprise DB selection
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standardized Google Sign-In with popup
googleProvider.setCustomParameters({ prompt: "select_account" });
