// Order History Management
class OrderHistoryManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.orders = [];
        this.init();
    }

    init() {
        this.loadOrderHistory();
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-order')) {
                this.viewOrderDetails(e.target.dataset.orderId);
            }
            if (e.target.classList.contains('cancel-order')) {
                this.cancelOrder(e.target.dataset.orderId);
            }
        });
    }

    async loadOrderHistory() {
        try {
            const response = await fetch('/api/user/orders', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load orders');
            }

            this.orders = await response.json();
            this.renderOrders();
        } catch (error) {
            console.error('Error loading order history:', error);
            this.showError('Failed to load order history');
        }
    }

    renderOrders() {
        const ordersContainer = document.getElementById('orders-list');
        if (!ordersContainer) return;

        if (this.orders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        ordersContainer.innerHTML = this.orders.map(order => `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <h3>Order #${order.id}</h3>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Items:</strong> ${order.items.length} items</p>
                    <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                </div>
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" width="50" height="50">
                            <div>
                                <p>${item.name}</p>
                                <p>Qty: ${item.quantity} - $${item.price.toFixed(2)} each</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    <button class="view-order" data-order-id="${order.id}">View Details</button>
                    ${order.status === 'pending' ? `
                        <button class="cancel-order" data-order-id="${order.id}">Cancel Order</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/user/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load order details');
            }

            const order = await response.json();
            this.showOrderModal(order);
        } catch (error) {
            console.error('Error loading order details:', error);
            this.showError('Failed to load order details');
        }
    }

    showOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'order-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Order Details #${order.id}</h2>
                <div class="order-info">
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                </div>
                <div class="order-items">
                    <h3>Items:</h3>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" width="50" height="50">
                            <div>
                                <p>${item.name}</p>
                                <p>Qty: ${item.quantity} - $${item.price.toFixed(2)} each</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-tracking">
                    <h3>Tracking Information:</h3>
                    ${order.trackingNumber ? `
                        <p>Tracking Number: ${order.trackingNumber}</p>
                        <p>Carrier: ${order.carrier}</p>
                    ` : '<p>No tracking information available</p>'}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            const response = await fetch(`/api/user/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showSuccess('Order cancelled successfully');
                this.loadOrderHistory();
            } else {
                const error = await response.json();
                this.showError(error.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            this.showError('Failed to cancel order');
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

// Initialize order history manager
document.addEventListener('DOMContentLoaded', () => {
    new OrderHistoryManager();
});
