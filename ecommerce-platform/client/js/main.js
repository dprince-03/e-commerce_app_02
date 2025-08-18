// ===== MAIN APPLICATION LOGIC =====

class ECommerceApp {
    constructor() {
        this.products = [];
        this.categories = [];
        this.cart = [];
        this.wishlist = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.init();
    }

    // Initialize application
    async init() {
        this.loadCartFromStorage();
        this.loadWishlistFromStorage();
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateCartUI();
        this.updateWishlistUI();
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Load categories
            await this.loadCategories();
            
            // Load featured products on home page
            if (this.isHomePage()) {
                await this.loadFeaturedProducts();
            }
            
            // Load products on products page
            if (this.isProductsPage()) {
                await this.loadProducts();
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
            toastManager.error('Failed to load page data');
        }
    }

    // Check if current page is home page
    isHomePage() {
        const path = window.location.pathname;
        return path === '/' || path === '/index.html' || path.endsWith('/');
    }

    // Check if current page is products page
    isProductsPage() {
        return window.location.pathname.includes('products.html');
    }

    // Load categories
    async loadCategories() {
        try {
            const response = await httpClient.get('/categories');
            if (response.success) {
                this.categories = response.data.categories;
                this.renderCategories();
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    // Load featured products
    async loadFeaturedProducts() {
        try {
            const response = await httpClient.get('/products/featured', { limit: 8 });
            if (response.success) {
                this.products = response.data.products;
                this.renderFeaturedProducts();
            }
        } catch (error) {
            console.error('Failed to load featured products:', error);
        }
    }

    // Load products with filters
    async loadProducts(filters = {}) {
        try {
            const params = {
                page: this.currentPage,
                limit: this.productsPerPage,
                ...filters
            };

            const response = await httpClient.get('/products', params);
            if (response.success) {
                this.products = response.data.products;
                this.pagination = response.data.pagination;
                this.renderProducts();
                this.renderPagination();
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            toastManager.error('Failed to load products');
        }
    }

    // Search products
    async searchProducts(query, filters = {}) {
        try {
            const params = {
                q: query,
                page: 1,
                limit: this.productsPerPage,
                ...filters
            };

            const response = await httpClient.get('/products/search', params);
            if (response.success) {
                this.products = response.data.products;
                this.pagination = response.data.pagination;
                this.renderProducts();
                this.renderPagination();
                
                // Update URL
                setQueryParam('q', query);
            }
        } catch (error) {
            console.error('Search failed:', error);
            toastManager.error('Search failed');
        }
    }

    // Render categories
    renderCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid || !this.categories.length) return;

        categoriesGrid.innerHTML = this.categories.map(category => `
            <div class="category-card" onclick="app.navigateToCategory('${category.id}')">
                <img src="${category.image || '/assets/images/category-placeholder.jpg'}" 
                     alt="${category.name}" class="category-image">
                <div class="category-info">
                    <h3 class="category-name">${category.name}</h3>
                    <p class="category-count">${category.productCount || 0} products</p>
                </div>
            </div>
        `).join('');
    }

    // Render featured products
    renderFeaturedProducts() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        container.innerHTML = this.renderProductCards(this.products);
    }

    // Render products
    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        container.innerHTML = this.renderProductCards(this.products);
    }

    // Render product cards
    renderProductCards(products) {
        if (!products || products.length === 0) {
            return '<div class="col-12"><p class="text-center">No products found.</p></div>';
        }

        return products.map(product => {
            const discount = this.calculateDiscount(product.comparePrice, product.price);
            const isInWishlist = this.wishlist.some(item => item.id === product.id);
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image-container">
                        <img src="${product.images?.[0] || '/assets/images/product-placeholder.jpg'}" 
                             alt="${product.name}" class="product-image">
                        ${discount > 0 ? `<div class="product-badge">${discount}% OFF</div>` : ''}
                        <div class="product-actions">
                            <button class="product-action wishlist-btn ${isInWishlist ? 'active' : ''}" 
                                    onclick="app.toggleWishlist('${product.id}')" title="Add to Wishlist">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="product-action" onclick="app.quickView('${product.id}')" title="Quick View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category?.name || 'Uncategorized'}</div>
                        <h3 class="product-name">${truncate(product.name, 60)}</h3>
                        <div class="product-rating">
                            <div class="stars">${generateStarRating(product.rating)}</div>
                            <span class="rating-count">(${product.reviewCount})</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">${formatCurrency(product.price)}</span>
                            ${product.comparePrice ? `<span class="original-price">${formatCurrency(product.comparePrice)}</span>` : ''}
                            ${discount > 0 ? `<span class="discount">${discount}% OFF</span>` : ''}
                        </div>
                        <button class="add-to-cart" onclick="app.addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container || !this.pagination) return;

        const { currentPage, totalPages, hasPrevPage, hasNextPage } = this.pagination;
        
        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${!hasPrevPage ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.changePage(${currentPage - 1})" aria-label="Previous">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="app.changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${!hasNextPage ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.changePage(${currentPage + 1})" aria-label="Next">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        paginationHTML += '</ul>';
        container.innerHTML = paginationHTML;
    }

    // Change page
    changePage(page) {
        if (page < 1 || (this.pagination && page > this.pagination.totalPages)) return;
        
        this.currentPage = page;
        this.loadProducts();
        scrollToTop();
    }

    // Navigate to category
    navigateToCategory(categoryId) {
        window.location.href = `/pages/products.html?category=${categoryId}`;
    }

    // Quick view product
    quickView(productId) {
        // TODO: Implement quick view modal
        toastManager.info('Quick view coming soon!');
    }

    // Add product to cart
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            toastManager.error('Product not found');
            return;
        }

        // Check if product already in cart
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0],
                quantity: quantity
            });
        }

        this.saveCartToStorage();
        this.updateCartUI();
        toastManager.success(`${product.name} added to cart!`);
    }

    // Remove product from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartUI();
        toastManager.info('Product removed from cart');
    }

    // Update cart item quantity
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCartToStorage();
                this.updateCartUI();
            }
        }
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        toastManager.info('Cart cleared');
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart item count
    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Toggle wishlist
    toggleWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingIndex = this.wishlist.findIndex(item => item.id === productId);
        
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            toastManager.info(`${product.name} removed from wishlist`);
        } else {
            this.wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]
            });
            toastManager.success(`${product.name} added to wishlist!`);
        }

        this.saveWishlistToStorage();
        this.updateWishlistUI();
    }

    // Calculate discount percentage
    calculateDiscount(originalPrice, salePrice) {
        if (!originalPrice || originalPrice <= salePrice) return 0;
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }

    // Load cart from storage
    loadCartFromStorage() {
        this.cart = storage.get(STORAGE_KEYS.CART, []);
    }

    // Save cart to storage
    saveCartToStorage() {
        storage.set(STORAGE_KEYS.CART, this.cart);
    }

    // Load wishlist from storage
    loadWishlistFromStorage() {
        this.wishlist = storage.get(STORAGE_KEYS.WISHLIST, []);
    }

    // Save wishlist to storage
    saveWishlistToStorage() {
        storage.set(STORAGE_KEYS.WISHLIST, this.wishlist);
    }

    // Update cart UI
    updateCartUI() {
        const cartCount = this.getCartItemCount();
        const cartCountElements = document.querySelectorAll('#cartCount, #mobileCartCount');
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = cartCount;
                element.style.display = cartCount > 0 ? 'flex' : 'none';
            }
        });
    }

    // Update wishlist UI
    updateWishlistUI() {
        const wishlistCount = this.wishlist.length;
        const wishlistCountElement = document.getElementById('wishlistCount');
        
        if (wishlistCountElement) {
            wishlistCountElement.textContent = wishlistCount;
            wishlistCountElement.style.display = wishlistCount > 0 ? 'flex' : 'none';
        }

        // Update wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.closest('.product-card')?.dataset.productId;
            if (productId) {
                const isInWishlist = this.wishlist.some(item => item.id === productId);
                btn.classList.toggle('active', isInWishlist);
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Search form
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    this.handleSearch(query);
                }
            });

            // Search suggestions (debounced)
            const debouncedSearch = debounce((query) => {
                if (query.length > 2) {
                    this.showSearchSuggestions(query);
                }
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSignup(e);
            });
        }

        // Product filters (if on products page)
        this.setupProductFilters();

        // Lazy load images
        if ('IntersectionObserver' in window) {
            lazyLoadImages();
        }
    }

    // Handle search
    handleSearch(query) {
        if (this.isProductsPage()) {
            this.searchProducts(query);
        } else {
            // Redirect to products page with search query
            window.location.href = `/pages/products.html?q=${encodeURIComponent(query)}`;
        }
    }

    // Show search suggestions
    async showSearchSuggestions(query) {
        // TODO: Implement search suggestions dropdown
        console.log('Search suggestions for:', query);
    }

    // Setup product filters
    setupProductFilters() {
        // TODO: Implement product filters (price, category, rating, etc.)
        console.log('Setting up product filters');
    }

    // Handle newsletter signup
    async handleNewsletterSignup(e) {
        const formData = new FormData(e.target);
        const email = formData.get('email');

        if (!isValidEmail(email)) {
            toastManager.error('Please enter a valid email address');
            return;
        }

        try {
            // TODO: Implement newsletter signup API
            toastManager.success('Thank you for subscribing to our newsletter!');
            e.target.reset();
        } catch (error) {
            toastManager.error('Failed to subscribe. Please try again.');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global app instance
    window.app = new ECommerceApp();
    
    // Handle URL parameters
    const urlParams = getQueryParams();
    
    // Handle search query
    if (urlParams.q) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = urlParams.q;
        }
    }
    
    // Handle category filter
    if (urlParams.category && app.isProductsPage()) {
        app.loadProducts({ category: urlParams.category });
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ECommerceApp };
}