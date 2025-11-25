# Frontend Project Organization Guide

## Overview

The frontend has been reorganized into a clean, modular structure for better maintainability and scalability.

## New Directory Structure

```
frontend/
├── index.html                                    # Home page (root)
├── css/
│   ├── styles.css                               # Global base styles
│   ├── homepage-styles.css                      # Home page specific
│   ├── cart-styles.css                          # Shopping cart styles
│   ├── checkout-styles.css                      # Checkout styles
│   ├── login-styles.css                         # Auth pages styles
│   ├── profile-styles.css                       # User profile styles
│   └── settings-styles.css                      # Settings page styles
├── js/
│   ├── config.js                                # API configuration & TokenManager
│   ├── constants.js                             # App constants & enums
│   ├── auth.js                                  # Authentication logic
│   ├── script.js                                # Main app & products logic
│   ├── cart.js                                  # Cart management
│   ├── checkout.js                              # Order creation & checkout
│   ├── profile.js                               # User profile & orders
│   └── settings.js                              # Account settings
├── pages/
│   ├── products.html                            # Products page
│   ├── cart.html                                # Shopping cart
│   ├── checkout.html                            # Checkout
│   ├── login.html                               # Login page
│   ├── signup.html                              # Registration page
│   ├── profile.html                             # User profile
│   ├── settings.html                            # Account settings
│   ├── terms.html                               # Terms of use
│   └── privacy.html                             # Privacy policy
├── components/
│   ├── header.html                              # Reusable header component
│   ├── footer.html                              # Reusable footer component
│   └── include.js                               # Component loader (dynamic include)
├── images/
│   ├── logo.png                                 # App logo
│   ├── poster.png                               # Marketing poster
│   └── placeholder.png                          # Fallback image
└── docs/
    ├── API_INTEGRATION.md                       # API integration guide
    ├── FRONTEND_README.md                       # Frontend setup
    └── DEPLOYMENT.md                            # Frontend deployment
```

## File Organization Rules

### 1. HTML Pages (`pages/`)
- Keep all HTML files in `pages/` directory
- Keep `index.html` at root (home page entry point)
- Use relative paths for links: `pages/products.html`

### 2. CSS Files (`css/`)
- Organize by functionality or page
- Use global `styles.css` for common/reset styles
- Create page-specific CSS files for detailed styling
- Link from HTML: `<link rel="stylesheet" href="css/styles.css">`

### 3. JavaScript Files (`js/`)
- `config.js` - API endpoints, token management, utility functions
- `constants.js` - Enums, magic strings, configuration values
- `auth.js` - Login, register, logout, user authentication
- `script.js` - Product listing, filtering, main app initialization
- `cart.js` - Add to cart, remove from cart, update quantities
- `checkout.js` - Order creation, payment, delivery method
- `profile.js` - User orders, account info, order history
- `settings.js` - Update profile, change password, preferences
- Link from HTML: `<script src="js/config.js"></script>`

### 4. Components (`components/`)
- `header.html` - Navigation, logo, search, cart icon
- `footer.html` - Company info, social links, contact
- `include.js` - Dynamically load components into pages
- Use: `<div data-include="header"></div>`

### 5. Images (`images/`)
- Store all image assets
- Reference: `images/logo.png`

### 6. Documentation (`docs/`)
- `API_INTEGRATION.md` - How to integrate with backend
- `FRONTEND_README.md` - Setup and development guide
- `DEPLOYMENT.md` - Production deployment steps

## HTML Link Updates

### Before (Old Structure)
```html
<link rel="stylesheet" href="styles.css">
<script src="auth.js"></script>
```

### After (New Structure - from pages/)
```html
<link rel="stylesheet" href="../css/styles.css">
<link rel="stylesheet" href="../css/homepage-styles.css">
<script src="../js/config.js"></script>
<script src="../js/auth.js"></script>
```

### From index.html (root)
```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/config.js"></script>
```

## Example: Product Listing Page

**File:** `frontend/pages/products.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Altruria</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/homepage-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Header component loaded dynamically -->
    <div data-include="header"></div>

    <main class="products-page">
        <!-- Products content -->
        <div class="product-grid">
            <!-- Products loaded here via JS -->
        </div>
    </main>

    <!-- Footer component loaded dynamically -->
    <div data-include="footer"></div>

    <!-- Scripts -->
    <script src="../js/config.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/script.js"></script>
    <script src="../components/include.js"></script>
</body>
</html>
```

## Local Development Setup

### 1. Serve Frontend Files

Use a local server (important for testing):

```bash
# From frontend/ directory
python -m http.server 5500

# Or using Node.js http-server
npx http-server -p 5500
```

Access at: `http://localhost:5500`

### 2. Connect to Backend

Ensure backend is running on `http://localhost:8000`:

```bash
cd backend
python manage.py runserver
```

### 3. Test API Connection

Check browser console for any CORS errors. Verify `CORS_ALLOWED` in backend `.env` includes:
```
CORS_ALLOWED=http://localhost:5500
```

## Path Reference Guide

### From `index.html` (root)
- CSS: `css/styles.css`
- JS: `js/config.js`
- Pages: `pages/products.html`
- Images: `images/logo.png`
- Components: `components/header.html`

### From `pages/products.html`
- CSS: `../css/styles.css`
- JS: `../js/config.js`
- Images: `../images/logo.png`
- Components: `../components/header.html`

### From `pages/subfolder/page.html` (if nested deeper)
- CSS: `../../css/styles.css`
- JS: `../../js/config.js`
- Parent pages: `../other.html`

## Deployment Structure

When deploying to production, ensure this structure:

```
/var/www/altruria/frontend/
├── index.html
├── css/
├── js/
├── pages/
├── components/
├── images/
└── docs/
```

Web server root points to `frontend/` directory.

## Nginx Example (Production)

```nginx
server {
    listen 80;
    server_name altruria.com;

    root /var/www/altruria/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000/api/;
    }

    # Media files
    location /media/ {
        proxy_pass http://localhost:8000/media/;
    }
}
```

## Best Practices

1. ✅ Keep CSS organized by page/component
2. ✅ Use semantic HTML5 elements
3. ✅ Minimize JavaScript in HTML (use external files)
4. ✅ Use data attributes for API identifiers: `data-product-id="123"`
5. ✅ Centralize configuration in `config.js`
6. ✅ Use async/await for API calls
7. ✅ Handle token expiration gracefully
8. ✅ Validate user input before sending to API
9. ✅ Show loading states during API calls
10. ✅ Implement error boundaries and fallbacks

## Maintenance Checklist

- [ ] Update API endpoints in `js/config.js` for production
- [ ] Set `API_BASE_URL` to production backend
- [ ] Test all pages with new backend
- [ ] Verify CORS settings in backend `.env`
- [ ] Check all relative paths work correctly
- [ ] Test responsive design on mobile
- [ ] Verify component loading (header/footer)
- [ ] Check token refresh logic
- [ ] Test error handling
- [ ] Minify CSS/JS for production

---

For detailed API integration, see `docs/API_INTEGRATION.md`
