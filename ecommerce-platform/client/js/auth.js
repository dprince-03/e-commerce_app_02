// ===== AUTHENTICATION MANAGER =====

class AuthManager {
    constructor() {
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.init();
    }

    // Initialize auth manager
    init() {
        this.loadFromStorage();
        this.setupTokenRefresh();
        this.updateUI();
    }

    // Load auth data from localStorage
    loadFromStorage() {
        this.token = storage.get(STORAGE_KEYS.TOKEN);
        this.refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
        this.user = storage.get(STORAGE_KEYS.USER);
    }

    // Save auth data to localStorage
    saveToStorage() {
        if (this.token) {
            storage.set(STORAGE_KEYS.TOKEN, this.token);
        } else {
            storage.remove(STORAGE_KEYS.TOKEN);
        }

        if (this.refreshToken) {
            storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken);
        } else {
            storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        }

        if (this.user) {
            storage.set(STORAGE_KEYS.USER, this.user);
        } else {
            storage.remove(STORAGE_KEYS.USER);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    // Check if user has specific role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Check if user is vendor
    isVendor() {
        return this.hasRole('vendor');
    }

    // Login user
    async login(email, password) {
        try {
            const response = await httpClient.post('/auth/login', {
                email,
                password
            });

            if (response.success) {
                this.setAuthData(response.data);
                toastManager.success('Login successful!');
                return response.data;
            }
        } catch (error) {
            toastManager.error(error.message || 'Login failed');
            throw error;
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await httpClient.post('/auth/register', userData);

            if (response.success) {
                this.setAuthData(response.data);
                toastManager.success('Registration successful! Please verify your email.');
                return response.data;
            }
        } catch (error) {
            toastManager.error(error.message || 'Registration failed');
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.token) {
                await httpClient.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
            toastManager.info('Logged out successfully');
            
            // Redirect to home page
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = '/';
            }
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await httpClient.post('/auth/refresh', {
                refreshToken: this.refreshToken
            });

            if (response.success) {
                this.token = response.data.token;
                this.refreshToken = response.data.refreshToken;
                this.saveToStorage();
                return response.data;
            }
        } catch (error) {
            // Refresh token is invalid, clear auth data
            this.clearAuthData();
            throw error;
        }
    }

    // Get current user profile
    async getCurrentUser() {
        try {
            const response = await httpClient.get('/auth/me');
            if (response.success) {
                this.user = response.data.user;
                this.saveToStorage();
                this.updateUI();
                return this.user;
            }
        } catch (error) {
            console.error('Failed to get current user:', error);
            throw error;
        }
    }

    // Update user profile
    async updateProfile(userData) {
        try {
            const response = await httpClient.put('/auth/me', userData);
            if (response.success) {
                this.user = response.data.user;
                this.saveToStorage();
                this.updateUI();
                toastManager.success('Profile updated successfully!');
                return this.user;
            }
        } catch (error) {
            toastManager.error(error.message || 'Failed to update profile');
            throw error;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await httpClient.put('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (response.success) {
                toastManager.success('Password changed successfully!');
                return response;
            }
        } catch (error) {
            toastManager.error(error.message || 'Failed to change password');
            throw error;
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await httpClient.post('/auth/forgot-password', { email });
            if (response.success) {
                toastManager.success('Password reset link sent to your email!');
                return response;
            }
        } catch (error) {
            toastManager.error(error.message || 'Failed to send reset email');
            throw error;
        }
    }

    // Reset password
    async resetPassword(token, password) {
        try {
            const response = await httpClient.post(`/auth/reset-password/${token}`, {
                password
            });

            if (response.success) {
                this.setAuthData(response.data);
                toastManager.success('Password reset successful!');
                return response.data;
            }
        } catch (error) {
            toastManager.error(error.message || 'Failed to reset password');
            throw error;
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            const response = await httpClient.get(`/auth/verify-email/${token}`);
            if (response.success) {
                toastManager.success('Email verified successfully!');
                // Refresh user data
                if (this.isAuthenticated()) {
                    await this.getCurrentUser();
                }
                return response;
            }
        } catch (error) {
            toastManager.error(error.message || 'Email verification failed');
            throw error;
        }
    }

    // Resend verification email
    async resendVerification() {
        try {
            const response = await httpClient.post('/auth/resend-verification');
            if (response.success) {
                toastManager.success('Verification email sent!');
                return response;
            }
        } catch (error) {
            toastManager.error(error.message || 'Failed to send verification email');
            throw error;
        }
    }

    // Set authentication data
    setAuthData(data) {
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
        this.saveToStorage();
        this.updateUI();
    }

    // Clear authentication data
    clearAuthData() {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.saveToStorage();
        this.updateUI();
    }

    // Setup automatic token refresh
    setupTokenRefresh() {
        if (!this.token) return;

        // Decode token to get expiry time
        try {
            const tokenData = JSON.parse(atob(this.token.split('.')[1]));
            const expiryTime = tokenData.exp * 1000;
            const now = Date.now();
            const timeUntilExpiry = expiryTime - now;

            // Refresh token 5 minutes before expiry
            const refreshTime = timeUntilExpiry - (5 * 60 * 1000);

            if (refreshTime > 0) {
                setTimeout(async () => {
                    try {
                        await this.refreshAccessToken();
                        this.setupTokenRefresh(); // Setup next refresh
                    } catch (error) {
                        console.error('Token refresh failed:', error);
                    }
                }, refreshTime);
            }
        } catch (error) {
            console.error('Error setting up token refresh:', error);
        }
    }

    // Update UI based on auth state
    updateUI() {
        const userBtn = document.getElementById('userBtn');
        const userName = document.getElementById('userName');
        const guestMenu = document.getElementById('guestMenu');
        const userMenu = document.getElementById('userMenu');

        if (!userBtn) return; // Elements not found on this page

        if (this.isAuthenticated()) {
            // Update user name
            if (userName) {
                userName.textContent = this.user.firstName || 'Account';
            }

            // Show user menu, hide guest menu
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';

            // Add admin/vendor specific menu items
            this.updateUserMenu();
        } else {
            // Show guest menu, hide user menu
            if (userName) {
                userName.textContent = 'Account';
            }
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }

        // Update cart count
        this.updateCartCount();
    }

    // Update user menu with role-specific items
    updateUserMenu() {
        const userMenu = document.getElementById('userMenu');
        if (!userMenu) return;

        // Remove existing role-specific items
        const existingRoleItems = userMenu.querySelectorAll('.role-specific');
        existingRoleItems.forEach(item => item.remove());

        // Add admin menu items
        if (this.isAdmin()) {
            const adminItem = document.createElement('a');
            adminItem.href = '/dashboard/admin/admin-dashboard.html';
            adminItem.className = 'user-menu-item role-specific';
            adminItem.innerHTML = '<i class="fas fa-cog"></i> Admin Panel';
            userMenu.insertBefore(adminItem, userMenu.children[1]);
        }

        // Add vendor menu items
        if (this.isVendor()) {
            const vendorItem = document.createElement('a');
            vendorItem.href = '/dashboard/vendor/vendor-dashboard.html';
            vendorItem.className = 'user-menu-item role-specific';
            vendorItem.innerHTML = '<i class="fas fa-store"></i> Vendor Dashboard';
            userMenu.insertBefore(vendorItem, userMenu.children[1]);
        }
    }

    // Update cart count in UI
    updateCartCount() {
        const cart = storage.get(STORAGE_KEYS.CART, []);
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('#cartCount, #mobileCartCount');
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = cartCount;
            }
        });
    }

    // Require authentication (redirect if not authenticated)
    requireAuth() {
        if (!this.isAuthenticated()) {
            const currentUrl = window.location.pathname + window.location.search;
            storage.set('redirectAfterLogin', currentUrl);
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }

    // Require admin role
    requireAdmin() {
        if (!this.requireAuth()) return false;
        
        if (!this.isAdmin()) {
            toastManager.error('Access denied. Admin privileges required.');
            window.location.href = '/';
            return false;
        }
        return true;
    }

    // Require vendor or admin role
    requireVendorOrAdmin() {
        if (!this.requireAuth()) return false;
        
        if (!this.isVendor() && !this.isAdmin()) {
            toastManager.error('Access denied. Vendor or admin privileges required.');
            window.location.href = '/';
            return false;
        }
        return true;
    }

    // Handle redirect after login
    handlePostLoginRedirect() {
        const redirectUrl = storage.get('redirectAfterLogin');
        if (redirectUrl) {
            storage.remove('redirectAfterLogin');
            window.location.href = redirectUrl;
        } else {
            // Default redirect based on role
            if (this.isAdmin()) {
                window.location.href = '/dashboard/admin/admin-dashboard.html';
            } else if (this.isVendor()) {
                window.location.href = '/dashboard/vendor/vendor-dashboard.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// ===== DOM EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // User dropdown toggle
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authManager.logout();
        });
    }

    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('show');
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, authManager };
}