# Frontend HTTPS Configuration Guide

## Overview
This guide explains how to update the frontend to use HTTPS URLs for API calls in production.

## Current Configuration (Development)

In development, the frontend uses HTTP:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5500`

## Production Configuration

For production, you must use HTTPS:
- Backend API: `https://your-domain.com`
- Frontend: `https://your-domain.com`

---

## Files to Update

### 1. Frontend API Base URL Configuration

#### File: `frontend/js/auth.js`
Look for `API_BASE`:
```javascript
// BEFORE (Development)
const API_BASE = 'http://localhost:8000';

// AFTER (Production)
const API_BASE = 'https://your-domain.com';
```

#### File: `frontend/js/script.js`
Look for the fetch endpoint:
```javascript
// BEFORE (Development)
const endpoint = 'http://localhost:8000/api/products/';

// AFTER (Production)
const endpoint = 'https://your-domain.com/api/products/';
```

#### File: `frontend/js/checkout.js`
Look for `API_BASE`:
```javascript
// BEFORE (Development)
const API_BASE = 'http://localhost:8000';

// AFTER (Production)
const API_BASE = 'https://your-domain.com';
```

#### File: `frontend/js/cart.js`
Look for the API endpoint:
```javascript
// BEFORE (Development)
const endpoint = 'http://localhost:8000/api/products/';

// AFTER (Production)
const endpoint = 'https://your-domain.com/api/products/';
```

---

## Implementation Options

### Option 1: Build-Time Environment Variables (Recommended)

Use a build tool to inject the correct API URL at build time.

**For Vite (if migrating to Vite):**

Create `frontend/.env.production`:
```env
VITE_API_BASE=https://your-domain.com
```

Use in code:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
```

**For Webpack:**
```javascript
const API_BASE = process.env.API_BASE || 'http://localhost:8000';
```

### Option 2: Runtime Configuration (Current Setup)

Create a config file that loads at runtime:

**File: `frontend/js/config.js`**
```javascript
// Detect environment and set API URL accordingly
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE = isDevelopment 
  ? 'http://localhost:8000'
  : 'https://' + window.location.hostname;

// Export for use in other scripts
window.API_CONFIG = { API_BASE };
```

Then update all scripts to use:
```javascript
const API_BASE = window.API_CONFIG?.API_BASE || 'http://localhost:8000';
```

### Option 3: Server-Side Template Variable (Django)

Serve the frontend through Django and inject the API URL:

**In Django settings.py:**
```python
CONTEXT = {
    'API_BASE': config('API_BASE', default='http://localhost:8000')
}
```

**In HTML:**
```html
<script>
    window.API_BASE = "{{ api_base }}";
</script>
```

---

## Quick Migration Steps

### Step 1: Identify All API URLs
Search for `http://localhost:8000` in all frontend files:

```bash
cd frontend
grep -r "localhost:8000" .
```

This will show all locations that need updating.

### Step 2: Choose Implementation Option

- **Option 1 (Vite)**: Best if migrating to modern build tools
- **Option 2 (Runtime Config)**: Best for current setup, minimal changes
- **Option 3 (Django)**: Best if serving frontend from Django

### Step 3: Update Files

#### If using Option 2 (Runtime Config):

1. Create `frontend/js/config.js`:
```javascript
// API Configuration
// Automatically detects environment and sets correct API base URL

const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const getApiBase = () => {
  if (isDevelopment) {
    return 'http://localhost:8000';
  }
  // Production: use same domain as frontend
  const protocol = window.location.protocol; // https: or http:
  const host = window.location.host; // domain.com or domain.com:port
  return `${protocol}//${host}`;
};

const API_BASE = getApiBase();

// Export configuration
window.API_CONFIG = {
  API_BASE,
  isDevelopment
};

console.log(`🔗 API Base: ${API_BASE} (${isDevelopment ? 'Development' : 'Production'})`);
```

2. Add to HTML head (all pages):
```html
<script src="./js/config.js"></script>
```

3. Update all JS files to use:
```javascript
// Load configuration
const API_BASE = window.API_CONFIG?.API_BASE || 'http://localhost:8000';
```

### Step 4: Test Locally

Test with your production domain locally:

```bash
# Update /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1  your-domain.com

# Then access: http://your-domain.com:5500
```

Verify API calls are being made to the correct URL in browser DevTools (F12 → Network tab).

### Step 5: Test in Staging

Deploy to staging environment and verify:
```
Frontend: https://staging.your-domain.com
Backend: https://api-staging.your-domain.com (if separate)
```

---

## CORS Configuration for HTTPS

**In backend settings.py:**

```python
# Ensure CORS allows your production frontend
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED',
    default='https://your-domain.com,https://www.your-domain.com'
).split(',')

# Allow credentials (JWT tokens)
CORS_ALLOW_CREDENTIALS = True
```

---

## SSL/TLS Certificate Setup

Before going to production, ensure:

1. **Obtain SSL Certificate:**
   - Use Let's Encrypt (free and auto-renewable)
   - Or use commercial provider (DigiCert, GlobalSign, etc.)

2. **Configure Web Server:**
   - Nginx example:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com www.your-domain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       # Redirect HTTP to HTTPS
       if ($scheme != "https") {
           return 301 https://$server_name$request_uri;
       }
   }
   ```

3. **Test Certificate:**
   ```bash
   curl -I https://your-domain.com/
   # Should show SSL certificate info
   ```

---

## Verification Checklist

- [ ] All `API_BASE` references updated in backend code
- [ ] Frontend config file created (if using Option 2)
- [ ] All HTML files include config script
- [ ] API calls tested in browser DevTools
- [ ] CORS configured for production domain
- [ ] SSL certificate obtained and installed
- [ ] HTTPS redirect configured
- [ ] SECURE_SSL_REDIRECT = True in settings
- [ ] All asset URLs use HTTPS (no mixed content warnings)
- [ ] Browser DevTools shows no SSL/security warnings

---

## Testing Mixed Content

Open browser DevTools (F12) → Console and look for warnings like:
```
Mixed Content: The page at 'https://example.com/' was loaded over HTTPS, 
but requested an insecure resource 'http://example.com/api/...'.
```

If you see these, ensure all API URLs use HTTPS.

---

## Troubleshooting

### Issue: "API calls fail with HTTPS"
**Solution:** Verify SSL certificate is valid:
```bash
curl -v https://your-domain.com/api/products/
```

### Issue: "CORS errors even with correct domain"
**Solution:** Ensure backend CORS_ALLOWED includes the exact frontend URL with protocol:
```env
CORS_ALLOWED=https://your-domain.com,https://www.your-domain.com
```

### Issue: "Mixed content warnings"
**Solution:** Update all API URLs to use HTTPS (no http://)

### Issue: "Certificate not trusted"
**Solution:** 
- Verify certificate is properly installed
- Check certificate hasn't expired: `openssl s_client -connect your-domain.com:443`
- Use Let's Encrypt with auto-renewal

---

## References

- [Django HTTPS Configuration](https://docs.djangoproject.com/en/4.2/topics/security/#ssl-https)
- [Let's Encrypt](https://letsencrypt.org/)
- [MDN Mixed Content Guide](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated:** November 24, 2025  
**Status:** Ready for HTTPS Configuration
