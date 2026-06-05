//================================
//===========Carousel=============
//================================
const carouselImages = [
    'images/t2.jpg',
    'images/t3.jpg',
    'images/t4.jpg',
    'images/t5.jpg',
    'images/t6.jpg',
    'images/t7.jpg',
    'images/t8.jpg',
    'images/t9.jpg',
    'images/t10.jpg',
    'images/t11.jpg',
    'images/t12.jpg',
    'images/t13.jpg',
    'images/t14.jpg',
    'images/t15.jpg',
    'images/t16.jpg',
    'images/t17.jpg',
    'images/t18.jpg',
    'images/t19.jpg',
    'images/t20.jpg',
    'images/t21.jpg',
    'images/t22.jpg',
    'images/gathering.jpg'
];

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initializeCarousel() {
    const img = document.getElementById('carousel-img');
    if (!img || carouselImages.length < 2) return;

    if (prefersReducedMotion()) return;

    let currentIndex = carouselImages.indexOf(img.getAttribute('src') || '');
    if (currentIndex < 0) currentIndex = 0;

    const fadeMs = 450;
    const intervalMs = 4000;
    let timerId = null;

    img.style.transition = `opacity ${fadeMs}ms ease`;

    carouselImages.forEach((src) => {
        const preload = new Image();
        preload.src = src;
    });

    function showNext() {
        currentIndex = (currentIndex + 1) % carouselImages.length;
        const nextSrc = carouselImages[currentIndex];

        img.style.opacity = '0';

        window.setTimeout(() => {
            const onReady = () => {
                img.style.opacity = '1';
            };

            img.onload = onReady;
            img.onerror = onReady;
            img.src = nextSrc;

            if (img.complete) {
                onReady();
            }
        }, fadeMs);
    }

    timerId = window.setInterval(showNext, intervalMs);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.clearInterval(timerId);
        } else {
            window.clearInterval(timerId);
            timerId = window.setInterval(showNext, intervalMs);
        }
    });
}
// Global variables
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
let videoModal, iframe, closeBtn; // Will be initialized in DOMContentLoaded

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}
// ============================================
// Video Modal Functionality
// ============================================
function initializeVideoModal() {
    const modalElement = document.getElementById('videoModal');
    const closeButton = document.getElementById('closeModal');
    
    if (!modalElement || !closeButton) return;

    videoModal = modalElement;
    closeBtn = closeButton;
    iframe = document.getElementById('videoIframe');
    
    const closeModal = () => {
        videoModal.classList.remove('show');
        const frame = videoModal.querySelector('iframe');
        if (frame) frame.src = '';
        document.body.style.overflow = 'auto';
    };

    // Initialize close button (click + keyboard)
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeModal();
        }
    });
    
    // Close when clicking outside the modal content
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeModal();
        }
    });
    
    function openSermonVideo(card) {
        if (!card) {
            showNotification('Error: Could not find sermon information', 'error');
            return;
        }

        const videoId = card.getAttribute('data-video-id');
        if (!videoId) {
            showNotification('Error: No video available', 'error');
            return;
        }

        const frame = document.getElementById('videoIframe');
        if (frame) {
            frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
            videoModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        }
    }

    const sermonsGrid = document.getElementById('sermons-grid');
    if (sermonsGrid) {
        sermonsGrid.addEventListener('click', (e) => {
            const trigger = e.target.closest('.btn-video, .sermon-play-overlay');
            if (!trigger || !sermonsGrid.contains(trigger)) return;
            e.preventDefault();
            openSermonVideo(trigger.closest('.sermon-card'));
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global references
    videoModal = document.getElementById('videoModal');
    iframe = document.getElementById('videoIframe');
    closeBtn = document.getElementById('closeModal');
    
    initializeNavigation();
    initializeVideoModal();
    initializeFormAnimations();
    updateActiveNavLink();
    initializeScrollHandlers();
    initializeKeyboardNavigation();
    initializeSermonFilters();
    initializeGivingPortal();
    initializeCarousel();
    initializeUpcomingEvents();
    initializeSundayCountdown();
    initializeEventsCalendarToggle();

    if (typeof initializeYouTubeSermons === 'function') {
        initializeYouTubeSermons();
    }
    
    // Add loading complete class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1000);
});

// ============================================
// Navigation Functionality
// ============================================
function initializeNavigation() {
    
    // Mobile menu toggle (click + keyboard)
    const toggleMenu = () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        const expanded = mobileMenu.classList.contains('active');
        mobileMenu.setAttribute('aria-expanded', expanded.toString());
        if (expanded && navLinks.length > 0) {
            navLinks[0].focus();
        }
    };

    mobileMenu.addEventListener('click', toggleMenu);
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Call it once to set initial active state
    updateActiveNavLink();
    
    // ============================================
    // Smooth Scrolling for Anchor Links
    // ============================================
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.getElementById('about');
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
    
    // Enhanced smooth scrolling for all anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // Intersection Observer for Animations
    // ============================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special animations for specific elements
                if (entry.target.classList.contains('value-item')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    setTimeout(() => {
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.opacity = '1';
                    }, delay);
                } else if (entry.target.classList.contains('event-card') ||
                          entry.target.classList.contains('visit-card') ||
                          entry.target.classList.contains('sermon-card') ||
                          entry.target.classList.contains('ministry-card') ||
                          entry.target.classList.contains('leader-card') ||
                          entry.target.classList.contains('newsletter-card')) {
                    // Animate other cards with a slight delay
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 150;
                    setTimeout(() => {
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.opacity = '1';
                    }, delay);
                } else {
                    // Default animation for other elements
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                }
                
                if (entry.target.classList.contains('stat-item')) {
                    animateCounter(entry.target.querySelector('.stat-number'));
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.value-item, .visit-card, .event-card, .sermon-card, .ministry-card, .stat-item, .leader-card, .newsletter-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
    
    // ============================================
    // Counter Animation
    // ============================================
    
    function animateCounter(element) {
        if (!element || element.classList.contains('animated')) return;
        
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        element.classList.add('animated');
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = element.textContent.replace(/\d+/, target);
            }
        };
        
        updateCounter();
    }

    // ============================================
    // Sermon Media Players (Refactored)
    // ============================================
    // Audio sermons are disabled. All media plays via video modal triggers.
}

// ============================================
// Contact & Prayer Form Submission Handling with Formspree
// ============================================
const forms = document.querySelectorAll('.contact-form, .newsletter-form');

forms.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const isNewsletter = form.classList.contains('newsletter-form');

    Swal.fire({
      title: isNewsletter ? 'Subscribing...' : 'Sending...',
      text: isNewsletter ? 'Please wait while we add you to our list.' : 'Please wait while we submit your message.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      Swal.close();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: isNewsletter ? 'Subscribed!' : 'Message Sent!',
          text: isNewsletter ? 'Thank you for subscribing to our newsletter.' : 'Thank you, your submission has been received.',
          confirmButtonColor: '#3085d6'
        });
        form.reset();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: isNewsletter ? 'Subscription failed, please try again!' : 'Message not sent, please try again!',
          confirmButtonColor: '#d33'
        });
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'warning',
        title: 'Network Error',
        text: 'Check your connection and try again.',
        confirmButtonColor: '#f39c12'
      });
    }
  });
});
    
// ============================================
// Form Input Animations
// ============================================
function initializeFormAnimations() {
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentNode.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentNode.classList.remove('focused');
        }
    });
    
    // Check for pre-filled values
    if (input.value) {
        input.parentNode.classList.add('focused');
    }
});
}

// ============================================
// Utility Functions
// ============================================
    
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
    
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-gold)' : type === 'error' ? 'var(--accent-red)' : 'var(--deep-blue)'};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-medium);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        font-family: var(--font-secondary);
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}
    
// ============================================
// Upcoming Events (recurring + special)
// ============================================

const EVENTS_JSON_URL = 'events.json';
const CHURCH_LOCATION = 'Teleios Church, 42 Antrim Road, Meredale South, Johannesburg';

async function loadEventData() {
    if (typeof window.teleiosLoadEventData === 'function') {
        try {
            const cloudData = await window.teleiosLoadEventData();
            if (cloudData) {
                return {
                    recurringEvents: cloudData.recurringEvents.length ? cloudData.recurringEvents : RECURRING_EVENTS,
                    specialEvents: cloudData.specialEvents.length ? cloudData.specialEvents : SPECIAL_EVENTS
                };
            }
        } catch (error) {
            console.warn('Cloud event loader failed, falling back to local data.', error);
        }
    }

    try {
        const response = await fetch(EVENTS_JSON_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to fetch event data');
        }

        const data = await response.json();
        return {
            recurringEvents: Array.isArray(data.recurringEvents) ? data.recurringEvents : RECURRING_EVENTS,
            specialEvents: Array.isArray(data.specialEvents) ? data.specialEvents : SPECIAL_EVENTS
        };
    } catch (error) {
        console.warn('Could not load events.json, falling back to hard-coded event data.', error);
        return {
            recurringEvents: RECURRING_EVENTS,
            specialEvents: SPECIAL_EVENTS
        };
    }
}

const RECURRING_EVENTS = [
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
        onlineUrl: 'href="https://teleioscommunity.mn.co/"'
    }
];

/** Fallback only when Firestore and events.json are unavailable. Manage events in admin. */
const SPECIAL_EVENTS = [];

function getNextOccurrence(dayOfWeek, hour, minute) {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    const daysUntil = (dayOfWeek - next.getDay() + 7) % 7;
    if (daysUntil === 0 && next <= now) {
        next.setDate(next.getDate() + 7);
    } else {
        next.setDate(next.getDate() + daysUntil);
    }

    return next;
}

function formatCalendarStamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function buildGoogleCalendarUrl(event) {
    const end = new Date(event.start);
    end.setHours(end.getHours() + (event.durationHours || 2));

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        details: event.description,
        location: CHURCH_LOCATION,
        dates: `${formatCalendarStamp(event.start)}/${formatCalendarStamp(end)}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatIcsDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcsText(value) {
    if (!value) return '';
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

function createIcsPayload(event) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.start);
    endDate.setHours(endDate.getHours() + (event.durationHours || 2));

    const uid = `teleios-${event.title.replace(/\W+/g, '-').toLowerCase()}-${startDate.getTime()}@teleioschurch.co.za`;
    const dtstamp = formatIcsDate(new Date());
    const dtstart = formatIcsDate(startDate);
    const dtend = formatIcsDate(endDate);

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Teleios Church//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `DESCRIPTION:${escapeIcsText(event.description)}`,
        `LOCATION:${escapeIcsText(CHURCH_LOCATION)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}

function downloadIcs(event) {
    const icsContent = createIcsPayload(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\W+/g, '_').toLowerCase() || 'teleios-event'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function buildUpcomingEventsList(eventData = {}) {
    const recurringEvents = Array.isArray(eventData.recurringEvents) ? eventData.recurringEvents : RECURRING_EVENTS;
    const specialEvents = Array.isArray(eventData.specialEvents) ? eventData.specialEvents : SPECIAL_EVENTS;
    const now = new Date();
    const items = [];

    recurringEvents.forEach((recurring) => {
        items.push({
            ...recurring,
            start: getNextOccurrence(recurring.dayOfWeek, recurring.hour, recurring.minute),
            isRecurring: true
        });
    });

    specialEvents.forEach((special) => {
        const [year, month, day] = special.date.split('-').map(Number);
        const start = new Date(year, month - 1, day, special.hour, special.minute, 0, 0);
        if (start > now) {
            items.push({
                ...special,
                start,
                isRecurring: false
            });
        }
    });

    items.sort((a, b) => a.start - b.start);

    const seen = new Set();
    const unique = [];

    items.forEach((item) => {
        const key = `${item.title}-${item.start.toISOString()}`;
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(item);
    });

    return unique.slice(0, 8);
}

function createEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const month = event.start.toLocaleString('en-ZA', { month: 'short' });
    const day = event.start.getDate();
    const calendarUrl = buildGoogleCalendarUrl(event);
    const recurringMarkup = event.isRecurring
        ? `<p class="event-recurring">${event.recurringLabel}</p>`
        : '';

    const dateMarkup = event.isRecurring
        ? `<div class="event-date event-date--recurring">
            <span class="month">Weekly</span>
            <span class="day">${dayNames[event.dayOfWeek] ?? '—'}</span>
           </div>`
        : `<div class="event-date">
            <span class="month">${month}</span>
            <span class="day">${day}</span>
           </div>`;

    const categoryMarkup = event.category
        ? `<span class="event-category" style="background-color: ${event.categoryColor}">${event.category}</span>`
        : '';

    const iconMarkup = event.icon
        ? `<i class="${event.icon} event-card-icon"></i>`
        : '';

    const isOnline = event.isOnline || event.location === 'Online';
    const locationIcon = isOnline ? 'fas fa-video' : 'fas fa-map-marker-alt';
    const locationMarkup = event.location
        ? `<p class="event-location"><i class="${locationIcon}"></i> ${event.location}</p>`
        : '';

    const onlineMarkup = isOnline && event.onlineUrl
        ? `<a href="${event.onlineUrl}" class="event-online-link" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-play-circle"></i> Join online
           </a>`
        : '';

    const rsvpMarkup = event.isRecurring
        ? ''
        : (() => {
            const rsvpText = encodeURIComponent(`Hi Teleios Church, I would like to RSVP for ${event.title} at ${event.timeLabel}.`);
            const rsvpUrl = `https://wa.me/27671630558?text=${rsvpText}`;
            return `<a href="${rsvpUrl}" class="event-link event-rsvp-btn" target="_blank" rel="noopener noreferrer" title="RSVP via WhatsApp">
                <i class="fas fa-check-circle"></i> RSVP
            </a>`;
        })();

    card.innerHTML = `
        ${dateMarkup}
        <div class="event-content">
            <div class="event-header">
                ${iconMarkup}
                <div>
                    <h3>${event.title}</h3>
                    ${categoryMarkup}
                </div>
            </div>
            ${recurringMarkup}
            <p class="event-time"><i class="fas fa-clock"></i> ${event.timeLabel}</p>
            ${locationMarkup}
            ${onlineMarkup}
            <p class="event-description">${event.description}</p>
            <div class="event-actions">
                <a href="${calendarUrl}" class="event-link" target="_blank" rel="noopener noreferrer" title="Add to Google Calendar">
                    <i class="fas fa-calendar-plus"></i> Add
                </a>
                <button type="button" class="event-link event-save-btn" title="Download event file">
                    <i class="fas fa-download"></i> Save
                </button>
                ${rsvpMarkup}
            </div>
        </div>
    `;

    const saveButton = card.querySelector('.event-save-btn');
    if (saveButton) {
        saveButton.addEventListener('click', () => downloadIcs(event));
    }

    return card;
}

async function initializeUpcomingEvents() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    const eventData = await loadEventData();
    const events = buildUpcomingEventsList(eventData);
    grid.innerHTML = '';

    if (events.length === 0) {
        grid.innerHTML = '<p class="events-empty">No upcoming events at the moment. Please check back soon or contact us.</p>';
        return;
    }

    events.forEach((event) => {
        grid.appendChild(createEventCard(event));
    });

    grid.querySelectorAll('.event-card').forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });
}

function getThisSundayServiceTimes(now) {
    const serviceStart = new Date(now);
    const offsetToSunday = now.getDay();
    serviceStart.setDate(now.getDate() - offsetToSunday);
    serviceStart.setHours(9, 0, 0, 0);

    const serviceEnd = new Date(serviceStart);
    serviceEnd.setHours(11, 30, 0, 0);

    return { serviceStart, serviceEnd };
}

function initializeSundayCountdown() {
    const stateLabel = document.getElementById('countdown-state');
    const badge = document.getElementById('countdown-badge');
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');

    if (!stateLabel || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const getNextServiceStart = (reference) => {
        const nextSunday = new Date(reference);
        const offset = (7 - nextSunday.getDay()) % 7;
        nextSunday.setDate(nextSunday.getDate() + offset);
        nextSunday.setHours(9, 0, 0, 0);
        if (nextSunday <= reference) {
            nextSunday.setDate(nextSunday.getDate() + 7);
        }
        return nextSunday;
    };

    const updateCountdown = () => {
        const now = new Date();
        const { serviceStart, serviceEnd } = getThisSundayServiceTimes(now);
        let countdownTarget = serviceStart;
        let statusText = 'Countdown to Sunday Service';

        let isLive = false;

        if (now >= serviceStart && now < serviceEnd) {
            countdownTarget = serviceEnd;
            statusText = 'Service is live — ends in';
            isLive = true;
        } else if (now >= serviceEnd) {
            countdownTarget = getNextServiceStart(now);
            statusText = 'Countdown to next Sunday Service';
        }

        const diff = countdownTarget - now;
        const totalSeconds = Math.max(0, Math.floor(diff / 1000));
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        stateLabel.textContent = statusText;
        if (badge) {
            badge.classList.toggle('active', isLive);
        }
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
}
    
// ============================================
// Scroll-based Parallax Effect
// ============================================
    
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        const speed = scrolled * 0.5;
        heroBackground.style.transform = `translateY(${speed}px)`;
    }
});
    
// ============================================
// Loading Animation
// ============================================
    
function initializeLoadingAnimations() {
    // Animate hero elements on load
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-verse, .hero-buttons');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
}
    
// ============================================
// Theme Color Adaptation
// ============================================
    
function setThemeColor() {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#2c3e50';
        document.getElementsByTagName('head')[0].appendChild(meta);
    }
}
    
// ============================================
// Performance Optimization
// ============================================
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });
    
    images.forEach(img => imageObserver.observe(img));
}
    
// ============================================
// Scroll Handlers
// ============================================
function initializeScrollHandlers() {
    // Debounce scroll events for better performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    const backToTopBtn = document.getElementById('back-to-top');

    // Apply debouncing to scroll events
    const debouncedScroll = debounce(() => {
        updateActiveNavLink();

        if (backToTopBtn) {
            if (window.scrollY > 200) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    }, 10);
    
    window.addEventListener('scroll', debouncedScroll);
    
    // Scroll-based Parallax Effect
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground) {
            const speed = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${speed}px)`;
        }
    });

    // Back to Top click handler
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ============================================
// Keyboard Navigation
// ============================================
function initializeKeyboardNavigation() {
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                mobileMenu.setAttribute('aria-expanded', 'false');
            }

            // Close video modal if open
            if (videoModal && videoModal.classList.contains('show')) {
                const frame = videoModal.querySelector('iframe');
                if (frame) frame.src = '';
                videoModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        }
    });
}


    // Console welcome message
    console.log(`
    ╔══════════════════════════════════════════╗
    ║        Welcome to Teleios Church         ║
    ║     "Therefore let us go unto maturity"  ║
    ║              - Hebrews 6:1               ║
    ╚══════════════════════════════════════════╝
    
    Website loaded successfully! 
    Built with love for our community.
    `);

// ============================================
// Sermon Filter & Search Hub (Option C)
// ============================================
let sermonFilterState = { activeFilter: 'all', searchTimeout: null };

function applySermonFilters() {
    const searchInput = document.getElementById('sermon-search');
    const sermonsGrid = document.getElementById('sermons-grid');
    if (!searchInput || !sermonsGrid) return;

    const query = searchInput.value.toLowerCase().trim();
    const sermonCards = sermonsGrid.querySelectorAll('.sermon-card');

    sermonCards.forEach((card) => {
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const matchesSearch = !query || title.includes(query);
        const matchesTag = sermonFilterState.activeFilter === 'all';

        card.classList.toggle('hide', !(matchesSearch && matchesTag));
    });

    const visibleCards = [...sermonCards].filter((c) => !c.classList.contains('hide'));
    let noResults = document.getElementById('sermon-no-results');

    if (visibleCards.length === 0 && sermonCards.length > 0) {
        if (!noResults) {
            noResults = document.createElement('p');
            noResults.id = 'sermon-no-results';
            noResults.className = 'sermons-empty';
            noResults.textContent = 'No sermons found. Try a different title.';
            sermonsGrid.appendChild(noResults);
        }
    } else if (noResults) {
        noResults.remove();
    }
}

function initializeSermonFilters() {
    const searchInput = document.getElementById('sermon-search');
    const filterContainer = document.querySelector('.sermon-filter-tags');
    const sermonsGrid = document.getElementById('sermons-grid');

    if (!searchInput || !sermonsGrid) return;

    sermonsGrid.style.position = 'relative';

    if (!searchInput.dataset.filterBound) {
        searchInput.dataset.filterBound = 'true';
        searchInput.addEventListener('input', () => {
            clearTimeout(sermonFilterState.searchTimeout);
            sermonFilterState.searchTimeout = setTimeout(applySermonFilters, 200);
        });
    }

    if (filterContainer && !filterContainer.dataset.filterBound) {
        filterContainer.dataset.filterBound = 'true';
        filterContainer.addEventListener('click', (e) => {
            const tag = e.target.closest('.filter-tag');
            if (!tag) return;

            filterContainer.querySelectorAll('.filter-tag').forEach((t) => t.classList.remove('active'));
            tag.classList.add('active');
            sermonFilterState.activeFilter = tag.getAttribute('data-filter') || 'all';
            searchInput.value = '';
            applySermonFilters();
        });
    }
}

window.reinitializeSermonFilters = function () {
    sermonFilterState.activeFilter = 'all';
    applySermonFilters();
};

document.addEventListener('teleios:sermons-loaded', () => {
    applySermonFilters();
});

function initializeGoogleCalendarEmbed() {
    const config = window.TELEIOS_CONFIG || {};
    const embedUrl = config.googleCalendarEmbedUrl;
    const wrap = document.getElementById('google-calendar-embed');
    if (!wrap || !embedUrl) return;

    wrap.innerHTML = `
        <iframe
            src="${embedUrl}"
            title="Teleios Church calendar"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
    `;
    wrap.dataset.loaded = 'true';
}

function initializeEventsCalendarToggle() {
    const toggleBtn = document.getElementById('events-calendar-toggle');
    const calendarWrap = document.getElementById('google-calendar-embed');
    const config = window.TELEIOS_CONFIG || {};
    const embedUrl = config.googleCalendarEmbedUrl;

    if (!toggleBtn || !calendarWrap || !embedUrl) {
        if (toggleBtn) toggleBtn.style.display = 'none';
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const isOpen = !calendarWrap.classList.contains('hidden');

        if (isOpen) {
            calendarWrap.classList.add('hidden');
            calendarWrap.setAttribute('aria-hidden', 'true');
            toggleBtn.textContent = 'View Full Calendar';
            toggleBtn.classList.remove('btn-primary');
            toggleBtn.classList.add('btn-secondary');
            return;
        }

        if (!calendarWrap.dataset.loaded) {
            initializeGoogleCalendarEmbed();
        }

        calendarWrap.classList.remove('hidden');
        calendarWrap.removeAttribute('aria-hidden');
        toggleBtn.textContent = 'Hide Full Calendar';
        toggleBtn.classList.remove('btn-secondary');
        toggleBtn.classList.add('btn-primary');
        calendarWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// ============================================
// Giving — Copy banking details to clipboard
// ============================================
function initializeGivingPortal() {
    const copyAccBtn  = document.getElementById('btn-copy-acc');
    const copyAllBtn  = document.getElementById('btn-copy-all');
    const accNumEl    = document.getElementById('acc-num-text');
    const branchEl    = document.getElementById('branch-code-text');

    if (!accNumEl) return;

    const bankDetailsText = [
        'Teleios Church — Giving (EFT)',
        'Bank: Standard Bank',
        'Account holder: Teleios Church SA',
        `Account number: ${accNumEl.textContent.trim()}`,
        `Branch code: ${branchEl ? branchEl.textContent.trim() : '051001'}`,
        'Account type: Cheque / Current',
        'Reference: Tithes / Offering'
    ].join('\n');

    async function copyText(text, successTitle, button) {
        try {
            await navigator.clipboard.writeText(text);

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: successTitle,
                showConfirmButton: false,
                timer: 3500,
                timerProgressBar: true,
                background: '#0D1B2A',
                color: '#FAF9F6',
                iconColor: '#D4AF37'
            });

            if (button) {
                const originalContent = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                button.style.background = '#2ecc71';
                button.style.color = 'white';

                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.style.background = '';
                    button.style.color = '';
                }, 2500);
            }
        } catch (err) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Could not copy automatically.',
                text: 'Please copy the details manually from the page.',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#D4AF37'
            });
        }
    }

    if (copyAccBtn) {
        copyAccBtn.addEventListener('click', () => {
            const accNumber = accNumEl.textContent.trim();
            copyText(
                accNumber,
                `Account number ${accNumber} copied!`,
                copyAccBtn
            );
        });
    }

    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
            copyText(bankDetailsText, 'All banking details copied!', copyAllBtn);
        });
    }
}

//================================
//==== PayPal Donation Buttons ====
//================================
function initializePayPalButtons() {
    const customAmountInput = document.getElementById('paypal-custom-amount');
    const customBtn = document.getElementById('paypal-custom-btn');

    // Your PayPal business email/ID (replace with actual)
    const paypalBusiness = 'info@teleioschurch.co.za';

    function generatePayPalLink(amount, description = 'Teleios Church Donation') {
        const baseUrl = 'https://www.paypal.com/cgi-bin/webscr';
        const params = new URLSearchParams({
            cmd: '_xclick',
            business: paypalBusiness,
            item_name: description,
            amount: amount.toFixed(2),
            currency_code: 'ZAR',
            return: window.location.href,
            cancel_return: window.location.href,
            notify_url: window.location.href,
            no_shipping: '1',
            no_note: '1'
        });
        return `${baseUrl}?${params.toString()}`;
    }

    // Handle custom amount button
    if (customBtn && customAmountInput) {
        customBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const amount = parseFloat(customAmountInput.value);

            if (!amount || isNaN(amount) || amount < 10) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Amount',
                    text: 'Please enter an amount of at least R10.',
                    confirmButtonColor: '#0066CC'
                });
                customAmountInput.focus();
                return;
            }

            const url = generatePayPalLink(amount, `Teleios Church - ZAR ${amount}`);
            
            Swal.fire({
                title: 'Redirect to PayPal',
                html: `You will be redirected to PayPal to donate <strong>ZAR ${amount.toFixed(2)}</strong>.<br/>Thank you for your generosity!`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Continue to PayPal',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#0066CC',
                cancelButtonColor: '#6c757d'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = url;
                }
            });
        });

        // Allow Enter key to submit custom amount
        customAmountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                customBtn.click();
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializePayPalButtons();
});




