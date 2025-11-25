# Frontend Integration Guide - Altruria

This guide explains how to integrate the frontend with the new Django REST backend API.

## API Configuration

The backend API is available at: **`http://localhost:8000/api/`**

### Base Setup

Create a new file `frontend/js/config.js`:

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register/`,
  LOGIN: `${API_BASE_URL}/token/`,
  REFRESH_TOKEN: `${API_BASE_URL}/token/refresh/`,
  GET_ME: `${API_BASE_URL}/auth/me/`,

  // Products
  PRODUCTS: `${API_BASE_URL}/products/`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/products/${id}/`,

  // Orders
  CREATE_ORDER: `${API_BASE_URL}/orders/`,
  USER_ORDERS: (userId) => `${API_BASE_URL}/orders/user/${userId}/`,
  ORDER_DETAIL: (orderId) => `${API_BASE_URL}/orders/${orderId}/`,
  UPDATE_ORDER_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status/`,

  // Messages
  CREATE_MESSAGE: `${API_BASE_URL}/messages/`,
  USER_MESSAGES: (userId) => `${API_BASE_URL}/messages/user/${userId}/`,
  ADMIN_MESSAGES: `${API_BASE_URL}/messages/admin/`,
};

// Token Management
class TokenManager {
  static setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  static async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

// API Helper Functions
async function apiCall(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if available
  const token = TokenManager.getAccessToken();
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = { ...defaultOptions, ...options };

  try {
    let response = await fetch(endpoint, finalOptions);

    // Handle token expiration (401)
    if (response.status === 401 && TokenManager.getRefreshToken()) {
      const refreshed = await TokenManager.refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        finalOptions.headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
        response = await fetch(endpoint, finalOptions);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export { API_BASE_URL, API_ENDPOINTS, TokenManager, apiCall };
```

## Updated Frontend JavaScript Files

### 1. Update `auth.js` to use backend API

```javascript
import { API_ENDPOINTS, TokenManager, apiCall } from './config.js';

// Register
async function register(data) {
  try {
    const response = await apiCall(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login
async function login(username, password) {
  try {
    const response = await apiCall(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    TokenManager.setTokens(response.access, response.refresh);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get current user
async function getCurrentUser() {
  try {
    return await apiCall(API_ENDPOINTS.GET_ME);
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Logout
function logout() {
  TokenManager.clearTokens();
  window.location.href = 'login.html';
}

// Check if user is authenticated
function isAuthenticated() {
  return !!TokenManager.getAccessToken();
}

export { register, login, getCurrentUser, logout, isAuthenticated };
```

### 2. Update `script.js` to fetch products from API

```javascript
import { API_ENDPOINTS, apiCall } from './config.js';

let products = [];

// Fetch products from backend
async function fetchProducts(searchQuery = '', category = '') {
  try {
    let url = API_ENDPOINTS.PRODUCTS;
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (category) params.append('category', category);
    if (params.toString()) url += `?${params.toString()}`;

    const data = await apiCall(url);
    products = data.results || data;
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

// Display products
function displayProducts(productsToShow = products) {
  const productGrid = document.querySelector('.product-grid');
  productGrid.innerHTML = '';

  productsToShow.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="category">${product.category}</p>
        <p class="description">${product.description.substring(0, 100)}...</p>
        <div class="product-footer">
          <span class="price">₱${parseFloat(product.price).toFixed(2)}</span>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    productGrid.appendChild(productCard);
  });

  attachAddToCartListeners();
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProducts();
  displayProducts();
});

export { fetchProducts, displayProducts, products };
```

### 3. Update `cart.js` to create orders via API

```javascript
import { API_ENDPOINTS, apiCall, TokenManager } from './config.js';

// Checkout function
async function proceedToCheckout() {
  if (!TokenManager.getAccessToken()) {
    alert('Please login to proceed with checkout');
    window.location.href = 'login.html';
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  const items = cart.map(item => ({
    product_id: item.id,
    quantity: item.quantity,
  }));

  const orderData = {
    payment_method: document.querySelector('select[name="payment"]').value || 'cod',
    shipping_address: document.querySelector('textarea[name="address"]').value || '',
    delivery_method: document.querySelector('input[name="delivery-method"]:checked').value || 'delivery',
    items: items,
  };

  try {
    const response = await apiCall(API_ENDPOINTS.CREATE_ORDER, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    alert(`Order created successfully! Order ID: ${response.id}`);
    localStorage.removeItem('cart');
    window.location.href = 'profile.html';
  } catch (error) {
    alert(`Order creation failed: ${error.message}`);
  }
}

export { proceedToCheckout };
```

## Frontend Directory Structure (New)

```
frontend/
├── index.html                          # Home page
├── pages/
│   ├── products.html                   # Products page
│   ├── cart.html                       # Shopping cart
│   ├── checkout.html                   # Checkout
│   ├── login.html                      # Login
│   ├── signup.html                     # Registration
│   ├── profile.html                    # User profile
│   ├── settings.html                   # User settings
│   ├── terms.html                      # Terms of use
│   └── privacy.html                    # Privacy policy
├── css/
│   ├── styles.css                      # Base styles
│   ├── homepage-styles.css             # Home page styles
│   ├── cart-styles.css                 # Cart styles
│   ├── checkout-styles.css             # Checkout styles
│   ├── profile-styles.css              # Profile styles
│   ├── settings-styles.css             # Settings styles
│   └── login-styles.css                # Login/signup styles
├── js/
│   ├── config.js                       # API configuration
│   ├── auth.js                         # Authentication logic
│   ├── script.js                       # Main app logic
│   ├── cart.js                         # Cart management
│   ├── checkout.js                     # Checkout logic
│   ├── profile.js                      # Profile logic
│   ├── settings.js                     # Settings logic
│   └── constants.js                    # App constants
├── components/
│   ├── header.html                     # Reusable header
│   ├── footer.html                     # Reusable footer
│   └── include.js                      # Component loader
├── images/
│   ├── logo.png
│   ├── poster.png
│   └── placeholder.png
└── docs/
    ├── API_INTEGRATION.md              # This file
    ├── FRONTEND_README.md              # Frontend setup guide
    └── DEPLOYMENT.md                   # Frontend deployment guide
```

## API Response Integration Examples

### Authentication Flow

```javascript
// Register
const registerData = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  password_confirm: 'SecurePass123',
  first_name: 'John',
  last_name: 'Doe',
  mobile: '+639123456789',
  address: '123 Main St'
};

const result = await register(registerData);
console.log(result.user); // User object with id, username, email, etc.
```

### Products

```javascript
// Fetch and display products
const allProducts = await fetchProducts();
const meatProducts = await fetchProducts('', 'meats');
const searchResults = await fetchProducts('chicken');

displayProducts(searchResults);
```

### Orders

```javascript
// Create order
const orderData = {
  payment_method: 'gcash',
  shipping_address: '123 Main St, Naval',
  delivery_method: 'delivery',
  items: [
    { product_id: 1, quantity: 2 },
    { product_id: 3, quantity: 1 }
  ]
};

const order = await apiCall(API_ENDPOINTS.CREATE_ORDER, {
  method: 'POST',
  body: JSON.stringify(orderData)
});

console.log(order.id); // Order ID: ORD-20251116-ABC12345
console.log(order.total); // Total amount
```

### Messages

```javascript
// Send message
const messageData = {
  text: 'I have a question about my order'
};

const message = await apiCall(API_ENDPOINTS.CREATE_MESSAGE, {
  method: 'POST',
  body: JSON.stringify(messageData)
});

console.log(message.id); // Message ID
```

## CORS & Deployment Notes

- Ensure backend has frontend URL in `CORS_ALLOWED` environment variable
- Example: `CORS_ALLOWED=http://localhost:5500,http://localhost:5173`
- In production, update to your actual frontend domain

## Next Steps

1. Update all HTML files to use new `frontend/pages/` structure
2. Move CSS files to `frontend/css/`
3. Move JS files to `frontend/js/`
4. Update all `<link>` and `<script>` references
5. Import and use `config.js` in all pages
6. Test API integration in development
7. Deploy backend and frontend to production

---

For more details, see backend `README.md` at `/backend/README.md`
