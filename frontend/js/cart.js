// Shopping Cart Management and UI

const SHIPPING_COST = 80;

async function fetchAndRenderCart() {
    console.log('📦 Fetching products for cart rendering...');
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
        // show cart skeletons while loading
        cartItemsContainer.innerHTML = Array.from({length: 3}).map(() => `
            <div class="cart-skeleton-row">
                <div class="cart-skeleton-thumb skeleton"></div>
                <div class="cart-skeleton-col">
                    <div class="skeleton-line medium skeleton"></div>
                    <div class="skeleton-line short skeleton" style="margin-top:8px"></div>
                </div>
                <div style="width:80px;">
                    <div class="skeleton-line short skeleton"></div>
                </div>
            </div>
        `).join('');
    }
    try {
        // Fetch products if not already loaded
        if (!window._products || window._products.length === 0) {
            const endpoint = `${API_BASE_URL}/products/`;
            const res = await fetch(endpoint, { 
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                mode: 'cors'
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const json = await res.json();
            window._products = Array.isArray(json) ? json : (json.results || json.data || []);
            console.log(`✅ Loaded ${window._products.length} products`);
        }
        
        renderCart();
    } catch (err) {
        console.error('❌ Error fetching products for cart:', err);
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `<p style="color: #d32f2f; padding: 2rem;">Error loading products. Please refresh the page.</p>`;
        }
    }
}

function renderCart() {
    const cart = _getCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    
    if (!cart.length) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
        updateCartSummary([], {});
        console.log('🛒 Cart is empty');
        return;
    }

    if (emptyCartMessage) emptyCartMessage.classList.add('hidden');

    // Fetch product details for cart items
    const products = window._products || [];
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    console.log(`📊 Rendering ${cart.length} items from cart`);

    const itemsHTML = cart.map(item => {
        const product = productMap[item.productId];
        const quantity = item.quantity || 1;
        const price = product ? parseFloat(product.price) : 0;
        const itemTotal = price * quantity;

        if (!product) {
            console.warn(`⚠️ Product not found in map: ID ${item.productId}`);
        }

        return `
            <div class="cart-item" data-product-id="${item.productId}">
                <!-- Image path: from API or fallback to poster.png in /frontend/images/ -->
                <img 
                    src="${product?.image || '../images/poster.png'}" 
                    alt="${product?.name || 'Unknown Product'}" 
                    class="cart-item-image"
                    onerror="this.src='../images/poster.png'"
                >
                
                <div class="cart-item-details">
                    <h3>${product?.name || 'Unknown Product'}</h3>
                    <p class="cart-item-category">${product?.category || 'N/A'}</p>
                </div>

                <div class="cart-item-price">₱${price.toFixed(2)}</div>

                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decrementItem(${item.productId})">−</button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="quantity-btn" onclick="incrementItem(${item.productId})">+</button>
                </div>

                <div class="cart-item-total">₱${itemTotal.toFixed(2)}</div>

                <button class="remove-item" onclick="removeFromCart(${item.productId})" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = itemsHTML;
    }
    
    updateCartSummary(cart, productMap);
}

function updateCartSummary(cart, productMap) {
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => {
        const product = productMap[item.productId];
        const price = product ? parseFloat(product.price) : 0;
        const quantity = item.quantity || 1;
        const itemTotal = price * quantity;
        
        console.log(`  Item: ID ${item.productId} | Price: ₱${price.toFixed(2)} | Qty: ${quantity} | Total: ₱${itemTotal.toFixed(2)}`);
        
        return sum + itemTotal;
    }, 0);

    const total = subtotal + SHIPPING_COST;

    console.log(`💰 Subtotal: ₱${subtotal.toFixed(2)} | Shipping: ₱${SHIPPING_COST.toFixed(2)} | Total: ₱${total.toFixed(2)}`);

    const subtotalEl = document.querySelector('.subtotal');
    const totalEl = document.querySelector('.total-amount');

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;
}

function incrementItem(productId) {
    const cart = _getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = (item.quantity || 1) + 1;
        localStorage.setItem('altruria_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        console.log(`➕ Quantity increased for product ${productId}: ${item.quantity}`);
        showAddedNotification(`Quantity increased to ${item.quantity}`);
    }
}

function decrementItem(productId) {
    const cart = _getCart();
    const item = cart.find(i => i.productId === productId);
    if (item && item.quantity > 1) {
        item.quantity--;
        localStorage.setItem('altruria_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        console.log(`➖ Quantity decreased for product ${productId}: ${item.quantity}`);
        showAddedNotification(`Quantity decreased to ${item.quantity}`);
    }
}

function removeFromCart(productId) {
    const cart = _getCart();
    const idx = cart.findIndex(i => i.productId === productId);
    if (idx > -1) {
        const removedItem = cart[idx];
        cart.splice(idx, 1);
        localStorage.setItem('altruria_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        console.log(`🗑️ Removed product ${productId} from cart`);
        showRemovedNotification('Item removed from cart');
    }
}

function showAddedNotification(msg) {
    const el = document.createElement('div');
    el.className = 'cart-notification success';
    el.innerHTML = `<i class="fas fa-check-circle"></i> <span>${msg}</span>`;
    el.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #51cf66, #40c057);
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 8px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

function showRemovedNotification(msg) {
    const el = document.createElement('div');
    el.className = 'cart-notification error';
    el.innerHTML = `<i class="fas fa-times-circle"></i> <span>${msg}</span>`;
    el.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b, #fa5252);
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 8px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

function proceedToCheckout() {
    const cart = _getCart();
    if (!cart.length) {
        alert('Your cart is empty. Add some products first!');
        return;
    }

    const user = getCurrentUser();
    console.log('🔐 Proceeding to checkout. User:', user);
    
    if (!user) {
        const confirmLogin = confirm('Please log in or create an account to continue. Would you like to log in?');
        if (confirmLogin) {
            window.location.href = '../pages/login.html';
        } else {
            // Continue as guest
            const guestUser = {
                id: 'guest_' + Date.now(),
                guest: true,
                createdAt: Date.now()
            };
            setCurrentUser(guestUser);
            console.log('👤 Guest checkout initiated');
            goToCheckout();
        }
        return;
    }

    goToCheckout();
}

function goToCheckout() {
    // Store checkout info
    const cart = _getCart();
    const user = getCurrentUser();
    const products = window._products || [];
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const checkoutData = {
        items: cart,
        user: user,
        timestamp: Date.now(),
        total: calculateTotal()
    };

    console.log('💳 Checkout data prepared:', checkoutData);
    localStorage.setItem('altruria_checkout', JSON.stringify(checkoutData));
    window.location.href = '../pages/checkout.html';
}

function calculateTotal() {
    const cart = _getCart();
    const products = window._products || [];
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const subtotal = cart.reduce((sum, item) => {
        const product = productMap[item.productId];
        const price = product ? parseFloat(product.price) : 0;
        return sum + (price * (item.quantity || 1));
    }, 0);

    const total = subtotal + SHIPPING_COST;
    console.log(`💰 Total calculated: ₱${total.toFixed(2)}`);
    return total;
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Cart page loaded. Initializing...');
    fetchAndRenderCart();
});

// Expose functions globally
window.renderCart = renderCart;
window.incrementItem = incrementItem;
window.decrementItem = decrementItem;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;
window.calculateTotal = calculateTotal;
