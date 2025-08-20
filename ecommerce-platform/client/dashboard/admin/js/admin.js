// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAdminData();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                this.handleNavigation(e);
            }
        });
    }

    async loadAdminData() {
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load admin data');
            }

            const data = await response.json();
            this.renderDashboard(data);
        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    renderDashboard(data) {
        this.updateStats(data.stats);
        this.renderProducts(data.products);
        this.renderOrders(data.orders);
    }

    updateStats(stats) {
        const elements = {
            'admin-revenue': `$${stats.revenue?.toLocaleString() || 0}`,
            'admin-orders': stats.orders || 0,
            'admin-products': stats.products || 0,
            'admin-customers': stats.customers || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    renderProducts(products) {
        const table = document.getElementById('products-table');
        if (!table) return;

        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>$${product.price}</td>
                            <td>${product.stock}</td>
                            <td>${product.category}</td>
                            <td>
                                <button onclick="editProduct(${product.id})">Edit</button>
                                <button onclick="deleteProduct(${product.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderOrders(orders) {
        const table = document.getElementById('orders-table');
        if (!table) return;

        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>$${order.total}</td>
                            <td><span class="status ${order.status}">${order.status}</span></td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="viewOrder(${order.id})">View</button>
                                <button onclick="updateOrderStatus(${order.id})">Update</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    handleNavigation(e) {
        e.preventDefault();
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');
        
        const section = e.target.getAttribute('href').substring(1);
        this.showSection(section);
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.admin-sections > div');
        sections.forEach(section => section.style.display = 'none');
        
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.admin-content').prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Global functions
function editProduct(productId) {
    window.location.href = `/pages/products.html?action=edit&id=${productId}`;
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (response.ok) {
                location.reload();
            } else {
                alert('Failed to delete product');
            }
        });
    }
}

function viewOrder(orderId) {
    window.location.href = `/pages/orders.html?id=${orderId}`;
}

function updateOrderStatus(orderId) {
    const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
    if (newStatus) {
        fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            if (response.ok) {
                location.reload();
            } else {
                alert('Failed to update order status');
            }
        });
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
