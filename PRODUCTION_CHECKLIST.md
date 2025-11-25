# Production Deployment Checklist

## 📋 Overview
This document provides a step-by-step checklist to prepare Altruria for production hosting. Follow each section carefully.

---

## ✅ PHASE 1: Security & Settings (In Progress)

### 1.1 SECRET_KEY Management
- [x] Update backend/settings.py to load SECRET_KEY from environment (done)
- [ ] Generate a strong secret key for production
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] Store the generated key in `.env` (NEVER commit to git)
- [ ] Add `.env` to `.gitignore`

### 1.2 DEBUG Mode
- [x] DEBUG is already configurable via environment (done)
- [ ] Set `DEBUG=False` in production `.env`
- [ ] Test with DEBUG=False locally to catch issues early

### 1.3 ALLOWED_HOSTS
- [x] ALLOWED_HOSTS is configurable via environment (done)
- [ ] Determine your production domain(s)
- [ ] Update `.env` with production domain(s)
  Example: `ALLOWED_HOSTS=example.com,www.example.com`

### 1.4 CORS Configuration
- [x] CORS_ALLOWED_ORIGINS is configurable (done)
- [ ] Update `.env` with production frontend domain(s)
  Example: `CORS_ALLOWED=https://example.com,https://www.example.com`
- [ ] Remove localhost/127.0.0.1 from production environment
- [ ] Verify CORS_ALLOW_CREDENTIALS = True (for JWT cookies if used)

### 1.5 JWT / Authentication
- [x] ACCESS_TOKEN_LIFETIME set to 15 minutes (reasonable)
- [x] REFRESH_TOKEN_LIFETIME set to 7 days (reasonable)
- [x] ROTATE_REFRESH_TOKENS enabled (security best practice)
- [x] BLACKLIST_AFTER_ROTATION enabled (security best practice)
- [ ] Test token refresh flow in production environment
- [ ] Consider implementing token blacklist for explicit logout (see notes below)

### 1.6 Additional Security Settings (To Add)
- [ ] Add `SECURE_SSL_REDIRECT = True` (force HTTPS in production)
- [ ] Add `SECURE_HSTS_SECONDS = 31536000` (HSTS header for 1 year)
- [ ] Add `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- [ ] Add `SECURE_HSTS_PRELOAD = True`
- [ ] Add `SESSION_COOKIE_SECURE = True` (HTTPS only)
- [ ] Add `CSRF_COOKIE_SECURE = True` (HTTPS only)
- [ ] Add `SESSION_COOKIE_HTTPONLY = True`
- [ ] Add `CSRF_COOKIE_HTTPONLY = True`
- [ ] Add `X_FRAME_OPTIONS = 'DENY'` (already in middleware)

### 1.7 HTTP Security Headers
- [x] SecurityMiddleware already in place (done)
- [ ] Verify headers in production response:
  ```bash
  curl -I https://example.com/
  # Should include X-Frame-Options, X-Content-Type-Options, etc.
  ```

### 1.8 Environment Variables File
- [ ] Create a `.env` file (copy from `.env.example`)
- [ ] Update all values for production:
  - SECRET_KEY (generated random key)
  - DEBUG=False
  - ALLOWED_HOSTS (your domain)
  - DB_NAME, DB_USER, DB_PASSWORD, DB_HOST (production database)
  - CORS_ALLOWED (your frontend domain)
- [ ] Add `.env` to `.gitignore` if not already
- [ ] NEVER commit `.env` to git

---

## 📦 PHASE 2: Static & Media Files

### 2.1 Static Files Setup
- [ ] Update settings for collectstatic
- [ ] Set up nginx/CDN for static file serving
- [ ] Run `python manage.py collectstatic` pre-deployment
- [ ] Test static file serving

### 2.2 Media Files Storage
- [ ] Decide on storage backend (local, S3, etc.)
- [ ] Set proper file permissions (local) or bucket policies (S3)
- [ ] Test file uploads

---

## 💾 PHASE 3: Database & Migrations

### 3.1 Database Setup
- [ ] Provision managed MySQL (RDS, Cloud SQL, etc.)
- [ ] Create production database and user
- [ ] Test database connection
- [ ] Document connection details

### 3.2 Migrations
- [ ] Run `python manage.py migrate` in production
- [ ] Verify all migrations applied successfully
- [ ] Test database schema

### 3.3 Initial Data
- [ ] Decide: seed initial data or manual entry?
- [ ] If seeding, test with production database

---

## 🔒 PHASE 4: TLS / HTTPS

### 4.1 SSL Certificate
- [ ] Obtain SSL certificate (Let's Encrypt recommended)
- [ ] Install certificate on web server
- [ ] Configure automatic renewal

### 4.2 Frontend API URLs
- [ ] Update frontend to use `https://` instead of `http://`
- [ ] Update all API_BASE URLs in frontend JS
- [ ] Test API calls over HTTPS

### 4.3 HTTPS Enforcement
- [ ] Configure web server to redirect HTTP → HTTPS
- [ ] Enable HSTS headers (set in settings.py)
- [ ] Test HTTPS-only enforcement

---

## ⚙️ PHASE 5: Process Management

### 5.1 Gunicorn Setup
- [ ] Install gunicorn (already in requirements.txt)
- [ ] Create gunicorn configuration
- [ ] Test gunicorn startup
- [ ] Set up process manager (systemd, supervisor, or Docker)

### 5.2 Nginx Reverse Proxy
- [ ] Install and configure nginx
- [ ] Set up reverse proxy to gunicorn
- [ ] Configure SSL termination
- [ ] Test request flow

### 5.3 Process Auto-Restart
- [ ] Set up systemd service or supervisor
- [ ] Enable auto-start on server reboot
- [ ] Test restart behavior

---

## 🔐 PHASE 6: Secrets & Configuration

### 6.1 Environment Variables
- [ ] Move all secrets to `.env` (not in code)
- [ ] Use environment-specific `.env` files or secrets manager
- [ ] Document all required environment variables

### 6.2 Secrets Manager (Optional)
- [ ] Consider AWS Secrets Manager, HashiCorp Vault, or similar
- [ ] Store sensitive data securely
- [ ] Document access patterns

---

## 📊 PHASE 7: Logging & Monitoring

### 7.1 Application Logging
- [ ] Configure Django logging to file/service
- [ ] Set up log rotation
- [ ] Monitor error logs

### 7.2 Monitoring Services
- [ ] Set up Sentry for error tracking (optional)
- [ ] Configure Prometheus/Grafana for metrics (optional)
- [ ] Set up CloudWatch or equivalent logging

### 7.3 Health Checks
- [ ] Add health check endpoint (`/health/`)
- [ ] Monitor endpoint availability
- [ ] Set up alerts

---

## 💾 PHASE 8: Backups & Maintenance

### 8.1 Database Backups
- [ ] Configure automated database backups
- [ ] Test backup restoration
- [ ] Document backup schedule and location

### 8.2 Media File Backups
- [ ] Set up backup for uploaded media
- [ ] Test restoration

### 8.3 Maintenance Windows
- [ ] Plan maintenance schedule
- [ ] Document downtime notifications

---

## ✉️ PHASE 9: Email Sending

### 9.1 Email Provider
- [ ] Choose email provider (SendGrid, Mailgun, AWS SES)
- [ ] Set up transactional email account
- [ ] Add credentials to environment variables

### 9.2 Email Configuration
- [ ] Update settings.py EMAIL_* variables
- [ ] Test email sending (password reset, etc.)
- [ ] Verify deliverability

---

## 🛡️ PHASE 10: Rate Limiting & Abuse Protection

### 10.1 DRF Throttling
- [ ] Add throttling configuration to REST_FRAMEWORK settings
- [ ] Implement per-endpoint rate limits
- [ ] Test rate limiting behavior

### 10.2 Login Attempt Limits
- [ ] Limit failed login attempts
- [ ] Implement temporary account lockout
- [ ] Send security alerts

### 10.3 DDOS Protection
- [ ] Consider CDN with DDOS protection (Cloudflare, etc.)
- [ ] Set up rate limits at reverse proxy level
- [ ] Document abuse response procedures

---

## 🧪 PHASE 11: Testing & QA

### 11.1 End-to-End Testing
- [ ] Test user registration flow
- [ ] Test login and token generation
- [ ] Test token refresh and expiry
- [ ] Test profile update
- [ ] Test product browsing and filtering
- [ ] Test shopping cart add/remove
- [ ] Test checkout flow
- [ ] Test order creation and retrieval
- [ ] Test admin panel functions

### 11.2 Performance Testing
- [ ] Load test with concurrent users
- [ ] Monitor response times
- [ ] Identify bottlenecks
- [ ] Optimize as needed

### 11.3 Security Testing
- [ ] SQL injection testing
- [ ] CSRF protection testing
- [ ] XSS prevention testing
- [ ] Authentication testing
- [ ] Authorization testing

### 11.4 Cross-Browser Testing
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile browsers
- [ ] Verify responsive design

---

## 📋 PHASE 12: Compliance & Privacy

### 12.1 Privacy Policy
- [ ] Create privacy policy document
- [ ] Host at `/privacy-policy/`
- [ ] Include data collection, usage, retention info

### 12.2 Terms of Service
- [ ] Create terms of service document
- [ ] Host at `/terms-of-service/`
- [ ] Review legal requirements

### 12.3 Data Handling
- [ ] Implement secure data transmission (HTTPS)
- [ ] Encrypt sensitive data at rest (passwords with Django hasher)
- [ ] Document data retention policies
- [ ] Implement data deletion on request (GDPR)

### 12.4 Cookie Policy
- [ ] Document cookie usage
- [ ] Implement cookie consent if required
- [ ] Update privacy policy with cookie info

---

## 🚀 DEPLOYMENT STEPS

### Pre-Deployment
1. [ ] Complete all checklist items
2. [ ] Test thoroughly in staging environment
3. [ ] Create backup of current production (if upgrading)
4. [ ] Have rollback plan ready

### Deployment
1. [ ] Pull latest code
2. [ ] Create/update `.env` with production values
3. [ ] Run migrations: `python manage.py migrate`
4. [ ] Collect static files: `python manage.py collectstatic --noinput`
5. [ ] Restart application server
6. [ ] Verify all endpoints working

### Post-Deployment
1. [ ] Test critical user flows
2. [ ] Monitor logs for errors
3. [ ] Verify monitoring/alerts working
4. [ ] Notify users of any changes
5. [ ] Document any issues found

---

## 📞 Support & References

- Django Security Docs: https://docs.djangoproject.com/en/4.2/topics/security/
- DRF Throttling: https://www.django-rest-framework.org/api-guide/throttling/
- Let's Encrypt: https://letsencrypt.org/
- Gunicorn Docs: https://docs.gunicorn.org/
- Nginx Docs: https://nginx.org/en/docs/

---

## Notes

### JWT Token Blacklist Implementation
If you want explicit logout (beyond relying on token expiry), you can implement token blacklisting:

1. Create a `TokenBlacklist` model to track logged-out tokens
2. Add a logout endpoint that adds current token to blacklist
3. Check blacklist during authentication

This prevents token reuse after logout but adds database overhead.

### Secrets Management Best Practices
- Never commit `.env` to git
- Use a secrets manager for production (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use different secrets for different environments
- Monitor secret access logs

---

**Status:** Preparing for production  
**Last Updated:** November 24, 2025  
**Next Phase:** Implement Phase 1 items and validate
