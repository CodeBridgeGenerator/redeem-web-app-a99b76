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

// TODO: Replace with your Firebase config
// Get these values from your Firebase project settings (voucher-app-62d60)
const firebaseConfig = {
  apiKey: "AIzaSyC21xQsrOLApZ-1trsK3_xAGnamqoha0l4",
  authDomain: "voucher-app-62d60.firebaseapp.com",
  projectId: "voucher-app-62d60",
  storageBucket: "voucher-app-62d60.firebasestorage.app",
  messagingSenderId: "879989522818",
  appId: "1:879989522818:web:f5e917fdff226f5156cf9b"
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
