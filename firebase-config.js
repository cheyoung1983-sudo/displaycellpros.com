// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging"; // Import Messaging
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAk9aTCTHoE6RAfKpt9WNDYxvUHtSUZ3aI",
  authDomain: "displaycellpros-com.firebaseapp.com",
  projectId: "displaycellpros-com",
  storageBucket: "displaycellpros-com.firebasestorage.app",
  messagingSenderId: "1046067704682",
  appId: "1:1046067704682:web:310b9d76c30c190d5bab13",
  measurementId: "G-3FG5F3TYVB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics is only supported in browser environments. 
// This check prevents errors when running in Node.js.
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Cloud Messaging safely
// This check prevents errors when running in Node.js environments.
let messaging;
isMessagingSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { app, analytics, messaging };