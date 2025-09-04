// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "techflow-dashboard",
  "appId": "1:694306714430:web:6791d2a6e8a04560c8b26f",
  "storageBucket": "techflow-dashboard.firebasestorage.app",
  "apiKey": "AIzaSyA0--ypKi7d-swYKNIA27oSC7JZPSjrFlM",
  "authDomain": "techflow-dashboard.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "694306714430"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
