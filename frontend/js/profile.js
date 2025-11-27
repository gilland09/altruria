// Profile page JS with backend integration

const API_URL = window.API_BASE_URL || 'http://localhost:8000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', async function () {
    console.log('[PROFILE] Page loaded, initializing...');
    
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.warn('[PROFILE] No auth token found, redirecting to login');
        showToast('Please log in to view your profile', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    // Setup event listeners
    setupEditToggle();
    setupFormHandlers();
    setupLogout();

    // Load data
    await loadUserProfile();
    await loadUserOrders();
});

// ============================================================================
// USER PROFILE LOADING & DISPLAY
// ============================================================================
async function loadUserProfile() {
    try {
        console.log('[PROFILE] Fetching user profile...');
        showProfileLoading(true);

        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/auth/me/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('[PROFILE] Token invalid or expired');
                localStorage.removeItem('access_token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        currentUser = await response.json();
        console.log('[PROFILE] User profile loaded:', currentUser);

        displayUserProfile(currentUser);
        showProfileLoading(false);

    } catch (error) {
        console.error('[PROFILE] Error loading user profile:', error);
        showProfileLoading(false);
        showToast(`Error loading profile: ${error.message}`, 'error');
    }
}

function displayUserProfile(user) {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || user.username;

    // Set display values
    document.getElementById('display-name').textContent = fullName;
    document.getElementById('display-email').textContent = user.email || '-';
    document.getElementById('display-phone').textContent = user.mobile || '-';
    document.getElementById('display-address').textContent = user.address || '-';
    
    // Format created date
    const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : '-';
    document.getElementById('display-created').textContent = createdDate;

    // Populate edit form
    document.getElementById('edit-name').value = fullName;
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-phone').value = user.mobile || '';
    document.getElementById('edit-address').value = user.address || '';

    // Preferred payment (show and add edit control if missing)
    const preferred = user.preferred_payment || user.preferredPayment || '';
    const prefDisplay = document.getElementById('display-preferred-payment');
    if (prefDisplay) {
        prefDisplay.textContent = preferred ? formatPaymentLabel(preferred) : '-';
    } else {
        const displayGrid = document.getElementById('profile-display');
        if (displayGrid) {
            const wrapper = document.createElement('div');
            wrapper.className = 'info-group';
            wrapper.innerHTML = `<label>Preferred Payment</label><p id="display-preferred-payment" class="info-value">${preferred ? formatPaymentLabel(preferred) : '-'}</p>`;
            displayGrid.appendChild(wrapper);
        }
    }

    const editPref = document.getElementById('edit-preferred-payment');
    if (editPref) {
        editPref.value = preferred;
    } else {
        const editForm = document.getElementById('profile-edit-form');
        if (editForm) {
            const prefWrapper = document.createElement('div');
            prefWrapper.className = 'form-group';
            prefWrapper.innerHTML = `
                <label for="edit-preferred-payment">Preferred Payment</label>
                <select id="edit-preferred-payment" name="preferred_payment">
                    <option value="">-- Select preferred payment --</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="gcash">GCash</option>
                </select>
            `;
            const actions = editForm.querySelector('.form-actions');
            if (actions) editForm.insertBefore(prefWrapper, actions);
            else editForm.appendChild(prefWrapper);
        }
    }
}

function formatPaymentLabel(code) {
    if (!code) return '-';
    return code === 'cod' ? 'Cash on Delivery' : code === 'bank' ? 'Bank Transfer' : code === 'gcash' ? 'GCash' : code;
}

function showProfileLoading(show) {
    const loader = document.getElementById('profile-loading');
    const display = document.getElementById('profile-display');
    if (show) {
        loader.style.display = 'flex';
        display.style.opacity = '0.5';
        display.style.pointerEvents = 'none';
    } else {
        loader.style.display = 'none';
        display.style.opacity = '1';
        display.style.pointerEvents = 'auto';
    }
}

// ============================================================================
// PROFILE EDIT MODE
// ============================================================================
function setupEditToggle() {
    const editBtn = document.getElementById('edit-toggle-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            toggleEditMode();
            // Restore form with current user data
            if (currentUser) {
                displayUserProfile(currentUser);
            }
        });
    }
}

function toggleEditMode() {
    const displayMode = document.getElementById('profile-display');
    const editMode = document.getElementById('profile-edit-form');
    const editBtn = document.getElementById('edit-toggle-btn');

    const isEditing = editMode.style.display !== 'none';

    if (isEditing) {
        // Switch to display mode
        displayMode.style.display = 'grid';
        editMode.style.display = 'none';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    } else {
        // Switch to edit mode
        displayMode.style.display = 'none';
        editMode.style.display = 'block';
        editBtn.innerHTML = '<i class="fas fa-times"></i> Close';
    }
}

function setupFormHandlers() {
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', handleProfileUpdate);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    console.log('[PROFILE] Updating profile...');

    const fullNameInput = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const address = document.getElementById('edit-address').value.trim();

    // Validation
    const errors = [];
    if (!fullNameInput || fullNameInput.length < 2) {
        errors.push('Full name must be at least 2 characters');
    }
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email');
    }

    if (errors.length > 0) {
        errors.forEach(err => showToast(err, 'error'));
        return;
    }

    // Parse name
    const nameParts = fullNameInput.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const updatePayload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile: phone,
        address: address
    };

    // include preferred payment if user selected one
    const prefEl = document.getElementById('edit-preferred-payment');
    if (prefEl) updatePayload.preferred_payment = prefEl.value || '';

    console.log('[PROFILE] Update payload:', updatePayload);

    try {
        const submitBtn = document.querySelector('.btn-save');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/auth/me/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.detail || `Update failed: ${response.status}`);
        }

        const updatedUser = await response.json();
        console.log('[PROFILE] Profile updated successfully:', updatedUser);

        currentUser = updatedUser;
        displayUserProfile(updatedUser);
        toggleEditMode();
        showToast('Profile updated successfully!', 'success');

        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';

    } catch (error) {
        console.error('[PROFILE] Error updating profile:', error);
        showToast(`Error: ${error.message}`, 'error');

        const submitBtn = document.querySelector('.btn-save');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// ============================================================================
// ORDER HISTORY LOADING & DISPLAY
// ============================================================================
async function loadUserOrders() {
    try {
        console.log('[PROFILE] Fetching user orders...');
        const token = localStorage.getItem('access_token');
        
        // Try to fetch orders from the user's orders endpoint
        const response = await fetch(`${API_URL}/users/orders/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let orders = [];

        if (response.ok) {
            orders = await response.json();
        } else if (response.status === 404) {
            console.log('[PROFILE] Orders endpoint not found, will show empty state');
            orders = [];
        } else {
            throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        console.log(`[PROFILE] Loaded ${orders.length} orders`, orders);
        renderOrderHistory(orders);

    } catch (error) {
        console.error('[PROFILE] Error loading orders:', error);
        renderOrderHistory([]);
    }
}

function renderOrderHistory(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>No orders yet</p>
                <a href="products.html" class="btn-shop">Start Shopping</a>
            </div>
        `;
        return;
    }

    orders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'order-card';

        const createdDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = `status-${order.status}`;
        const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = order.items.map(item => {
                const itemPrice = parseFloat(item.price || 0);
                const itemQuantity = parseInt(item.quantity || 1);
                const itemTotal = itemPrice * itemQuantity;
                return `
                    <div class="order-item-row">
                        <span>${item.product?.name || 'Unknown Product'}</span>
                        <span>×${itemQuantity}</span>
                        <span>₱${itemTotal.toFixed(2)}</span>
                    </div>
                `;
            }).join('');
        }

        // Parse order total as float to handle Django Decimal string
        const orderTotal = parseFloat(order.total || 0);

        orderEl.innerHTML = `
            <div class="order-header">
                <div class="order-id">
                    <strong>Order #${order.id}</strong>
                    <span class="order-date">${createdDate}</span>
                </div>
                <span class="order-status ${statusClass}">${statusLabel}</span>
            </div>
            
            <div class="order-details">
                <div class="order-items">
                    ${itemsHtml}
                </div>
                
                <div class="order-meta">
                    <div class="meta-row">
                        <span>Payment:</span>
                        <strong>${order.payment_method === 'cod' ? 'Cash on Delivery' : 
                                  order.payment_method === 'bank' ? 'Bank Transfer' : 
                                  order.payment_method === 'gcash' ? 'GCash' : order.payment_method}</strong>
                    </div>
                    <div class="meta-row">
                        <span>Delivery:</span>
                        <strong>${order.delivery_method === 'pickup' ? 'Pick Up' : 'Delivery'}</strong>
                    </div>
                </div>
                
                <div class="order-total">
                    <span>Total:</span>
                    <strong>₱${orderTotal.toFixed(2)}</strong>
                </div>

                <div class="order-actions">
                    <button class="btn-plain btn-toggle">View Items</button>
                    <button class="btn-plain btn-track" data-order-id="${order.id}">Track</button>
                </div>
            </div>
        `;

        container.appendChild(orderEl);

        // hook up toggle for details
        const details = orderEl.querySelector('.order-details');
        const toggleBtn = orderEl.querySelector('.btn-toggle');
        if (toggleBtn && details) {
            toggleBtn.addEventListener('click', () => {
                if (!details.style.display || details.style.display === 'none') {
                    details.style.display = 'block';
                    toggleBtn.textContent = 'Hide Items';
                } else {
                    details.style.display = 'none';
                    toggleBtn.textContent = 'View Items';
                }
            });
        }
        // Track button opens a simple tracking modal
        const trackBtn = orderEl.querySelector('.btn-track');
        if (trackBtn) {
            trackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showTrackingModal(order);
            });
        }
    });
}

// Lightweight tracking modal - shows status and items
function showTrackingModal(order) {
    const existing = document.getElementById('tracking-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tracking-modal';
    modal.className = 'tracking-modal';
    const status = order.status || 'pending';
    const est = order.estimated_delivery || '';
    modal.innerHTML = `
        <div class="tracking-content">
            <button class="tracking-close">×</button>
            <h3>Order #${order.id} - ${status.charAt(0).toUpperCase() + status.slice(1)}</h3>
            ${est ? `<p><strong>Estimated Delivery:</strong> ${new Date(est).toLocaleString()}</p>` : ''}
            <div class="tracking-items">${order.items && order.items.length ? order.items.map(i => `<div>${i.product?.name || i.name} × ${i.quantity}</div>`).join('') : '<p>No items available</p>'}</div>
        </div>
    `;
    document.body.appendChild(modal);

    // minimal styles (scoped)
    if (!document.getElementById('tracking-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'tracking-modal-styles';
        style.innerHTML = `
            .tracking-modal{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:12000}
            .tracking-content{background:#fff;padding:1rem 1.25rem;border-radius:8px;max-width:520px;width:94%;box-shadow:0 12px 30px rgba(0,0,0,0.2)}
            .tracking-close{position:absolute;right:1rem;top:0.75rem;background:transparent;border:none;font-size:1.25rem;cursor:pointer}
            .tracking-items{margin-top:0.75rem}
        `;
        document.head.appendChild(style);
    }

    modal.querySelector('.tracking-close').addEventListener('click', () => modal.remove());
}

// ============================================================================
// LOGOUT FUNCTIONALITY
// ============================================================================
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    console.log('[PROFILE] User logging out...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('altruria_current_user');
    localStorage.removeItem('altruria_cart');
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.href = 'login.html', 1500);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
