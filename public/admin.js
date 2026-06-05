import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, EVENTS_DOC_REF, EVENTS_JSON_URL } from './firebase-shared.js';

const adminLogin = document.getElementById('admin-login');
const loginForm = document.getElementById('login-form');
const adminEmail = document.getElementById('admin-email');
const adminPassword = document.getElementById('admin-password');
const adminEditor = document.getElementById('admin-editor');
const eventJsonTextarea = document.getElementById('event-json');
const adminMessage = document.getElementById('admin-message');
const loginMessage = document.getElementById('login-message');
const loginBtn = document.getElementById('login-btn');
const adminLastUpdated = document.getElementById('admin-last-updated');
const btnSave = document.getElementById('btn-save');
const btnValidate = document.getElementById('btn-validate');
const btnReload = document.getElementById('btn-reload');
const btnImport = document.getElementById('btn-import');
const btnDownload = document.getElementById('btn-download');
const logoutBtn = document.getElementById('logout-btn');

const eventsDocRef = doc(db, EVENTS_DOC_REF.collection, EVENTS_DOC_REF.id);

function showLogin() {
    adminLogin.classList.remove('hidden');
    adminEditor.classList.add('hidden');
    adminEditor.setAttribute('aria-hidden', 'true');
    adminLogin.setAttribute('aria-hidden', 'false');
    if (adminMessage) adminMessage.textContent = '';
}

function showEditor() {
    adminLogin.classList.add('hidden');
    adminEditor.classList.remove('hidden');
    adminEditor.setAttribute('aria-hidden', 'false');
    adminLogin.setAttribute('aria-hidden', 'true');
    adminPassword.value = '';
    loadEventsFromCloud();
}

function showMessage(text, type = 'info', target = 'editor') {
    const el = target === 'login' ? loginMessage : adminMessage;
    if (!el) return;
    el.textContent = text;
    el.className = `admin-message admin-message-${type}`;
}

function formatUpdatedAt(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    return `Last published: ${timestamp.toDate().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

function setLastUpdated(timestamp) {
    const label = formatUpdatedAt(timestamp);
    adminLastUpdated.textContent = label;
}

function validateJson() {
    try {
        const parsed = JSON.parse(eventJsonTextarea.value);
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('The JSON content must be an object.');
        }
        if (!Array.isArray(parsed.recurringEvents) || !Array.isArray(parsed.specialEvents)) {
            throw new Error('The JSON object must include recurringEvents and specialEvents arrays.');
        }
        showMessage('JSON is valid.', 'success');
        return parsed;
    } catch (error) {
        showMessage(`Validation failed: ${error.message}`, 'error');
        return null;
    }
}

async function loadEventsFromCloud() {
    try {
        const snapshot = await getDoc(eventsDocRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            eventJsonTextarea.value = JSON.stringify({
                recurringEvents: data.recurringEvents || [],
                specialEvents: data.specialEvents || []
            }, null, 2);
            setLastUpdated(data.updatedAt);
            showMessage('Event data loaded from the cloud.', 'success');
            return;
        }

        await importFromJsonFile(true);
    } catch (error) {
        showMessage(`Could not load cloud events: ${error.message}`, 'error');
    }
}

async function importFromJsonFile(isAutoSeed = false) {
    try {
        const response = await fetch(EVENTS_JSON_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Could not load ${EVENTS_JSON_URL}`);
        }

        const data = await response.json();
        eventJsonTextarea.value = JSON.stringify(data, null, 2);
        setLastUpdated(null);

        if (isAutoSeed) {
            showMessage('No cloud events yet. Loaded events.json — edit and click Save to Cloud to publish.', 'info');
        } else {
            showMessage('Imported events.json into the editor. Click Save to Cloud to publish.', 'success');
        }
    } catch (error) {
        showMessage(`Import failed: ${error.message}`, 'error');
    }
}

async function saveToCloud() {
    const parsed = validateJson();
    if (!parsed) return;

    btnSave.disabled = true;
    btnSave.textContent = 'Saving…';

    try {
        await setDoc(eventsDocRef, {
            recurringEvents: parsed.recurringEvents,
            specialEvents: parsed.specialEvents,
            updatedAt: serverTimestamp()
        });

        const snapshot = await getDoc(eventsDocRef);
        setLastUpdated(snapshot.data()?.updatedAt);
        showMessage('Events published! The live site will show your changes on the next page load.', 'success');
    } catch (error) {
        showMessage(`Save failed: ${error.message}`, 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = 'Save to Cloud';
    }
}

function downloadJsonFile() {
    const parsed = validateJson();
    if (!parsed) return;

    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('Backup download started.', 'success');
}

if (!loginForm) {
    console.error('Admin login form not found — admin.js may have loaded before the DOM.');
} else {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = adminEmail.value.trim();
        const password = adminPassword.value;

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing in…';
        }
        showMessage('Signing in…', 'info', 'login');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showMessage('', 'info', 'login');
        } catch (error) {
            console.error('Admin sign-in failed:', error);
            const hint = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password'
                ? 'Incorrect email or password.'
                : error.code === 'auth/too-many-requests'
                    ? 'Too many attempts. Wait a moment and try again.'
                    : `Sign in failed (${error.code || 'unknown error'}).`;
            showMessage(hint, 'error', 'login');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        }
    });
}

btnSave.addEventListener('click', saveToCloud);
btnValidate.addEventListener('click', validateJson);
btnReload.addEventListener('click', loadEventsFromCloud);
btnImport.addEventListener('click', () => importFromJsonFile(false));
btnDownload.addEventListener('click', downloadJsonFile);
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        showEditor();
        return;
    }
    showLogin();
});
