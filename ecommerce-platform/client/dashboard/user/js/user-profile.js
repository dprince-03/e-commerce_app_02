// User Profile Management
class UserProfileManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
    }

    async loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profile');
            }

            const profile = await response.json();
            this.populateProfileForm(profile);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    populateProfileForm(profile) {
        const form = document.getElementById('profile-form');
        if (!form) return;

        Object.keys(profile).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = profile[key] || '';
            }
        });
    }

    async updateProfile() {
        const formData = new FormData(document.getElementById('profile-form'));
        const profileData = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                this.showSuccess('Profile updated successfully');
            } else {
                const error = await response.json();
                this.showError(error.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize user profile manager
document.addEventListener('DOMContentLoaded', () => {
    new UserProfileManager();
});
