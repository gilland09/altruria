// Main frontend script: fetch products and render product grid

async function fetchProducts() {
  // Use the API endpoint from config.js (fall back to localhost for dev)
  const endpoint = (window.API_BASE_URL || 'http://localhost:8000/api') + '/products/';

  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  
  // Show skeleton loading state (will be replaced when products load)
  grid.innerHTML = Array.from({length: 6}).map(() => `
    <article class="product-card skeleton-card skeleton" style="height: 100%;">
      <div class="skeleton-img"></div>
      <div class="product-info">
        <div class="skeleton-line long"></div>
        <div class="skeleton-line medium"></div>
        <div style="margin-top:auto"><div class="skeleton-line short"></div></div>
      </div>
    </article>
  `).join('');

  try {
    console.log('📦 Fetching products from:', endpoint);
    
    const res = await fetch(endpoint, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });
    
    if (!res.ok) {
      const errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      console.error('❌ Failed to fetch products:', errorMsg);
      grid.innerHTML = `<p class="error-msg" style="grid-column: 1/-1; color: #d32f2f; padding: 2rem; text-align: center;">Unable to load products. Status: ${res.status}</p>`;
      return;
    }
    
    const json = await res.json();
    console.log('✅ API Response received:', json);
    
    // Handle both array and paginated responses
    const products = Array.isArray(json) ? json : (json.results || json.data || []);
    
    console.log(`📊 Loaded ${products.length} products`);
    
    // Store products globally for cart and filtering
    window._products = products;
    
    // Render category filters
    try { 
      renderCategoryFilters(products); 
    } catch(e) { 
      console.warn('⚠️ Could not render category filters:', e.message);
    }
    
    if (!products.length) {
      grid.innerHTML = '<p class="empty-msg" style="grid-column: 1/-1; padding: 2rem; text-align: center;">No products available.</p>';
      return;
    }
    
    renderProducts(products, grid);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    grid.innerHTML = `<p class="error-msg" style="grid-column: 1/-1; color: #d32f2f; padding: 2rem; text-align: center;">Network error: ${err.message}</p>`;
  }
}

function renderProducts(products, gridEl) {
  const cards = products.map(p => createProductCard(p)).join('');
  gridEl.innerHTML = cards;
  
  console.log('🎨 Rendered', products.length, 'product cards');
  
  // Attach add-to-cart handlers
  gridEl.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-product-id');
      const productId = parseInt(id, 10);
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error('❌ Product not found:', productId);
        showError('Product not found');
        return;
      }
      
      console.log('🛒 Adding product to cart:', product.name, `(ID: ${productId})`);
      
      // Show loading state with animation
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.style.position = 'relative';
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      
      // Simulate brief delay for smooth UX
      setTimeout(() => {
        try {
          addToCart(productId, 1);
          
          // Show success toast with View Cart link
          const cartLink = document.createElement('a');
          cartLink.href = './pages/cart.html';
          cartLink.style.cssText = 'margin-left: 0.8rem; color: white; text-decoration: underline; font-weight: bold; cursor: pointer;';
          cartLink.innerHTML = '<i class="fas fa-shopping-cart"></i> View Cart';
          
          showSuccess(`✅ "${product.name}" added to cart!`, 3000, cartLink);
          
          // Add visual pulse effect
          btn.style.background = '#51cf66';
          btn.style.transform = 'scale(0.98)';
          
          // Reset button after brief highlight
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.background = '';
            btn.style.transform = '';
          }, 600);
        } catch (err) {
          console.error('❌ Error adding to cart:', err);
          showError('Failed to add item to cart');
          btn.innerHTML = originalHTML;
          btn.disabled = false;
        }
      }, 300);
    });
  });
}

// Filter helper for category buttons
function filterProducts(category) {
  const products = window._products || [];
  const filtered = category ? products.filter(p => p.category === category) : products;
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  if (!filtered.length) grid.innerHTML = '<p class="empty-msg">No products match that category.</p>';
  else renderProducts(filtered, grid);
}

function createProductCard(p) {
  // Validate required fields
  if (!p.id || !p.name) {
    console.warn('⚠️ Incomplete product data:', p);
    return '';
  }

  const img = p.image ? p.image : '../images/poster.png';
  const desc = p.description ? escapeHtml(p.description) : 'Quality farm product';
  const stock = p.stock != null ? p.stock : '∞';
  const priceNum = safeNumber(p.price, 0);
  const price = formatCurrency(priceNum).replace('₱', ''); // Remove ₱ since it's added in HTML
  const category = p.category || 'Uncategorized';
  const name = escapeHtml(p.name);

  return `
    <article class="product-card">
      <!-- Image path: from API or fallback to poster.png in /frontend/images/ -->
      <img class="product-image" src="${img}" alt="${name}" onerror="this.src='../images/poster.png'">
      <div class="product-info">
        <h3>${name}</h3>
        <p>${desc}</p>
        <div class="product-price">₱${price}</div>
        <div class="product-meta" style="margin-top: auto; display: flex; gap: 8px; align-items: center; justify-content: space-between;">
          <span class="stock" style="font-size: 0.9rem; color: #666;">Stock: ${stock}</span>
          <button class="add-to-cart-btn" data-product-id="${p.id}"><i class="fas fa-cart-plus"></i> Add</button>
        </div>
      </div>
      <div class="category-badge">${escapeHtml(category)}</div>
    </article>
  `;
}

function renderCategoryFilters(products) {
  const categories = Array.from(new Set((products || []).map(p => p.category || '').filter(Boolean)));
  // Try to find existing container (products page) first
  let container = document.querySelector('.category-filters');
  // If not present, try to insert below featured heading on index
  if (!container) {
    const featured = document.querySelector('.featured-heading');
    if (featured) {
      container = document.createElement('div');
      container.className = 'category-filters';
      featured.insertAdjacentElement('afterend', container);
    }
  }
  if (!container) return;
  // always include "All" button
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'category-btn active';
  allBtn.dataset.category = '';
  allBtn.textContent = 'All Products';
  container.appendChild(allBtn);
  allBtn.addEventListener('click', () => {
    container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    filterProducts('');
  });

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.dataset.category = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.addEventListener('click', () => {
      container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProducts(cat);
    });
    container.appendChild(btn);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// Enhanced toast for success with optional cart link
function showSuccess(msg, duration = 2000, cartLink = null) {
  const el = document.createElement('div');
  el.className = 'success-toast';
  el.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #51cf66, #40c057);
    color: #fff;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    z-index: 9999;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
    animation: slideIn 0.3s ease;
    max-width: 320px;
    word-wrap: break-word;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  `;
  
  el.innerHTML = msg;
  
  if (cartLink) {
    el.appendChild(cartLink);
  }
  
  document.body.appendChild(el);
  
  setTimeout(() => {
    el.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// Enhanced toast for errors
function showError(msg, duration = 3000) {
  const el = document.createElement('div');
  el.className = 'error-toast';
  el.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b, #fa5252);
    color: #fff;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    z-index: 9999;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    animation: slideIn 0.3s ease;
    max-width: 320px;
    word-wrap: break-word;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  `;
  
  el.innerHTML = msg;
  document.body.appendChild(el);
  
  setTimeout(() => {
    el.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initHeaderEffects();
  fetchProducts();
});

function initHeaderEffects() {
  const header = document.querySelector('header');
  if (!header) return;
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        if (y > 40) header.classList.add('header-shrink');
        else header.classList.remove('header-shrink');
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Expose for testing
window.fetchProducts = fetchProducts;
