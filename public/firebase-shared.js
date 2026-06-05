import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyC7jRa33S56JYbvKXfphVKgTpFOs8aE21A',
    authDomain: 'teleios-7bf72.firebaseapp.com',
    projectId: 'teleios-7bf72',
    storageBucket: 'teleios-7bf72.firebasestorage.app',
    messagingSenderId: '340776709886',
    appId: '1:340776709886:web:43adcc1dc242f60df13faf',
    measurementId: 'G-VMW3SLQWDF'
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const EVENTS_DOC_REF = { collection: 'siteConfig', id: 'events' };
export const EVENTS_JSON_URL = 'events.json';
