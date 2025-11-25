// ============================================
// App Constants & Configuration
// ============================================

// Product Categories
const PRODUCT_CATEGORIES = {
  MEATS: 'meats',
  VEGETABLES: 'vegetables',
};

const CATEGORY_DISPLAY = {
  meats: 'Meats',
  vegetables: 'Vegetables',
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const STATUS_DISPLAY = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending: '#ffa500',    // Orange
  paid: '#4CAF50',       // Green
  shipped: '#2196F3',    // Blue
  completed: '#4CAF50',  // Green
  cancelled: '#f44336',  // Red
};

// Payment Methods
const PAYMENT_METHODS = {
  GCASH: 'gcash',
  BANK: 'bank',
  COD: 'cod',
};

const PAYMENT_DISPLAY = {
  gcash: 'GCash',
  bank: 'Bank Transfer',
  cod: 'Cash on Delivery',
};

// Delivery Methods
const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
};

const DELIVERY_DISPLAY = {
  pickup: 'Pick Up',
  delivery: 'Delivery',
};

// Message Sender
const MESSAGE_SENDER = {
  USER: 'user',
  ADMIN: 'admin',
};

// Cart Settings
const CART_SETTINGS = {
  STORAGE_KEY: 'altruria_cart',
  MAX_QUANTITY: 100,
  SHIPPING_FEE: 80.00,
};

// Validation Rules
const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[0-9]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Error Messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters.`,
  EMPTY_CART: 'Your cart is empty. Please add items before checkout.',
  LOGIN_REQUIRED: 'Please log in to continue.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTER_SUCCESS: 'Account created successfully! Please log in.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ORDER_CREATED: 'Order created successfully!',
  MESSAGE_SENT: 'Message sent successfully.',
  ITEM_ADDED_TO_CART: 'Item added to cart.',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart.',
};

// Pagination
const PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGES_DISPLAYED: 5,
};

// Export as global constants
window.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
window.CATEGORY_DISPLAY = CATEGORY_DISPLAY;
window.ORDER_STATUS = ORDER_STATUS;
window.STATUS_DISPLAY = STATUS_DISPLAY;
window.STATUS_COLORS = STATUS_COLORS;
window.PAYMENT_METHODS = PAYMENT_METHODS;
window.PAYMENT_DISPLAY = PAYMENT_DISPLAY;
window.DELIVERY_METHODS = DELIVERY_METHODS;
window.DELIVERY_DISPLAY = DELIVERY_DISPLAY;
window.MESSAGE_SENDER = MESSAGE_SENDER;
window.CART_SETTINGS = CART_SETTINGS;
window.VALIDATION_RULES = VALIDATION_RULES;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
window.PAGINATION = PAGINATION;
