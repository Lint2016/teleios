import { doc, getDoc } from 'firebase/firestore';
import { db, EVENTS_DOC_REF, EVENTS_JSON_URL } from './firebase-shared.js';

function normalizeEventData(data) {
    if (!data || typeof data !== 'object') return null;

    const recurringEvents = Array.isArray(data.recurringEvents) ? data.recurringEvents : [];
    const specialEvents = Array.isArray(data.specialEvents) ? data.specialEvents : [];

    if (!recurringEvents.length && !specialEvents.length) return null;

    // Failsafe: Ensure wednesday-bible-study uses the community link, even if the database has the old YouTube link
    recurringEvents.forEach(event => {
        if (event.id === 'wednesday-bible-study' && event.onlineUrl && event.onlineUrl.includes('youtube.com')) {
            event.onlineUrl = 'https://teleioscommunity.mn.co/';
        }
    });

    return { recurringEvents, specialEvents };
}

async function loadEventsFromJson() {
    const response = await fetch(EVENTS_JSON_URL, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${EVENTS_JSON_URL}`);
    }

    const data = await response.json();
    return normalizeEventData(data);
}

export async function loadEventData() {
    try {
        const snapshot = await getDoc(doc(db, EVENTS_DOC_REF.collection, EVENTS_DOC_REF.id));
        if (snapshot.exists()) {
            const cloudData = normalizeEventData(snapshot.data());
            if (cloudData) return cloudData;
        }
    } catch (error) {
        console.warn('Could not load events from Firestore, trying events.json.', error);
    }

    try {
        const jsonData = await loadEventsFromJson();
        if (jsonData) return jsonData;
    } catch (error) {
        console.warn('Could not load events.json.', error);
    }

    return null;
}

window.teleiosLoadEventData = loadEventData;
