import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, EVENTS_DOC_REF, EVENTS_JSON_URL } from './firebase-shared.js';

const DEBUG = true;
const debugLogEl = document.getElementById('admin-debug-log');

function adminLog(message, detail) {
    const time = new Date().toLocaleTimeString('en-ZA');
    const line = detail !== undefined
        ? `[${time}] ${message} ${typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2)}`
        : `[${time}] ${message}`;

    if (DEBUG) console.log('[Teleios Admin]', message, detail !== undefined ? detail : '');

    if (debugLogEl) {
        debugLogEl.textContent = debugLogEl.textContent === 'Waiting for admin.js…'
            ? line
            : `${debugLogEl.textContent}\n${line}`;
        debugLogEl.scrollTop = debugLogEl.scrollHeight;
    }
}

function maskEmail(email) {
    if (!email || !email.includes('@')) return '(empty)';
    const [user, domain] = email.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
}

adminLog('admin.js module loaded');

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

adminLog('DOM elements', {
    loginForm: !!loginForm,
    adminEmail: !!adminEmail,
    adminPassword: !!adminPassword,
    loginBtn: !!loginBtn,
    loginMessage: !!loginMessage,
    adminEditor: !!adminEditor
});

adminLog('Firebase project', auth.app?.options?.projectId || 'unknown');
adminLog('Firestore path', `${EVENTS_DOC_REF.collection}/${EVENTS_DOC_REF.id}`);

const eventsDocRef = doc(db, EVENTS_DOC_REF.collection, EVENTS_DOC_REF.id);

function showLogin() {
    adminLog('UI: showing login screen');
    adminLogin.classList.remove('hidden');
    adminEditor.classList.add('hidden');
    adminEditor.setAttribute('aria-hidden', 'true');
    adminLogin.setAttribute('aria-hidden', 'false');
    if (adminMessage) adminMessage.textContent = '';
}

function showEditor() {
    adminLog('UI: showing event editor');
    adminLogin.classList.add('hidden');
    adminEditor.classList.remove('hidden');
    adminEditor.setAttribute('aria-hidden', 'false');
    adminLogin.setAttribute('aria-hidden', 'true');
    adminPassword.value = '';
    loadEventsFromCloud();
}

function showMessage(text, type = 'info', target = 'editor') {
    const el = target === 'login' ? loginMessage : adminMessage;
    adminLog(`Message (${target}/${type})`, text || '(cleared)');
    if (!el) {
        adminLog('WARNING: message element missing', { target, type, text });
        return;
    }
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
    adminLog('Loading events from Firestore…');
    try {
        const snapshot = await getDoc(eventsDocRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            adminLog('Firestore document found', {
                recurringCount: (data.recurringEvents || []).length,
                specialCount: (data.specialEvents || []).length,
                hasUpdatedAt: !!data.updatedAt
            });
            eventJsonTextarea.value = JSON.stringify({
                recurringEvents: data.recurringEvents || [],
                specialEvents: data.specialEvents || []
            }, null, 2);
            setLastUpdated(data.updatedAt);
            showMessage('Event data loaded from the cloud.', 'success');
            return;
        }

        adminLog('No Firestore document yet — importing events.json');
        await importFromJsonFile(true);
    } catch (error) {
        adminLog('Firestore load FAILED', { code: error.code, message: error.message });
        showMessage(`Could not load cloud events: ${error.message}`, 'error');
    }
}

async function importFromJsonFile(isAutoSeed = false) {
    adminLog('Importing from events.json…');
    try {
        const response = await fetch(EVENTS_JSON_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Could not load ${EVENTS_JSON_URL}`);
        }

        const data = await response.json();
        eventJsonTextarea.value = JSON.stringify(data, null, 2);
        setLastUpdated(null);
        adminLog('events.json imported', {
            recurringCount: (data.recurringEvents || []).length,
            specialCount: (data.specialEvents || []).length
        });

        if (isAutoSeed) {
            showMessage('No cloud events yet. Loaded events.json — edit and click Save to Cloud to publish.', 'info');
        } else {
            showMessage('Imported events.json into the editor. Click Save to Cloud to publish.', 'success');
        }
    } catch (error) {
        adminLog('events.json import FAILED', { message: error.message });
        showMessage(`Import failed: ${error.message}`, 'error');
    }
}

async function saveToCloud() {
    const parsed = validateJson();
    if (!parsed) return;

    btnSave.disabled = true;
    btnSave.textContent = 'Saving…';
    adminLog('Saving to Firestore…');

    try {
        await setDoc(eventsDocRef, {
            recurringEvents: parsed.recurringEvents,
            specialEvents: parsed.specialEvents,
            updatedAt: serverTimestamp()
        });

        const snapshot = await getDoc(eventsDocRef);
        setLastUpdated(snapshot.data()?.updatedAt);
        adminLog('Save SUCCESS');
        showMessage('Events published! The live site will show your changes on the next page load.', 'success');
    } catch (error) {
        adminLog('Save FAILED', { code: error.code, message: error.message });
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
    adminLog('ERROR: login form not found — admin.js may not be wired to the page');
    console.error('Admin login form not found — admin.js may have loaded before the DOM.');
} else {
    adminLog('Login form listener attached');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = adminEmail.value.trim();
        const password = adminPassword.value;

        adminLog('Sign In clicked', {
            email: maskEmail(email),
            passwordLength: password.length
        });

        if (!email) {
            showMessage('Enter your admin email.', 'error', 'login');
            adminLog('Blocked: empty email');
            return;
        }

        if (!password) {
            showMessage('Enter your password.', 'error', 'login');
            adminLog('Blocked: empty password');
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing in…';
        }
        showMessage('Signing in…', 'info', 'login');

        try {
            adminLog('Calling signInWithEmailAndPassword…');
            const credential = await signInWithEmailAndPassword(auth, email, password);
            adminLog('signInWithEmailAndPassword SUCCESS', {
                uid: credential.user.uid,
                email: maskEmail(credential.user.email)
            });
            showMessage('', 'info', 'login');
        } catch (error) {
            adminLog('signInWithEmailAndPassword FAILED', {
                code: error.code,
                message: error.message
            });
            console.error('Admin sign-in failed:', error);

            let hint;
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    hint = 'Incorrect email or password. Check Firebase Console → Authentication → Users.';
                    break;
                case 'auth/invalid-email':
                    hint = 'Invalid email format.';
                    break;
                case 'auth/too-many-requests':
                    hint = 'Too many attempts. Wait a moment and try again.';
                    break;
                case 'auth/network-request-failed':
                    hint = 'Network error. Check your internet connection.';
                    break;
                case 'auth/operation-not-allowed':
                    hint = 'Email/Password sign-in is not enabled. Enable it in Firebase Console → Authentication.';
                    break;
                default:
                    hint = `Sign in failed (${error.code || 'unknown'}): ${error.message}`;
            }

            showMessage(hint, 'error', 'login');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        }
    });
}

if (btnSave) btnSave.addEventListener('click', saveToCloud);
if (btnValidate) btnValidate.addEventListener('click', validateJson);
if (btnReload) btnReload.addEventListener('click', loadEventsFromCloud);
if (btnImport) btnImport.addEventListener('click', () => importFromJsonFile(false));
if (btnDownload) btnDownload.addEventListener('click', downloadJsonFile);
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        adminLog('Sign out clicked');
        await signOut(auth);
    });
}

adminLog('Setting up onAuthStateChanged listener…');

onAuthStateChanged(auth, (user) => {
    if (user) {
        adminLog('Auth state: SIGNED IN', {
            uid: user.uid,
            email: maskEmail(user.email)
        });
        showEditor();
        return;
    }

    adminLog('Auth state: SIGNED OUT');
    showLogin();
}, (error) => {
    adminLog('onAuthStateChanged ERROR', { code: error.code, message: error.message });
    showMessage(`Auth error: ${error.message}`, 'error', 'login');
});

adminLog('Admin init complete — try signing in');
