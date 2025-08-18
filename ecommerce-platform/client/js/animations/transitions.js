// ===== TRANSITION ANIMATIONS =====

class TransitionManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupPageTransitions();
        this.setupModalAnimations();
    }

    // Setup scroll-based animations
    setupScrollAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });

        // Parallax effect for hero sections
        this.setupParallaxEffect();
    }

    // Setup parallax effect
    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;

        const handleScroll = throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16); // 60fps

        window.addEventListener('scroll', handleScroll);
    }

    // Setup hover effects
    setupHoverEffects() {
        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                this.createRippleEffect(e);
            }
        });

        // Magnetic effect for interactive elements
        this.setupMagneticEffect();
    }

    // Create ripple effect
    createRippleEffect(e) {
        const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Setup magnetic effect for cards and buttons
    setupMagneticEffect() {
        const magneticElements = document.querySelectorAll('.magnetic');

        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0, 0)';
            });
        });
    }

    // Setup page transitions
    setupPageTransitions() {
        // Smooth page transitions for SPA-like experience
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Only handle internal links
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
                return;
            }

            // Don't handle if it's a download link or external
            if (link.hasAttribute('download') || link.target === '_blank') {
                return;
            }

            e.preventDefault();
            this.navigateWithTransition(href);
        });
    }

    // Navigate with page transition
    navigateWithTransition(href) {
        // Add page exit animation
        document.body.classList.add('page-transition');

        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }

    // Setup modal animations
    setupModalAnimations() {
        // Enhanced modal animations
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal(e.target.nextElementSibling);
            }
        });
    }

    // Open modal with animation
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Animate modal content
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.7)';
            modalContent.style.opacity = '0';
            
            requestAnimationFrame(() => {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            });
        }
    }

    // Close modal with animation
    closeModal(modal) {
        if (!modal) return;

        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.7)';
            modalContent.style.opacity = '0';
        }

        setTimeout(() => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }, 300);
    }

    // Stagger animation for lists
    staggerAnimation(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * delay);
        });
    }

    // Typewriter effect
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Count up animation
    countUp(element, start, end, duration = 2000) {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    // Smooth scroll to element
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Animate number changes
    animateValue(element, start, end, duration = 1000) {
        const startTimestamp = performance.now();
        const step = (timestamp) => {
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * this.easeOutCubic(progress);
            
            element.textContent = Math.floor(current);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    // Easing function
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Shake animation for error states
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    // Pulse animation for notifications
    pulse(element) {
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 1000);
    }

    // Bounce animation
    bounce(element) {
        element.classList.add('bounce');
        setTimeout(() => {
            element.classList.remove('bounce');
        }, 1000);
    }
}

// Create global transition manager
const transitionManager = new TransitionManager();

// Add CSS animations if not already present
if (!document.querySelector('#transition-styles')) {
    const style = document.createElement('style');
    style.id = 'transition-styles';
    style.textContent = `
        /* Fade in animation */
        .fade-in {
            opacity: 0;
            transition: opacity 0.6s ease;
        }
        
        .fade-in.animate-in {
            opacity: 1;
        }

        /* Slide up animation */
        .slide-up {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .slide-up.animate-in {
            opacity: 1;
            transform: translateY(0);
        }

        /* Slide in from left */
        .slide-in-left {
            opacity: 0;
            transform: translateX(-30px);
            transition: all 0.6s ease;
        }
        
        .slide-in-left.animate-in {
            opacity: 1;
            transform: translateX(0);
        }

        /* Slide in from right */
        .slide-in-right {
            opacity: 0;
            transform: translateX(30px);
            transition: all 0.6s ease;
        }
        
        .slide-in-right.animate-in {
            opacity: 1;
            transform: translateX(0);
        }

        /* Page transition */
        .page-transition {
            opacity: 0.7;
            transform: scale(0.98);
            transition: all 0.3s ease;
        }

        /* Ripple animation */
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        /* Shake animation */
        .shake {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        /* Pulse animation */
        .pulse {
            animation: pulse 1s ease-in-out;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        /* Bounce animation */
        .bounce {
            animation: bounce 1s ease-in-out;
        }

        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-10px); }
            70% { transform: translateY(-5px); }
            90% { transform: translateY(-2px); }
        }

        /* Magnetic effect */
        .magnetic {
            transition: transform 0.3s ease;
        }

        /* Hover effects for cards */
        .product-card,
        .category-card,
        .feature-card {
            transition: all 0.3s ease;
        }

        .product-card:hover,
        .category-card:hover,
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        /* Button hover effects */
        .btn {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .btn:active {
            transform: translateY(0);
        }

        /* Loading state transitions */
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        /* Smooth transitions for all interactive elements */
        a, button, .btn, .card, .product-card, .category-card {
            transition: all 0.3s ease;
        }

        /* Parallax container */
        .parallax {
            transition: transform 0.1s ease-out;
        }

        /* Stagger animation delays */
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Utility functions for animations
window.fadeIn = (element, duration = 600) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    setTimeout(() => element.style.opacity = '1', 10);
};

window.fadeOut = (element, duration = 600) => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    setTimeout(() => element.style.display = 'none', duration);
};

window.slideUp = (element, duration = 600) => {
    element.style.transform = 'translateY(30px)';
    element.style.opacity = '0';
    element.style.transition = `all ${duration}ms ease`;
    setTimeout(() => {
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
    }, 10);
};

window.slideDown = (element, duration = 600) => {
    element.style.transition = `all ${duration}ms ease`;
    element.style.transform = 'translateY(30px)';
    element.style.opacity = '0';
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TransitionManager, transitionManager };
}