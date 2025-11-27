// Checkout page logic with full backend API integration
// Handles cart loading, order submission, and backend API communication

// Use the global API_BASE_URL from config.js (set by env.js override)
const API_BASE = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:8000';

/**
 * Initialize checkout page - load cart and user data
 */
async function initCheckout() {
    console.log('🚀 Initializing checkout page...');
    
    try {
        // Load checkout data from localStorage
        const checkoutData = JSON.parse(localStorage.getItem('altruria_checkout') || '{}');
        // Resolve current user: try localStorage cache, otherwise fetch /api/auth/me/
        const user = await fetchCurrentUser();

        if (!user) {
            console.warn('⚠️ No user logged in');
            showToast('Please log in to continue', 'warning');
            setTimeout(() => window.location.href = '../pages/login.html', 2000);
            return;
        }

        console.log('👤 User:', user);
        console.log('🛒 Checkout data:', checkoutData);

        // Load cart items FIRST (must be set before loadProducts)
        window.cart = checkoutData.items || [];
        console.log('📦 Cart loaded:', window.cart);

        // Show skeleton placeholders in order summary while product details load
        const orderContainer = document.querySelector('.order-items');
        if (orderContainer && window.cart && window.cart.length) {
            orderContainer.innerHTML = window.cart.map(() => `
                <div class="order-skeleton-item">
                    <div class="order-skeleton-thumb skeleton"></div>
                    <div style="flex:1">
                        <div class="skeleton-line medium skeleton"></div>
                        <div class="skeleton-line short skeleton" style="margin-top:8px"></div>
                    </div>
                    <div style="width:80px"><div class="skeleton-line short skeleton"></div></div>
                </div>
            `).join('');
        }

        // Load products to get full product details and images (depends on window.cart being set)
        await loadProducts();

        // Render order summary
        renderOrderSummary();
        // Prefill checkout form with user data
        prefillCheckoutForm(user);

        // Set up form listeners
        setupFormListeners();
        
    } catch (error) {
        console.error('❌ Error initializing checkout:', error);
        showToast('Error loading checkout data', 'error');
    }
}

/**
 * Try to return current user object. Uses localStorage `altruria_current_user` if present,
 * otherwise calls backend `/api/auth/me/` with `access_token`.
 */
async function fetchCurrentUser() {
    try {
        const cached = localStorage.getItem('altruria_current_user');
        if (cached) return JSON.parse(cached);
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        const resp = await fetch(`${API_BASE}/api/auth/me/`);
        // try an authenticated request if endpoint available
        const respAuth = await fetch(`${API_BASE}/api/auth/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (respAuth.ok) {
            const user = await respAuth.json();
            localStorage.setItem('altruria_current_user', JSON.stringify(user));
            return user;
        }
        return null;
    } catch (e) {
        console.warn('Could not fetch current user', e);
        return null;
    }
}

function prefillCheckoutForm(user) {
    try {
        const form = document.getElementById('checkout-form');
        if (!form || !user) return;
        const nameInput = form.querySelector('input[name="name"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const emailInput = form.querySelector('input[name="email"]');
        if (nameInput) nameInput.value = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '';
        if (phoneInput) phoneInput.value = user.mobile || '';
        if (emailInput) emailInput.value = user.email || '';

        // Set preferred payment if user has one
        const paymentSelect = form.querySelector('select[name="payment"]');
        if (paymentSelect && (user.preferred_payment || user.preferredPayment)) {
            const pref = user.preferred_payment || user.preferredPayment;
            // set value if option exists
            const opt = paymentSelect.querySelector(`option[value="${pref}"]`);
            if (opt) paymentSelect.value = pref;
        }
    } catch (e) {
        console.warn('Error prefilling checkout form', e);
    }
}

/**
 * Load products from backend API to get product details and images
 */
// Fetch product details for all items in cart by ID, map fields, and store in window._products
// Image paths: '../images/' from pages/ folder → resolves to /frontend/images/
// Fallback: default-product.png (copied to /frontend/images/ for missing product images)
async function loadProducts() {
    try {
        if (!window.cart || window.cart.length === 0) {
            window._products = [];
            return;
        }
        // Get unique product IDs from cart
        const ids = [...new Set(window.cart.map(item => item.productId))];
        const products = [];
        for (const id of ids) {
            try {
                const resp = await fetch(`${API_BASE}/api/products/${id}/`);
                if (!resp.ok) {
                    console.error(`❌ Product fetch failed for ID ${id}: status ${resp.status}`);
                    // Fallback to default-product.png if API fetch fails
                    products.push({ id, name: 'Unknown Product', price: 0, image: '../images/default-product.png', _error: true });
                    continue;
                }
                const prod = await resp.json();
                // Map backend fields to frontend expected fields
                // Image path from API is used if available; fallback to default-product.png
                products.push({
                    id: prod.id,
                    name: prod.name || prod.title || 'Unknown Product',
                    price: prod.price || prod.unit_price || 0,
                    image: prod.image || prod.photo || '../images/default-product.png', // Fallback: /frontend/images/default-product.png
                    ...prod
                });
            } catch (err) {
                console.error(`❌ Error fetching product ID ${id}:`, err);
                products.push({ id, name: 'Unknown Product', price: 0, image: '../images/default-product.png', _error: true });
            }
        }
        window._products = products;
        console.log('✅ Products loaded:', window._products);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showToast('Error loading product information', 'error');
    }
}

/**
 * Render order summary with items from cart
 */
function renderOrderSummary() {
    const container = document.querySelector('.order-items');
    if (!container) return;

    if (!window.cart || window.cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        document.querySelector('.subtotal').textContent = '₱0.00';
        document.querySelector('.total-amount').textContent = '₱0.00';
        return;
    }

    // Map product IDs to product data
    const products = window._products || [];
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    let subtotal = 0;
    let hadError = false;
    container.innerHTML = window.cart.map(item => {
        const product = productMap[item.productId];
        const name = product?.name || 'Unknown Product';
        // Image path: product image from API or fallback to /frontend/images/default-product.png
        const imageUrl = product?.image || '../images/default-product.png';
        const price = typeof product?.price === 'number' ? product.price : 0;
        const quantity = item.quantity || 1;
        const lineTotal = price * quantity;
        subtotal += lineTotal;
        if (!product || product._error) hadError = true;
        return `
            <div class="order-item${!product || product._error ? ' order-item-error' : ''}">
                <!-- Image fallback: ../images/default-product.png (resolves to /frontend/images/default-product.png) -->
                <img src="${imageUrl}" alt="${name}" onerror="this.src='../images/default-product.png'">
                <div class="meta">
                    <h4>${name}</h4>
                    <div class="qty">Qty: ${quantity}</div>
                </div>
                <div class="price">₱${lineTotal.toFixed(2)}</div>
                ${!product || product._error ? '<div class="error-msg">Product info unavailable</div>' : ''}
            </div>
        `;
    }).join('');
    if (hadError) {
        showToast('Some products could not be loaded. Please check your cart.', 'warning');
    }

    const shipping = getShippingCost();
    const total = subtotal + shipping;

    document.querySelector('.subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.querySelector('.shipping').textContent = `₱${shipping.toFixed(2)}`;
    document.querySelector('.total-amount').textContent = `₱${total.toFixed(2)}`;
}

/**
 * Get shipping cost based on delivery method
 */
function getShippingCost() {
    const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked');
    if (!deliveryMethod) return 0;
    return deliveryMethod.value === 'pickup' ? 0 : 80.00;
}

/**
 * Save order to altruriaOrders
 */
function saveOrder(orderData) {
    try {
        const orders = localStorage.getItem('altruriaOrders');
        const orderList = orders ? JSON.parse(orders) : [];
        orderList.push(orderData);
        localStorage.setItem('altruriaOrders', JSON.stringify(orderList));
    } catch (e) {
        console.error('Error saving order:', e);
    }
}

/**
 * Clear cart and redirect to home
 */
function clearCartAndRedirect() {
    if (window.cart) {
        window.cart = [];
        if (typeof saveCart === 'function') {
            saveCart();
        }
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.textContent = message;
    
    // Add to body if not already there
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const container = document.querySelector('.toast-container');
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const deliveryMethodRadios = document.querySelectorAll('input[name="delivery-method"]');
    const pickupSection = document.getElementById('pickup-section');
    const deliverySection = document.getElementById('delivery-section');
    const locationSelectBtns = document.querySelectorAll('.location-select');
    const openMapBtns = document.querySelectorAll('.open-map');

    // Handle delivery method change
    deliveryMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pickup') {
                if (pickupSection) pickupSection.style.display = 'block';
                if (deliverySection) deliverySection.style.display = 'none';
                form.querySelector('textarea[name="address"]')?.removeAttribute('required');
                form.querySelector('select[name="payment"]')?.removeAttribute('required');
            } else {
                if (pickupSection) pickupSection.style.display = 'none';
                if (deliverySection) deliverySection.style.display = 'block';
                form.querySelector('textarea[name="address"]')?.setAttribute('required', '');
                form.querySelector('select[name="payment"]')?.setAttribute('required', '');
            }
            renderOrderSummary();
        });
    });

    // Handle location selection
    locationSelectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const locationName = btn.textContent.trim();
            locationSelectBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('pickup-location-input').value = locationName;
            const locText = document.getElementById('location-text');
            if (locText) locText.textContent = locationName;
            const selectedLoc = document.getElementById('selected-location');
            if (selectedLoc) selectedLoc.style.display = 'block';
        });
    });

    // Open map
    openMapBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = btn.dataset.map;
            if (url) window.open(url, '_blank');
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked');
        const name = form.querySelector('input[name="name"]')?.value || '';
        const phone = form.querySelector('input[name="phone"]')?.value || '';
        const email = form.querySelector('input[name="email"]')?.value || '';

        // Validate basic fields
        if (!deliveryMethod) {
            showToast('Please select a delivery method (Pick Up or Delivery)', 'warning');
            return;
        }

        if (!name.trim()) {
            showToast('Please enter your name', 'warning');
            return;
        }

        if (!phone.trim()) {
            showToast('Please enter your phone number', 'warning');
            return;
        }

        if (!email.trim()) {
            showToast('Please enter your email', 'warning');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address', 'warning');
            return;
        }

        // Validate delivery-specific fields
        if (deliveryMethod.value === 'delivery') {
            const address = form.querySelector('textarea[name="address"]')?.value || '';
            const payment = form.querySelector('select[name="payment"]')?.value || '';

            if (!address.trim()) {
                showToast('Please enter your delivery address', 'warning');
                return;
            }

            if (!payment) {
                showToast('Please select a payment method', 'warning');
                return;
            }
        } else {
            // Pickup validation
            const pickupLocation = document.getElementById('pickup-location-input')?.value || '';
            if (!pickupLocation.trim()) {
                showToast('Please select a pick-up location', 'warning');
                return;
            }
        }

        // Validate cart
        if (!window.cart || window.cart.length === 0) {
            showToast('Your cart is empty. Add items before checking out', 'warning');
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        try {
            // Build order object for backend
            const orderPayload = {
                items: window.cart.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity
                })),
                delivery_method: deliveryMethod.value,
                shipping_address: deliveryMethod.value === 'delivery' ? form.querySelector('textarea[name="address"]').value : 'Pickup',
                payment_method: deliveryMethod.value === 'delivery' ? form.querySelector('select[name="payment"]').value : 'cash',
                total: window.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + getShippingCost()
            };

            // Add pickup location to address if pickup
            if (deliveryMethod.value === 'pickup') {
                orderPayload.shipping_address = 'Pickup at: ' + document.getElementById('pickup-location-input').value;
            }

            console.log('📤 Submitting order to backend:', orderPayload);

            // Submit to backend API
            const user = await fetchCurrentUser();
            const token = localStorage.getItem('access_token');

            if (!token || !user || !user.id) {
                showToast('Please log in to place an order', 'error');
                setTimeout(() => window.location.href = '../pages/login.html', 2000);
                return;
            }

            const response = await fetch(`${API_BASE}/api/orders/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Backend error:', errorData);
                showToast('Error placing order: ' + (errorData.detail || 'Unknown error'), 'error');
                return;
            }

            const backendOrder = await response.json();
            console.log('✅ Order created successfully:', backendOrder);

            // Save to local storage as backup
            try {
                const order = {
                    id: backendOrder.id || ('ORD-' + Date.now()),
                    date: new Date().toISOString(),
                    items: window.cart.length,
                    total: orderPayload.total,
                    status: 'pending',
                    deliveryMethod: deliveryMethod.value,
                    customerName: name,
                    customerPhone: phone,
                    customerEmail: email,
                    cartItems: window.cart
                };

                const orders = localStorage.getItem('altruriaOrders');
                const orderList = orders ? JSON.parse(orders) : [];
                orderList.push(order);
                localStorage.setItem('altruriaOrders', JSON.stringify(orderList));
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }

            // Clear cart
            window.cart = [];
            localStorage.removeItem('altruria_checkout');
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }

            // Show success message
            showToast('Order placed successfully! Thank you for your purchase.', 'success');
            console.log('✅ Order successful. Redirecting...');

            // Redirect after delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Checkout error:', error);
            showToast('Error processing order. Please try again.', 'error');

        } finally {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Place Order';
            }
        }
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Checkout page loaded');
    if (window.location.pathname.includes('checkout.html')) {
        initCheckout();
    }
});
