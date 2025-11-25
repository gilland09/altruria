# Production Environment Setup Guide

## Overview
This guide explains how to configure environment variables for production deployment. Never commit the `.env` file to git.

## Step 1: Generate a Secure Secret Key

Run this command in your Python environment:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Example output:
```
v_zs!m-50%--^p^=k!4r2_zk_w&-j=&v7@*u%i5n5p^_q6xn
```

Copy this value—you'll need it for the `.env` file.

---

## Step 2: Create Production `.env` File

1. **Copy the template:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env` with production values:**

   ```env
   # ============================================
   # SECURITY & DEBUG
   # ============================================
   # IMPORTANT: Use the generated secret key from Step 1
   SECRET_KEY=v_zs!m-50%--^p^=k!4r2_zk_w&-j=&v7@*u%i5n5p^_q6xn
   
   # CRITICAL: Set to False in production
   DEBUG=False
   
   # ============================================
   # HOST CONFIGURATION
   # ============================================
   # Replace with your actual production domain(s)
   # Format: domain1.com,www.domain1.com,subdomain.domain1.com
   ALLOWED_HOSTS=example.com,www.example.com
   
   # ============================================
   # DATABASE CONFIGURATION
   # ============================================
   # Use your production database credentials
   # For managed services (AWS RDS, Google Cloud SQL), use connection string
   DB_NAME=altruria_prod
   DB_USER=altruria_user
   DB_PASSWORD=your-strong-database-password-here
   DB_HOST=your-production-db-host.example.com
   DB_PORT=3306
   
   # ============================================
   # CORS & FRONTEND
   # ============================================
   # Update to match your production frontend domain(s)
   # Must be HTTPS in production
   CORS_ALLOWED=https://example.com,https://www.example.com
   
   # ============================================
   # ADMIN CREDENTIALS
   # ============================================
   # CRITICAL: Change these from defaults!
   # Use strong password for production
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-strong-admin-password-here
   ```

---

## Step 3: Verify `.env` is in `.gitignore`

Ensure `.env` is never committed to git:

```bash
# Check if .env is in .gitignore
grep "^\.env$" backend/.gitignore || echo ".env" >> backend/.gitignore
```

---

## Step 4: Environment-Specific Configurations

### Development (`.env.dev`)
```env
DEBUG=True
SECRET_KEY=dev-secret-not-secure
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED=http://localhost:5500,http://localhost:3000
DB_HOST=127.0.0.1
```

### Staging (`.env.staging`)
```env
DEBUG=False
SECRET_KEY=[use generated key]
ALLOWED_HOSTS=staging.example.com
CORS_ALLOWED=https://staging.example.com
DB_HOST=staging-db.example.com
```

### Production (`.env.prod`)
```env
DEBUG=False
SECRET_KEY=[use generated key]
ALLOWED_HOSTS=example.com,www.example.com
CORS_ALLOWED=https://example.com,https://www.example.com
DB_HOST=prod-db.example.com
```

---

## Step 5: Secure Secret Storage (Advanced)

For enhanced security, consider using a secrets manager instead of `.env` files:

### Option A: AWS Secrets Manager
```python
# In settings.py
import boto3

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    return client.get_secret_value(SecretId=secret_name)['SecretString']

SECRET_KEY = get_secret('altruria/secret-key')
```

### Option B: HashiCorp Vault
```python
import requests

def get_vault_secret(path):
    response = requests.get(
        f'http://vault.example.com:8200/v1/{path}',
        headers={'X-Vault-Token': os.getenv('VAULT_TOKEN')}
    )
    return response.json()['data']['data']
```

### Option C: Cloud Provider Secrets
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **AWS**: Secrets Manager or Parameter Store

---

## Step 6: Load Environment Variables

The backend already uses `python-dotenv`, so variables are loaded automatically from `.env`:

```python
from decouple import config

# These will read from .env if present, or use defaults
SECRET_KEY = config('SECRET_KEY', default='...')
DEBUG = config('DEBUG', default=True, cast=bool)
```

---

## Step 7: Verify Configuration

Before deploying, verify all settings are correct:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate.ps1

# Check if .env is loaded
python manage.py shell
>>> import os
>>> print(os.getenv('DEBUG'))
False  # Should be False for production
>>> print(os.getenv('ALLOWED_HOSTS'))
example.com,www.example.com  # Should be your domain
```

---

## Step 8: Test Database Connection

```bash
python manage.py dbshell
```

This should connect to your production database without errors.

---

## Step 9: Run Migrations on Production Database

```bash
# IMPORTANT: Always backup your database first!
python manage.py migrate
```

---

## Security Checklist

- [ ] Secret key is strong (use generated key, not default)
- [ ] DEBUG is False in production
- [ ] ALLOWED_HOSTS contains your actual domain(s)
- [ ] DB credentials are for production database
- [ ] CORS_ALLOWED uses HTTPS URLs for production frontend
- [ ] `.env` file is in `.gitignore`
- [ ] `.env` file is NOT committed to git
- [ ] Admin credentials are changed from defaults
- [ ] All sensitive values use strong passwords
- [ ] Environment variables are backed up securely
- [ ] Access to `.env` file is restricted to authorized personnel

---

## Troubleshooting

### Issue: "DEBUG must be False in production"
**Solution:** Set `DEBUG=False` in your `.env` file

### Issue: "ALLOWED_HOSTS error"
**Solution:** Ensure `ALLOWED_HOSTS` includes your actual domain:
```env
ALLOWED_HOSTS=example.com,www.example.com
```

### Issue: "Database connection refused"
**Solution:** Verify database credentials and network access:
```bash
mysql -h db.example.com -u altruria_user -p altruria_prod
```

### Issue: "CORS errors in browser"
**Solution:** Update `CORS_ALLOWED` to include your frontend domain:
```env
CORS_ALLOWED=https://example.com
```

---

## Best Practices

1. **Rotate Secrets Regularly**
   - Change SECRET_KEY every 6-12 months
   - Rotate database passwords quarterly
   - Update admin credentials when staff changes

2. **Monitor Secret Access**
   - Log who accesses secrets
   - Audit secret changes
   - Set up alerts for suspicious access

3. **Backup Secrets**
   - Store backup of `.env` in secure location
   - Use encrypted backup storage
   - Test restoration procedures

4. **Use Secrets Manager**
   - Don't store secrets in `.env` files long-term
   - Use cloud provider secrets manager
   - Implement automatic rotation

5. **Access Control**
   - Limit who can modify `.env`
   - Use role-based access control
   - Document access procedures

---

## References

- [Django Security Documentation](https://docs.djangoproject.com/en/4.2/topics/security/)
- [12 Factor App - Config](https://12factor.net/config)
- [python-dotenv Documentation](https://python-dotenv.readthedocs.io/)

---

**Last Updated:** November 24, 2025  
**Status:** Ready for Production Configuration
