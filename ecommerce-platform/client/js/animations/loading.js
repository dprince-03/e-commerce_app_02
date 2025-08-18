// ===== LOADING ANIMATIONS =====

class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.init();
    }

    init() {
        // Hide loading screen when page is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.hideLoadingScreen();
            });
        } else {
            this.hideLoadingScreen();
        }

        // Fallback: Hide loading screen after max 3 seconds
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }

    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Remove loading screen from DOM after animation
            setTimeout(() => {
                if (this.loadingScreen && this.loadingScreen.parentNode) {
                    this.loadingScreen.parentNode.removeChild(this.loadingScreen);
                }
            }, 500);
        }
    }

    // Show loading overlay for specific elements
    showElementLoading(element, message = 'Loading...') {
        if (!element) return;

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        element.style.position = 'relative';
        element.appendChild(overlay);

        return overlay;
    }

    hideElementLoading(element) {
        if (!element) return;

        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Show loading button state
    setButtonLoading(button, isLoading = true) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `
                <div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>
                Loading...
            `;
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }
}

// Create global loading manager
const loadingManager = new LoadingManager();

// Utility functions for loading states
window.showLoading = (element, message) => loadingManager.showElementLoading(element, message);
window.hideLoading = (element) => loadingManager.hideElementLoading(element);
window.setButtonLoading = (button, isLoading) => loadingManager.setButtonLoading(button, isLoading);

// Add loading styles if not already present
if (!document.querySelector('#loading-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: inherit;
        }

        .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .loading-overlay .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-overlay p {
            margin: 0;
            color: var(--gray-600);
            font-size: 0.9rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Button loading state */
        .btn .loading-spinner {
            display: inline-block;
            vertical-align: middle;
        }

        /* Skeleton loading */
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
        }

        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .skeleton-text {
            height: 1em;
            margin-bottom: 0.5em;
            border-radius: 4px;
        }

        .skeleton-text.short {
            width: 60%;
        }

        .skeleton-text.medium {
            width: 80%;
        }

        .skeleton-text.long {
            width: 100%;
        }

        .skeleton-image {
            width: 100%;
            height: 200px;
            border-radius: 8px;
        }

        .skeleton-card {
            padding: 1rem;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(style);
}

// Skeleton loading utilities
window.createSkeleton = function(type = 'text', className = '') {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type} ${className}`;
    return skeleton;
};

window.createSkeletonCard = function() {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-text medium" style="margin-top: 1rem;"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-text long"></div>
    `;
    return card;
};

// Show skeleton loading for product grid
window.showProductSkeleton = function(container, count = 8) {
    if (!container) return;

    const skeletonHTML = Array(count).fill(0).map(() => `
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-image" style="height: 250px; margin-bottom: 1rem;"></div>
            <div class="skeleton skeleton-text short" style="height: 14px; margin-bottom: 0.5rem;"></div>
            <div class="skeleton skeleton-text medium" style="height: 18px; margin-bottom: 0.5rem;"></div>
            <div class="skeleton skeleton-text short" style="height: 16px; margin-bottom: 1rem;"></div>
            <div class="skeleton skeleton-text medium" style="height: 20px; margin-bottom: 1rem;"></div>
            <div class="skeleton skeleton-text long" style="height: 40px;"></div>
        </div>
    `).join('');

    container.innerHTML = skeletonHTML;
};

// Progressive image loading
window.loadImageProgressively = function(img, src, placeholder = null) {
    return new Promise((resolve, reject) => {
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            resolve();
        };
        
        tempImg.onerror = () => {
            if (placeholder) {
                img.src = placeholder;
            }
            img.classList.remove('loading');
            reject();
        };
        
        img.classList.add('loading');
        tempImg.src = src;
    });
};

// Intersection Observer for lazy loading
window.createLazyLoader = function(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoadingManager, loadingManager };
}