// ============================================
// API Configuration & Token Management
// ============================================

// API Base URL - supports runtime override for demo/production
// Priority: 1) window.__API_BASE_URL__  2) window.__API_BASE__ 3) default dev localhost
const API_BASE_URL = (function(){
  // Allow a hosting environment to inject a small runtime override by setting
  // window.__API_BASE__ (backend origin) or window.__API_BASE_URL__ (full API path)
  try {
    if (window && window.__API_BASE_URL__) return window.__API_BASE_URL__;
    if (window && window.__API_BASE__) {
      return window.__API_BASE__.endsWith('/api') ? window.__API_BASE__ : `${window.__API_BASE__}/api`;
    }
  } catch (e) {}

  // Default developer value
  return 'http://localhost:8000/api';
})();

// Keep both forms available. API_BASE is the backend origin (no trailing /api)
const API_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

// API Endpoints
const API_ENDPOINTS = {
  // Auth Endpoints
  REGISTER: `${API_BASE_URL}/auth/register/`,
  LOGIN: `${API_BASE_URL}/token/`,
  REFRESH_TOKEN: `${API_BASE_URL}/token/refresh/`,
  GET_ME: `${API_BASE_URL}/auth/me/`,

  // Product Endpoints
  PRODUCTS: `${API_BASE_URL}/products/`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/products/${id}/`,
  PRODUCT_CREATE: `${API_BASE_URL}/products/`,
  PRODUCT_UPDATE: (id) => `${API_BASE_URL}/products/${id}/`,
  PRODUCT_DELETE: (id) => `${API_BASE_URL}/products/${id}/`,

  // Order Endpoints
  CREATE_ORDER: `${API_BASE_URL}/orders/`,
  USER_ORDERS: (userId) => `${API_BASE_URL}/orders/user/${userId}/`,
  ORDER_DETAIL: (orderId) => `${API_BASE_URL}/orders/${orderId}/`,
  UPDATE_ORDER_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status/`,

  // Message Endpoints
  CREATE_MESSAGE: `${API_BASE_URL}/messages/`,
  USER_MESSAGES: (userId) => `${API_BASE_URL}/messages/user/${userId}/`,
  ADMIN_MESSAGES: `${API_BASE_URL}/messages/admin/`,
  MARK_MESSAGE_READ: `${API_BASE_URL}/messages/admin/`,
};

/**
 * TokenManager - Handle JWT tokens with auto-refresh
 */
class TokenManager {
  /**
   * Store tokens in localStorage
   */
  static setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenTimestamp', Date.now());
  }

  /**
   * Get access token
   */
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token
   */
  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Check if tokens exist
   */
  static hasTokens() {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  /**
   * Check if access token is expired (approximately)
   */
  static isTokenExpired() {
    const timestamp = localStorage.getItem('tokenTimestamp');
    if (!timestamp) return true;

    // Assume 15-minute expiry, refresh after 10 minutes
    const elapsed = Date.now() - parseInt(timestamp);
    const TEN_MINUTES = 10 * 60 * 1000;
    return elapsed > TEN_MINUTES;
  }

  /**
   * Clear tokens from storage
   */
  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenTimestamp');
  }

  /**
   * Refresh access token using refresh token
   */
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

      // Refresh failed, clear tokens
      if (response.status === 401) {
        this.clearTokens();
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

/**
 * API Helper - Make authenticated API calls with auto-retry
 */
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
      console.log('Token expired, attempting refresh...');
      const refreshed = await TokenManager.refreshAccessToken();

      if (refreshed) {
        // Retry the request with new token
        finalOptions.headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
        response = await fetch(endpoint, finalOptions);
      } else {
        // Refresh failed, redirect to login
        TokenManager.clearTokens();
        window.location.href = '../pages/login.html';
        return null;
      }
    }

    // Check for errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorData.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', endpoint, error);
    throw error;
  }
}

/**
 * Display error message to user
 */
function showError(message, duration = 5000) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #ff6b6b;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), duration);
}

/**
 * Display success message to user
 */
function showSuccess(message, duration = 3000) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-toast';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #51cf66;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), duration);
}

// Export for use in other scripts
window.API_BASE_URL = API_BASE_URL;
window.API_BASE = API_BASE;
window.API_ENDPOINTS = API_ENDPOINTS;
window.TokenManager = TokenManager;
window.apiCall = apiCall;
window.showError = showError;
window.showSuccess = showSuccess;
