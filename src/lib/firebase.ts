import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); // Enforces enterprise DB selection
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add Google Workspace Scopes
googleProvider.addScope("https://www.googleapis.com/auth/forms.body");
googleProvider.addScope("https://www.googleapis.com/auth/forms.responses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/forms");
googleProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.compose");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.modify");

// Standardized Google Sign-In with popup
googleProvider.setCustomParameters({ prompt: "select_account" });
