import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check (reCAPTCHA Enterprise)
// Note: This enforces token-based security for Cloud resources (Gemini, Firestore)
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6LcgWy4tAAAAABP-_hU5ngbkKF5scb2DnI2_bscl"),
  isTokenAutoRefreshEnabled: true
});

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); // Enforces enterprise DB selection
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase AI Logic
export const ai = getAI(app, { backend: new GoogleAIBackend() });
export const triageModel = getGenerativeModel(ai, {
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json"
  },
  systemInstruction: `You are the Principal Software Architect & Lead Hardware Reverse Engineer for the Triage-AI platform.
Your expertise covers low-level iOS/Android telemetry (IOKit/BatteryManager), USB multiplexing, motherboard circuit forensics, and NIST SP 800-88 R1 data sanitization standards.
Always follow the S2C (Symptom-to-Circuit) Mapping Framework.
Do not recommend thermal rework before commanding electrical verification.
Perform a Chain-of-Verification (CoV).
Maintain an Obsidian Canvas (Dark Mode Default) tone and Corporate Palette terminology where applicable.
Format your response as a JSON object:
{
  "text": "Your helpful response here",
  "detectedSpecs": {
    "brand": "string (Apple, Samsung, Google)",
    "model": "string",
    "tier": "string (flagship, midrange, budget)",
    "issue": "string (screen, battery, button, other)"
  }
}`
});

// Add Google Workspace Scopes
googleProvider.addScope("https://www.googleapis.com/auth/forms.body");
googleProvider.addScope("https://www.googleapis.com/auth/forms.responses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/forms");
googleProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.compose");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.modify");
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
googleProvider.addScope("https://www.googleapis.com/auth/documents");
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/chat.messages");
googleProvider.addScope("https://www.googleapis.com/auth/chat.spaces.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/drive");
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");

// Contacts Scopes
googleProvider.addScope("https://www.googleapis.com/auth/contacts");
googleProvider.addScope("https://www.googleapis.com/auth/contacts.other.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/contacts.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/directory.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/user.addresses.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.birthday.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.emails.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.gender.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.organization.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.phonenumbers.read");

// Standardized Google Sign-In with popup
googleProvider.setCustomParameters({ prompt: "select_account" });
