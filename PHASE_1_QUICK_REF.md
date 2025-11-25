# Phase 1 Quick Reference Card

## 🚀 TL;DR - What to Do Right Now

### Step 1: Generate Secret Key (2 min)
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output.

### Step 2: Create .env File (5 min)
```bash
cd backend
cp .env.example .env
```

### Step 3: Edit .env with Production Values (10 min)
```env
SECRET_KEY=paste-your-generated-secret-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DB_NAME=production-db-name
DB_USER=production-user
DB_PASSWORD=your-strong-password
DB_HOST=production-db-host
CORS_ALLOWED=https://your-domain.com,https://www.your-domain.com
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=your-strong-password
```

### Step 4: Protect .env (1 min)
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
git status  # Verify .env is not listed
```

### Step 5: Test It Works (5 min)
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate.ps1
python manage.py shell
>>> from django.conf import settings
>>> print(f"DEBUG: {settings.DEBUG}")
>>> print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
>>> exit()
```

---

## 📋 Phase 1 Configuration Checklist

### Backend Settings
- [x] `SECRET_KEY` - Configurable via environment
- [x] `DEBUG` - Configurable via environment
- [x] `ALLOWED_HOSTS` - Configurable via environment
- [x] `CORS_ALLOWED_ORIGINS` - Configurable via environment
- [x] `SECURE_SSL_REDIRECT` - Enabled when DEBUG=False
- [x] `SESSION_COOKIE_SECURE` - Enabled when DEBUG=False
- [x] `CSRF_COOKIE_SECURE` - Enabled when DEBUG=False
- [x] Rate Limiting - 100/hour anonymous, 1000/hour authenticated
- [x] JWT Tokens - 15 min access, 7 day refresh, auto-rotate

### Environment Variables
- [ ] `SECRET_KEY` - Replace with generated value
- [ ] `DEBUG` - Set to False
- [ ] `ALLOWED_HOSTS` - Set to your domain(s)
- [ ] `DB_*` - Set to production database
- [ ] `CORS_ALLOWED` - Set to HTTPS frontend domain
- [ ] `ADMIN_EMAIL` - Change from default
- [ ] `ADMIN_PASSWORD` - Change from default

### File Security
- [ ] `.env` created in `backend/`
- [ ] `.env` added to `.gitignore`
- [ ] `.env` NOT committed to git
- [ ] `.env` backed up securely

---

## 🔐 Security Hardening Summary

| Setting | Before | After | Why |
|---------|--------|-------|-----|
| SECRET_KEY | Hardcoded | Environment | Secret not in code |
| DEBUG | Hardcoded true | Environment | Easy to toggle |
| HTTPS | Manual | Auto-enforced | Secure by default |
| Rate Limit | None | 100/hr anon | Prevent abuse |
| CORS | Open | Restricted | Only your domain |
| Cookies | HTTP | HTTPS only | Session security |

---

## ⚠️ Critical Reminders

### 🔴 DO NOT
- ❌ Commit `.env` to git
- ❌ Share `.env` publicly
- ❌ Use default admin credentials
- ❌ Use insecure database passwords
- ❌ Run with DEBUG=True in production

### ✅ DO
- ✅ Generate strong secret key
- ✅ Use HTTPS in production
- ✅ Keep `.env` secure and backed up
- ✅ Change admin credentials
- ✅ Test with DEBUG=False locally

---

## 🧪 Quick Tests

### Test 1: Load Settings
```bash
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DEBUG)  # Should be False in production
>>> print(settings.ALLOWED_HOSTS)  # Should have your domain
```

### Test 2: Check Security Headers
```bash
curl -I http://localhost:8000/api/products/
# Look for:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

### Test 3: Test Rate Limiting
```bash
# Make 101 requests
for i in {1..101}; do 
  curl -s http://localhost:8000/api/products/ | head -c 100
done

# Request 101 should return 429 Too Many Requests
```

### Test 4: Database Connection
```bash
python manage.py dbshell
# Should connect successfully
# Type: exit
```

---

## 📚 Full Documentation

For complete details, read:
1. **PRODUCTION_ENV_SETUP.md** - Environment setup guide
2. **PRODUCTION_CHECKLIST.md** - Complete checklist for all phases
3. **FRONTEND_HTTPS_SETUP.md** - Frontend HTTPS configuration
4. **PHASE_1_SECURITY_SUMMARY.md** - Detailed Phase 1 summary

---

## 🎯 Success Criteria

Phase 1 is complete when:
- [x] All code changes applied ✅
- [x] Documentation created ✅
- [ ] .env file created (your action)
- [ ] .env values filled in (your action)
- [ ] .env backed up securely (your action)
- [ ] Settings work with DEBUG=False (your action)
- [ ] Rate limiting tested (your action)

---

## 🚀 Next Phase: Static & Media Files

When Phase 1 is complete:
```
→ Phase 2: Static & Media Files
  • collectstatic setup
  • CDN configuration (optional)
  • Media file storage
```

**Status:** ⏳ Waiting for Phase 1 completion

---

**Ready? Start with generating your secret key!**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Then create `.env` and fill in the values. Let me know when Phase 1 is done! ✅
