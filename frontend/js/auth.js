// Minimal auth and utility helpers used by the static frontend

// Manage current user in localStorage
function setCurrentUser(user) {
  localStorage.setItem('altruria_current_user', JSON.stringify(user));
  try { updateCartCount(); } catch(e) {}
}

function getCurrentUser() {
  const raw = localStorage.getItem('altruria_current_user');
  return raw ? JSON.parse(raw) : null;
}

// Simple users store for demo (not secure). Used by signup/login demo pages.
function _getUsers() {
  const raw = localStorage.getItem('altruria_users');
  return raw ? JSON.parse(raw) : [];
}

function _saveUsers(users) {
  localStorage.setItem('altruria_users', JSON.stringify(users));
}

function createUser({firstName, lastName, email, mobile, address}) {
  const users = _getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('Account with that email already exists.');
  }
  const user = {
    id: 'u_' + Date.now(),
    firstName, lastName, email, mobile, address, createdAt: Date.now()
  };
  users.push(user);
  _saveUsers(users);
  return user;
}

function findUserByEmail(email) {
  const users = _getUsers();
  return users.find(u => u.email === email) || null;
}

// Shopping cart helpers
function _getCart() {
  try {
    const raw = localStorage.getItem('altruria_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function updateCartCount() {
  const cart = _getCart();
  const count = cart.reduce((s, it) => s + (it.quantity || 1), 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function addToCart(productId, qty = 1) {
  const cart = _getCart();
  const idx = cart.findIndex(i => i.productId === productId);
  if (idx > -1) cart[idx].quantity += qty; else cart.push({productId, quantity: qty});
  localStorage.setItem('altruria_cart', JSON.stringify(cart));
  updateCartCount();
}

// Expose globally
window.setCurrentUser = setCurrentUser;
window.getCurrentUser = getCurrentUser;
window.createUser = createUser;
window.findUserByEmail = findUserByEmail;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;

// Initialize cart count on load
document.addEventListener('DOMContentLoaded', updateCartCount);
