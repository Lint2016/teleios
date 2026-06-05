import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, EVENTS_DOC_REF, EVENTS_JSON_URL } from './firebase-shared.js';

const CATEGORY_PRESETS = {
    Worship: { categoryColor: '#0066CC', icon: 'fas fa-music' },
    Prayer: { categoryColor: '#7C3AED', icon: 'fas fa-hands-praying' },
    Youth: { categoryColor: '#F59E0B', icon: 'fas fa-users' },
    Fellowship: { categoryColor: '#EC4899', icon: 'fas fa-tree' },
    Celebration: { categoryColor: '#059669', icon: 'fas fa-dove' },
    Teaching: { categoryColor: '#7C3AED', icon: 'fas fa-book-open' },
    Milestone: { categoryColor: '#0891B2', icon: 'fas fa-water' },
    Outreach: { categoryColor: '#D97706', icon: 'fas fa-hand-holding-heart' }
};

const DEFAULT_RECURRING = [
    {
        id: 'sunday-worship',
        title: 'Sunday Worship Service',
        dayOfWeek: 0,
        hour: 9,
        minute: 0,
        durationHours: 2,
        timeLabel: '09:00 AM',
        recurringLabel: 'Every Sunday',
        description: 'Join us for inspiring worship, community prayer, and biblical teaching.',
        category: 'Worship',
        categoryColor: '#0066CC',
        icon: 'fas fa-music',
        location: '42 Antrim Road, Meredale South',
        isOnline: false
    },
    {
        id: 'wednesday-bible-study',
        title: 'Bible Study & Fellowship',
        dayOfWeek: 3,
        hour: 19,
        minute: 0,
        durationHours: 2,
        timeLabel: '7:00 PM',
        recurringLabel: 'Every Wednesday',
        description: 'Join us online for Bible study, discussion, and fellowship.',
        category: 'Teaching',
        categoryColor: '#7C3AED',
        icon: 'fas fa-video',
        location: 'Online',
        isOnline: true,
        onlineUrl: 'https://www.youtube.com/channel/UCIqka1KcckcYRK3DXynQbiw'
    }
];

const eventsDocRef = doc(db, EVENTS_DOC_REF.collection, EVENTS_DOC_REF.id);

let recurringEvents = [];
let specialEvents = [];
let editingIndex = null;

const adminLogin = document.getElementById('admin-login');
const loginForm = document.getElementById('login-form');
const adminEmail = document.getElementById('admin-email');
const adminPassword = document.getElementById('admin-password');
const adminEditor = document.getElementById('admin-editor');
const loginMessage = document.getElementById('login-message');
const loginBtn = document.getElementById('login-btn');
const adminLastUpdated = document.getElementById('admin-last-updated');
const adminMessage = document.getElementById('admin-message');
const adminToolbar = document.getElementById('admin-toolbar');
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnToolbar = document.getElementById('logout-btn-toolbar');
const recurringList = document.getElementById('recurring-events-list');
const specialList = document.getElementById('special-events-list');
const eventForm = document.getElementById('event-form');
const eventFormTitle = document.getElementById('event-form-title');
const eventEditIndex = document.getElementById('event-edit-index');
const eventFormCancel = document.getElementById('event-form-cancel');
const eventFormSubmit = document.getElementById('event-form-submit');

function formatTimeLabel(hour, minute) {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString('en-ZA', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function parseTimeValue(timeValue) {
    const [hour, minute] = timeValue.split(':').map(Number);
    return { hour, minute };
}

function formatDisplayDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function showLogin() {
    adminLogin.classList.remove('hidden');
    adminEditor.classList.add('hidden');
    adminEditor.setAttribute('aria-hidden', 'true');
    adminLogin.setAttribute('aria-hidden', 'false');
    if (adminToolbar) adminToolbar.classList.add('hidden');
}

function showEditor() {
    adminLogin.classList.add('hidden');
    adminEditor.classList.remove('hidden');
    adminEditor.setAttribute('aria-hidden', 'false');
    adminLogin.setAttribute('aria-hidden', 'true');
    adminPassword.value = '';
    if (adminToolbar) adminToolbar.classList.remove('hidden');
    loadEventsFromCloud();
}

function showMessage(text, type = 'info', target = 'editor') {
    const el = target === 'login' ? loginMessage : adminMessage;
    if (!el) return;
    el.textContent = text;
    el.className = `admin-message admin-message-${type}`;
}

function showSuccessToast(title, text) {
    if (typeof Swal === 'undefined') {
        showMessage(text, 'success');
        return;
    }

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title,
        text,
        showConfirmButton: false,
        timer: 4500,
        timerProgressBar: true,
        background: '#0D1B2A',
        color: '#FAF9F6',
        iconColor: '#D4AF37'
    });
}

function setLastUpdated(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        adminLastUpdated.textContent = '';
        return;
    }
    adminLastUpdated.textContent = `Last published: ${timestamp.toDate().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

function buildSpecialEventFromForm() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const durationHours = parseFloat(document.getElementById('event-duration').value);
    const category = document.getElementById('event-category').value;
    const location = document.getElementById('event-location').value.trim();
    const description = document.getElementById('event-description').value.trim();
    const { hour, minute } = parseTimeValue(time);
    const preset = CATEGORY_PRESETS[category] || CATEGORY_PRESETS.Worship;

    return {
        title,
        date,
        hour,
        minute,
        durationHours,
        timeLabel: formatTimeLabel(hour, minute),
        description,
        category,
        categoryColor: preset.categoryColor,
        icon: preset.icon,
        location
    };
}

function resetEventForm() {
    eventForm.reset();
    const dateInput = document.getElementById('event-date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    document.getElementById('event-location').value = '42 Antrim Road, Meredale South';
    document.getElementById('event-duration').value = '2';
    eventEditIndex.value = '';
    editingIndex = null;
    eventFormTitle.textContent = 'Add Special Event';
    eventFormSubmit.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save &amp; Publish';
    eventFormCancel.classList.add('hidden');
}

function fillEventForm(event, index) {
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-time').value = `${String(event.hour).padStart(2, '0')}:${String(event.minute).padStart(2, '0')}`;
    document.getElementById('event-duration').value = String(event.durationHours);
    document.getElementById('event-category').value = event.category || 'Worship';
    document.getElementById('event-location').value = event.location || '42 Antrim Road, Meredale South';
    document.getElementById('event-description').value = event.description || '';
    eventEditIndex.value = String(index);
    editingIndex = index;
    eventFormTitle.textContent = 'Edit Special Event';
    eventFormSubmit.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Update &amp; Publish';
    eventFormCancel.classList.remove('hidden');
    eventForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRecurringEvents() {
    if (!recurringList) return;

    if (!recurringEvents.length) {
        recurringList.innerHTML = '<p class="admin-note">No weekly services configured.</p>';
        return;
    }

    recurringList.innerHTML = recurringEvents.map((event) => {
        const locationIcon = event.isOnline ? 'fas fa-video' : 'fas fa-map-marker-alt';
        const onlineNote = event.isOnline ? '<p class="admin-event-meta"><i class="fas fa-play-circle"></i> Online service</p>' : '';
        return `
        <article class="admin-event-card admin-event-card--recurring">
            <div class="admin-event-card-main">
                <h4>${event.title}</h4>
                <p class="admin-event-meta"><i class="fas fa-redo"></i> ${event.recurringLabel}</p>
                <p class="admin-event-meta"><i class="fas fa-clock"></i> ${event.timeLabel}</p>
                <p class="admin-event-meta"><i class="${locationIcon}"></i> ${event.location}</p>
                ${onlineNote}
            </div>
        </article>
    `;
    }).join('');
}

function renderSpecialEvents() {
    if (!specialList) return;

    const now = new Date();
    const upcoming = specialEvents
        .map((event, index) => ({ event, index }))
        .filter(({ event }) => {
            const [year, month, day] = event.date.split('-').map(Number);
            const start = new Date(year, month - 1, day, event.hour, event.minute);
            return start > now;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.event.date}T${String(a.event.hour).padStart(2, '0')}:${String(a.event.minute).padStart(2, '0')}`);
            const dateB = new Date(`${b.event.date}T${String(b.event.hour).padStart(2, '0')}:${String(b.event.minute).padStart(2, '0')}`);
            return dateA - dateB;
        });

    if (!upcoming.length) {
        specialList.innerHTML = '<p class="admin-note">No upcoming special events yet. Add one using the form above.</p>';
        return;
    }

    specialList.innerHTML = upcoming.map(({ event, index }) => `
        <article class="admin-event-card">
            <div class="admin-event-card-main">
                <div class="admin-event-card-header">
                    <h4>${event.title}</h4>
                    <span class="admin-event-badge" style="background:${event.categoryColor}">${event.category}</span>
                </div>
                <p class="admin-event-meta"><i class="fas fa-calendar-day"></i> ${formatDisplayDate(event.date)} at ${event.timeLabel}</p>
                <p class="admin-event-meta"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p class="admin-event-desc">${event.description}</p>
            </div>
            <div class="admin-event-card-actions">
                <button type="button" class="btn btn-secondary btn-sm" data-edit-index="${index}">Edit</button>
                <button type="button" class="btn btn-secondary btn-sm admin-btn-danger" data-delete-index="${index}">Delete</button>
            </div>
        </article>
    `).join('');

    specialList.querySelectorAll('[data-edit-index]').forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.editIndex);
            fillEventForm(specialEvents[index], index);
        });
    });

    specialList.querySelectorAll('[data-delete-index]').forEach((button) => {
        button.addEventListener('click', () => handleDeleteEvent(Number(button.dataset.deleteIndex)));
    });
}

async function saveEventsToCloud(successTitle, successText) {
    recurringEvents = [...DEFAULT_RECURRING];

    await setDoc(eventsDocRef, {
        recurringEvents,
        specialEvents,
        updatedAt: serverTimestamp()
    });

    const snapshot = await getDoc(eventsDocRef);
    setLastUpdated(snapshot.data()?.updatedAt);
    renderRecurringEvents();
    renderSpecialEvents();
    showSuccessToast(successTitle, successText);
    showMessage(successText, 'success');
}

async function loadEventsFromCloud() {
    showMessage('Loading events…', 'info');

    try {
        const snapshot = await getDoc(eventsDocRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            recurringEvents = [...DEFAULT_RECURRING];
            specialEvents = Array.isArray(data.specialEvents) ? data.specialEvents : [];
            setLastUpdated(data.updatedAt);
        } else {
            await loadFromJsonFallback();
        }

        renderRecurringEvents();
        renderSpecialEvents();
        showMessage('', 'info');
    } catch (error) {
        showMessage(`Could not load events: ${error.message}`, 'error');
    }
}

async function loadFromJsonFallback() {
    const response = await fetch(EVENTS_JSON_URL, { cache: 'no-store' });
    if (!response.ok) {
        recurringEvents = [...DEFAULT_RECURRING];
        specialEvents = [];
        return;
    }

    const data = await response.json();
    recurringEvents = Array.isArray(data.recurringEvents) && data.recurringEvents.length
        ? data.recurringEvents
        : DEFAULT_RECURRING;
    specialEvents = Array.isArray(data.specialEvents) ? data.specialEvents : [];
}

async function handleEventFormSubmit(event) {
    event.preventDefault();

    const submitBtn = eventFormSubmit;
    submitBtn.disabled = true;
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing…';

    try {
        const newEvent = buildSpecialEventFromForm();
        const editIdx = eventEditIndex.value !== '' ? Number(eventEditIndex.value) : null;

        if (editIdx !== null && !Number.isNaN(editIdx)) {
            specialEvents[editIdx] = newEvent;
        } else {
            specialEvents.push(newEvent);
        }

        specialEvents.sort((a, b) => {
            const dateA = new Date(`${a.date}T${String(a.hour).padStart(2, '0')}:${String(a.minute).padStart(2, '0')}`);
            const dateB = new Date(`${b.date}T${String(b.hour).padStart(2, '0')}:${String(b.minute).padStart(2, '0')}`);
            return dateA - dateB;
        });

        await saveEventsToCloud(
            editIdx !== null ? 'Event updated!' : 'Event published!',
            editIdx !== null
                ? `"${newEvent.title}" is now live on the website.`
                : `"${newEvent.title}" has been added to the website.`
        );

        resetEventForm();
    } catch (error) {
        showMessage(`Save failed: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
    }
}

async function handleDeleteEvent(index) {
    const event = specialEvents[index];
    if (!event) return;

    const confirmed = typeof Swal !== 'undefined'
        ? (await Swal.fire({
            title: 'Delete this event?',
            text: `"${event.title}" will be removed from the website.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#b91c1c',
            cancelButtonColor: '#6c757d'
        })).isConfirmed
        : window.confirm(`Delete "${event.title}"?`);

    if (!confirmed) return;

    specialEvents.splice(index, 1);

    try {
        await saveEventsToCloud('Event deleted', `"${event.title}" has been removed from the website.`);
        if (editingIndex === index) resetEventForm();
    } catch (error) {
        showMessage(`Delete failed: ${error.message}`, 'error');
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
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
            const hint = error.code === 'auth/operation-not-allowed'
                ? 'Email/Password sign-in is not enabled in Firebase.'
                : 'Incorrect email or password.';
            showMessage(hint, 'error', 'login');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        }
    });
}

if (eventForm) eventForm.addEventListener('submit', handleEventFormSubmit);
if (eventFormCancel) eventFormCancel.addEventListener('click', resetEventForm);
async function handleLogout() {
    await signOut(auth);
    resetEventForm();
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (logoutBtnToolbar) logoutBtnToolbar.addEventListener('click', handleLogout);

onAuthStateChanged(auth, (user) => {
    if (user) {
        showEditor();
        return;
    }
    showLogin();
});
