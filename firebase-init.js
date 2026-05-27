// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7jRa33S56JYbvKXfphVKgTpFOs8aE21A",
  authDomain: "teleios-7bf72.firebaseapp.com",
  projectId: "teleios-7bf72",
  storageBucket: "teleios-7bf72.firebasestorage.app",
  messagingSenderId: "340776709886",
  appId: "1:340776709886:web:43adcc1dc242f60df13faf",
  measurementId: "G-VMW3SLQWDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
