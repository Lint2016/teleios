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

function displayPictures(){
const imagePath =document.getElementById('carousel-img');
imagePath.src= carouselImages[index]
index= (index+1)%carouselImages.length
}
displayPictures();
setInterval(displayPictures, 2000)
// Global variables
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
let videoModal, sermonVideo, iframe, closeBtn; // Will be initialized in DOMContentLoaded

// Move this to the top of your script.js, after variable declarations
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
        const videoModal = document.getElementById('videoModal');
        const closeBtn = document.getElementById('closeModal');
        
        if (!videoModal || !closeBtn) return;
        
        // Initialize close button
        closeBtn.addEventListener('click', function() {
            videoModal.classList.remove('show');
            const iframe = videoModal.querySelector('iframe');
            if (iframe) iframe.src = '';
            document.body.style.overflow = 'auto';
        });
        
        // Close when clicking outside the modal
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                videoModal.classList.remove('show');
                const iframe = videoModal.querySelector('iframe');
                if (iframe) iframe.src = '';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Initialize video buttons
        const videoButtons = document.querySelectorAll('.btn-video');
        if (videoButtons.length > 0) {
            videoButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Video button clicked');
                    
                    const card = this.closest('.sermon-card');
                    if (!card) {
                        console.error('Could not find parent sermon card');
                        showNotification('Error: Could not find sermon information', 'error');
                        return;
                    }
                    
                    const videoId = card.getAttribute('data-video-id');
                    if (!videoId) {
                        console.error('No video ID found on sermon card');
                        showNotification('Error: No video available', 'error');
                        return;
                    }
                    
                    console.log('Loading YouTube video:', videoId);
                    
                    const videoIframe = document.getElementById('videoIframe');
                    if (videoIframe) {
                        videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;
                        const modal = document.getElementById('videoModal');
                        if (modal) {
                            modal.classList.add('show');
                            document.body.style.overflow = 'hidden';
                        }
                    }
                });
            });
        }
    }
    


// Then in your DOMContentLoaded:
document.addEventListener('DOMContentLoaded', function() {
    // Other initializations...
    updateActiveNavLink(); // This will now work
    // Rest of your code...
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global variables
    videoModal = document.getElementById('videoModal');
    sermonVideo = document.getElementById('sermonVideo');
    iframe = document.getElementById('videoIframe');
    closeBtn = document.getElementById('closeModal');
    
    initializeNavigation();
    initializeVideoModal();
   // initializeContactForm();
    initializeFormAnimations();
    //loadUpcomingEvents();
   // initializeLoadingAnimations();
   // setThemeColor();
    updateActiveNavLink();
   // initializeLazyLoading();
    initializeScrollHandlers();
    initializeKeyboardNavigation();
    
    // Add loading complete class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1000);
});

// ============================================
// Navigation Functionality
// ============================================
function initializeNavigation() {
    
    // Mobile menu toggle
    mobileMenu.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
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
    
    // ============================================
    // Active Navigation Link
    // ============================================
    
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
    // Sermon Media Players
    // ============================================
    
    const sermonPlayBtns = document.querySelectorAll('.sermon-play-btn');
    
    sermonPlayBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Simulate media player interaction
            this.innerHTML = '<i class="fas fa-pause"></i>';
            this.style.background = 'var(--primary-gold)';
            this.style.color = 'white';
            
            // Show notification
            showNotification('Playing sermon...', 'info');
            
            // Reset after 3 seconds (simulate)
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-play"></i>';
                this.style.background = 'rgba(255, 255, 255, 0.9)';
                this.style.color = 'var(--deep-blue)';
            }, 3000);
        });
    });
    
    // Initialize the video modal functionality
    initializeVideoModal();

    // Video button initialization is now handled in initializeVideoModal()
}

// ============================================
// Contact Form Submission Handling  with formspree
// ============================================
const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  
// Show loading SweetAlert
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
        text: 'Thanks for reaching out, we will get back to you soon!',
        confirmButtonColor: '#3085d6'
      });
      form.reset();
    } else {
        const data = await response.json();
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
    
    // Lazy loading for images (when actual images are added)
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
    });
    
    images.forEach(img => imageObserver.observe(img));
}
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}
    
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
    
// Apply debouncing to scroll events
const debouncedScroll = debounce(() => {
    updateActiveNavLink();
}, 10);
    
window.addEventListener('scroll', debouncedScroll);
    
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
    
    // Apply debouncing to scroll events
    const debouncedScroll = debounce(() => {
        updateActiveNavLink();
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
}

// ============================================
// Keyboard Navigation
// ============================================
function initializeKeyboardNavigation() {
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});
    
// Focus management for mobile menu
mobileMenu.addEventListener('click', function() {

    // Focus management for mobile menu
    mobileMenu.addEventListener('click', function() {
        if (navMenu.classList.contains('active')) {
            navLinks[0].focus();
        }
    });
    if (e.target.closest('.sermon-image') || e.target.closest('.fa-play-circle')) {
      const videoId = card.dataset.videoId;
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      modal.classList.add('show');
    }
  });
};


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


