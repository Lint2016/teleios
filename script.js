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
    'images/t22.jpg'
]
let index= 0;

function displayPictures() {
    const imagePath = document.getElementById('carousel-img');
    if (!imagePath) return;
    
    // Smooth transition
    imagePath.style.opacity = '0.3';
    
    setTimeout(() => {
        imagePath.src = carouselImages[index];
        imagePath.style.opacity = '1';
        index = (index + 1) % carouselImages.length;
    }, 300);
}
displayPictures();
setInterval(displayPictures, 2000)
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
    
    // Initialize video buttons
    const videoButtons = document.querySelectorAll('.btn-video');
    if (videoButtons.length > 0) {
        videoButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const card = this.closest('.sermon-card');
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
                    frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;
                    videoModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                    closeBtn.focus();
                }
            });
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
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
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
                          entry.target.classList.contains('sermon-card') || 
                          entry.target.classList.contains('ministry-card')) {
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
    const animateElements = document.querySelectorAll('.value-item, .event-card, .sermon-card, .ministry-card, .stat-item');
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
const forms = document.querySelectorAll('.contact-form');

forms.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    Swal.fire({
      title: 'Sending...',
      text: 'Please wait while we submit your message.',
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
          title: 'Message Sent!',
          text: 'Thank you, your submission has been received.',
          confirmButtonColor: '#3085d6'
        });
        form.reset();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Message not sent, please try again!',
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
// Dynamic Event Loading (Simulation)
// ============================================
    
function loadUpcomingEvents() {
    // This would normally fetch from an API
    const events = [
        {
            date: { month: 'Dec', day: '17' },
            title: 'Sunday Worship Service',
            time: '10:00 AM',
            description: 'Join us for inspiring worship, community prayer, and biblical teaching.'
        },
        {
            date: { month: 'Dec', day: '20' },
            title: 'Bible Study & Fellowship',
            time: '7:00 PM',
            description: 'Deep dive into scripture with interactive discussion and fellowship.'
        },
        {
            date: { month: 'Dec', day: '24' },
            title: 'Christmas Eve Service',
            time: '6:00 PM',
            description: 'Celebrate the birth of Christ with carols, candlelight, and communion.'
        }
    ];
    
    // Add dynamic behavior to event cards
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
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
function initializeSermonFilters() {
    const searchInput = document.getElementById('sermon-search');
    const filterTags  = document.querySelectorAll('.filter-tag');
    const sermonCards = document.querySelectorAll('.sermon-card');
    const sermonsGrid = document.querySelector('.sermons-grid');

    if (!searchInput || !filterTags.length || !sermonCards.length) return;

    let activeFilter = 'all';

    // Make the grid a positioning context for the .hide trick
    if (sermonsGrid) sermonsGrid.style.position = 'relative';

    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();

        sermonCards.forEach(card => {
            const title       = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const speaker     = (card.querySelector('.sermon-speaker')?.textContent || '').toLowerCase();
            const description = (card.querySelector('.sermon-description')?.textContent || '').toLowerCase();

            const matchesSearch = !query || title.includes(query) || speaker.includes(query) || description.includes(query);
            const matchesTag    = activeFilter === 'all' || speaker.includes(activeFilter.toLowerCase());

            if (matchesSearch && matchesTag) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });

        // Show "no results" message if every card is hidden
        const visibleCards = [...sermonCards].filter(c => !c.classList.contains('hide'));
        let noResults = document.getElementById('sermon-no-results');

        if (visibleCards.length === 0) {
            if (!noResults) {
                noResults = document.createElement('p');
                noResults.id = 'sermon-no-results';
                noResults.style.cssText = `
                    text-align: center;
                    color: var(--medium-text);
                    font-size: 1.1rem;
                    padding: 40px;
                    grid-column: 1 / -1;
                `;
                noResults.textContent = 'No sermons found. Try a different search or filter.';
                sermonsGrid.appendChild(noResults);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    // Live search listener (debounced for performance)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 200);
    });

    // Speaker tag filter listeners
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeFilter = tag.getAttribute('data-filter');

            // Clear the search input when a speaker tag is clicked
            searchInput.value = '';
            applyFilters();
        });
    });
}

// ============================================
// Giving Portal — Copy to Clipboard (Option B)
// ============================================
function initializeGivingPortal() {
    const copyBtn  = document.getElementById('btn-copy-acc');
    const accNumEl = document.getElementById('acc-num-text');

    if (!copyBtn || !accNumEl) return;

    copyBtn.addEventListener('click', async () => {
        const accNumber = accNumEl.textContent.trim();

        try {
            await navigator.clipboard.writeText(accNumber);

            // SweetAlert2 toast — premium gold-themed
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `<span style="font-size:0.95rem;">Account number <strong>${accNumber}</strong> copied!</span>`,
                showConfirmButton: false,
                timer: 3500,
                timerProgressBar: true,
                background: '#0D1B2A',
                color: '#FAF9F6',
                iconColor: '#D4AF37',
                customClass: {
                    popup: 'swal-toast-custom'
                }
            });

            // Visual feedback on the button itself
            const originalContent = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#2ecc71';
            copyBtn.style.color = 'white';

            setTimeout(() => {
                copyBtn.innerHTML = originalContent;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2500);

        } catch (err) {
            // Fallback for browsers that deny clipboard API
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Could not copy automatically.',
                text: `Please copy manually: ${accNumber}`,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#D4AF37'
            });
        }
    });
}



