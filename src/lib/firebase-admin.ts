import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import firebaseConfig from "../../firebase-applet-config.json";

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    databaseURL: (firebaseConfig as any).databaseURL || `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`,
  });
}

export const adminAuth = getAuth();
