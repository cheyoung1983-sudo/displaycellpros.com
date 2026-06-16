import { getToken } from "firebase/messaging";
import { messaging } from "./firebase-config.js";

// The Public Key you generated in the Firebase Console
const vapidKey = "WGP2BtN4TOLke7_YkHO2Flc-PUdNTGneu0vh7w6S4go";

export function requestNotificationPermission() {
  console.log("Requesting notification permission...");
  
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notifications.");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Permission granted!");
      
      // Get the unique token for this browser
      getToken(messaging, { vapidKey: vapidKey })
        .then((currentToken) => {
          if (currentToken) {
            console.log("Here is your FCM Token:", currentToken);
          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token:", err);
        });
    } else {
      console.log("Notification permission denied by user.");
    }
  });
}