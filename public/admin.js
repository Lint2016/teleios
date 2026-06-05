const ADMIN_PASSWORD = 'Teleios2026!';
const AUTH_STORAGE_KEY = 'teleiosAdminAuthenticated';
const EVENTS_JSON_URL = 'events.json';

const adminLogin = document.getElementById('admin-login');
const loginForm = document.getElementById('login-form');
const adminPassword = document.getElementById('admin-password');
const adminEditor = document.getElementById('admin-editor');
const eventJsonTextarea = document.getElementById('event-json');
const adminMessage = document.getElementById('admin-message');
const btnValidate = document.getElementById('btn-validate');
const btnCopy = document.getElementById('btn-copy');
const btnDownload = document.getElementById('btn-download');
const btnReload = document.getElementById('btn-reload');
const logoutBtn = document.getElementById('logout-btn');

function isAuthenticated() {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

function setAuthenticated(value) {
    localStorage.setItem(AUTH_STORAGE_KEY, value ? 'true' : 'false');
}

function showLogin() {
    adminLogin.classList.remove('hidden');
    adminEditor.classList.add('hidden');
    adminEditor.setAttribute('aria-hidden', 'true');
    adminLogin.setAttribute('aria-hidden', 'false');
    adminMessage.textContent = '';
}

function showEditor() {
    adminLogin.classList.add('hidden');
    adminEditor.classList.remove('hidden');
    adminEditor.setAttribute('aria-hidden', 'false');
    adminLogin.setAttribute('aria-hidden', 'true');
    adminPassword.value = '';
    loadEventJson();
}

function showMessage(text, type = 'info') {
    adminMessage.textContent = text;
    adminMessage.className = `admin-message admin-message-${type}`;
}

async function loadEventJson() {
    try {
        const response = await fetch(EVENTS_JSON_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Could not load ${EVENTS_JSON_URL}`);
        }
        const data = await response.json();
        eventJsonTextarea.value = JSON.stringify(data, null, 2);
        showMessage('Event data loaded. Make your changes and validate before downloading.', 'success');
    } catch (error) {
        showMessage(`Unable to load ${EVENTS_JSON_URL}. Check the file location and server configuration.`, 'error');
    }
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
        showMessage('JSON is valid. You can download the updated file now.', 'success');
        return parsed;
    } catch (error) {
        showMessage(`Validation failed: ${error.message}`, 'error');
        return null;
    }
}

function copyJsonToClipboard() {
    eventJsonTextarea.select();
    document.execCommand('copy');
    showMessage('JSON copied to clipboard. Paste into your editor or deployment file.', 'success');
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
    showMessage('Download started. Replace the public/events.json file in your deployment.', 'success');
}

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = adminPassword.value.trim();
    if (password === ADMIN_PASSWORD) {
        setAuthenticated(true);
        showEditor();
    } else {
        showMessage('Incorrect password. Please try again.', 'error');
    }
});

btnValidate.addEventListener('click', validateJson);
btnCopy.addEventListener('click', copyJsonToClipboard);
btnDownload.addEventListener('click', downloadJsonFile);
btnReload.addEventListener('click', loadEventJson);
logoutBtn.addEventListener('click', () => {
    setAuthenticated(false);
    showLogin();
});

window.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        showEditor();
        return;
    }
    showLogin();
});
