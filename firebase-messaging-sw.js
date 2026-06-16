// Import scripts for the Service Worker context
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

// Initialize Firebase in the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyAk9aTCTHoE6RAfKpt9WNDYxvUHtSUZ3aI",
  authDomain: "displaycellpros-com.firebaseapp.com",
  projectId: "displaycellpros-com",
  storageBucket: "displaycellpros-com.firebasestorage.app",
  messagingSenderId: "1046067704682",
  appId: "1:1046067704682:web:310b9d76c30c190d5bab13"
});

const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
});