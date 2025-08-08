import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  OAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";

// Firebase config via environment variables (do not commit real values)
// Set these in your environment (REACT_APP_*) before building/running
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Check if Firebase is properly configured
const isConfigured = Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence asynchronously
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Failed to set persistence:", error);
});

console.log("Firebase initialized successfully");
console.log("Current domain:", window.location.hostname);
console.log("Firebase auth domain:", firebaseConfig.authDomain);
console.log("Full URL:", window.location.href);

// Check if current domain is authorized
const currentDomain = window.location.hostname;
const authorizedDomains = ['localhost', '127.0.0.1', '192.168.0.3', firebaseConfig.authDomain];
if (!authorizedDomains.includes(currentDomain)) {
  console.warn(`Current domain (${currentDomain}) may not be authorized for Firebase Auth`);
}

// Configure OAuth providers
const providerForApple = new OAuthProvider("apple.com");
providerForApple.addScope("email");

const providerForFacebook = new FacebookAuthProvider();
providerForFacebook.setCustomParameters({ display: "popup", scope: "email" });

const providerForGithub = new GithubAuthProvider();
providerForGithub.addScope("user:email");

const providerForGoogle = new GoogleAuthProvider();
providerForGoogle.addScope("https://www.googleapis.com/auth/userinfo.email");
providerForGoogle.addScope("https://www.googleapis.com/auth/userinfo.profile");
// Force account selection
providerForGoogle.setCustomParameters({
  prompt: 'select_account'
});

const providerForMS = new OAuthProvider("microsoft.com");
providerForMS.setCustomParameters({ scope: "openid email" });

export {
  auth,
  providerForApple,
  providerForFacebook,
  providerForGithub,
  providerForGoogle,
  providerForMS,
  isConfigured
};
