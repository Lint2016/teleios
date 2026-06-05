import { getAnalytics } from 'firebase/analytics';
import { app } from './firebase-shared.js';

if (typeof window !== 'undefined') {
    getAnalytics(app);
}
