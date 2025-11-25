# PHASE 2 — Static & Media Files

Purpose
- Prepare the project to serve static assets (CSS/JS/images) and uploaded media in production.
- Provide instructions for either local/static serving with Nginx + WhiteNoise or cloud storage (S3 + CloudFront).

Summary
- Options:
  - Local static + WhiteNoise (simple, no external storage) — good for quick deploys and small sites.
  - S3 for media + CloudFront for CDN (recommended for scale and reliability).
- Steps include installing deps, collecting static, configuring Nginx, and optional S3 configuration.

---

1) Quick checklist (what we'll do)
- Install new dependencies from `backend/requirements.txt`.
- Configure `.env` for chosen storage (`USE_S3=False` for local, `USE_S3=True` and AWS creds for S3).
- Run `python manage.py collectstatic --noinput` to gather static files to `STATIC_ROOT`.
- Configure Nginx (or CDN) to serve static and media or rely on S3 + CloudFront.
- Verify in browser and test uploads via admin.

---

2) Install dependencies (on your machine)

PowerShell (Windows):
```powershell
cd C:\PROJECTS\altruria_2\backend
# Activate your virtualenv
venv\Scripts\Activate.ps1
# Install requirements
pip install -r requirements.txt
```

Bash (Linux/macOS):
```bash
cd /path/to/project/backend
source venv/bin/activate
pip install -r requirements.txt
```

Notes:
- `whitenoise`, `django-storages[boto3]`, and `boto3` are already added to `requirements.txt` in this repo.

---

3) Configure `.env` for storage mode

Local/static-only setup (recommended for small sites / quick deploy):
- In `backend/.env`:
```
USE_S3=False
DEBUG=False
# Keep existing SECRET_KEY, ALLOWED_HOSTS, CORS_ALLOWED, DB_*
```

S3 + CloudFront (recommended for production):
- In `backend/.env` (on the server, do NOT commit):
```
USE_S3=True
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=cdn.your-domain.com  # optional, CloudFront domain or custom CNAME
```

---

4) Static collection (collectstatic)

Before running collectstatic ensure:
- `DJANGO_SETTINGS_MODULE` is set (if running outside manage.py environment).
- `backend/.env` has `DEBUG=False` for production behavior (or keep `DEBUG=True` for testing but note WhiteNoise manifest storage expects consistent files).

PowerShell (Windows):
```powershell
cd C:\PROJECTS\altruria_2\backend
venv\Scripts\Activate.ps1
# Ensure .env is loaded automatically by python-dotenv/decouple
python manage.py collectstatic --noinput
```

Bash (Linux/macOS):
```bash
cd /path/to/project/backend
source venv/bin/activate
python manage.py collectstatic --noinput
```

What this does:
- Copies all static assets from apps and `frontend` sources (if configured) into `STATIC_ROOT` (by default `BASE_DIR/staticfiles`).
- If `STATICFILES_STORAGE` is `whitenoise.storage.CompressedManifestStaticFilesStorage`, it will create hashed filenames and a manifest for cache busting.

Troubleshooting:
- If you see "Missing staticfiles manifest" errors, run with `DEBUG=True` to debug, find missing referenced files, or ensure all referenced static paths exist.

---

5) Local serving with WhiteNoise vs Nginx

WhiteNoise (simple, recommended for many deployments):
- We added `WhiteNoiseMiddleware` and `STATICFILES_STORAGE` when `DEBUG=False` in `settings.py`.
- WhiteNoise serves static files via Gunicorn and adds caching and compression.
- Good when you deploy with Gunicorn behind a reverse proxy.

Nginx + static files (recommended for higher performance):
- Use Nginx to serve `/static/` and `/media/` directly from disk (fast and efficient).
- Place collected static files at `/var/www/altruria/static/` and media at `/var/www/altruria/media/` (or similar).

Example Nginx server block (adapt paths and names):

```
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    client_max_body_size 50M;

    location /static/ {
        alias /var/www/altruria/static/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /media/ {
        alias /var/www/altruria/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}
```

Notes:
- Create directories and give correct permissions (e.g., `www-data` user):
```bash
sudo mkdir -p /var/www/altruria/static /var/www/altruria/media
sudo chown -R www-data:www-data /var/www/altruria
```

---

6) S3 + CloudFront (recommended for scale)

High-level steps:
1. Create an S3 bucket with a unique name.
2. Configure bucket policy (public read for objects if serving directly via S3) OR restrict access and use CloudFront origin access identity.
3. Optionally configure CloudFront distribution with S3 as origin and set caching headers.
4. Set `USE_S3=True` and AWS env vars in `backend/.env` on server.
5. Set `MEDIA_URL` to use your CloudFront or S3 domain, e.g.:
   ```python
   MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/' if AWS_S3_CUSTOM_DOMAIN else f'https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/'
   ```
6. Run migrations and let django-storages handle uploaded files.

Security note:
- Prefer restricting direct S3 public access and use CloudFront with origin access identity to avoid exposing bucket directly.
- Use HTTPS for CloudFront and add your custom domain (CNAME) if needed.

---

7) MEDIA_URL and settings snippet (recommended addition)

If you choose S3, add or confirm these in `settings.py` (we already added basic S3 settings):
```python
if USE_S3:
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/' if AWS_S3_CUSTOM_DOMAIN else f'https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/'
else:
    MEDIA_URL = '/media/'
```

We can add this snippet to `settings.py` if you want — I can patch it now.

---

8) Verification & testing

A. Verify collectstatic created files in `STATIC_ROOT`:
```powershell
# Windows
cd C:\PROJECTS\altruria_2\backend
venv\Scripts\Activate.ps1
python manage.py collectstatic --noinput
# Then inspect the static root
ls staticfiles | head
```

B. Run server and confirm static loading (WhiteNoise):
```powershell
python manage.py runserver 0.0.0.0:8000
# Open http://localhost:8000/static/css/styles.css (example)
```

C. Test media upload (if using local media):
- Log into Django admin, upload an image for a product, then view the product page to confirm image served from `/media/` or S3 URL.

D. Test CloudFront (if used):
- After CloudFront distribution is in place, visit the CDN URL and confirm objects are served and not returning 403/404.

---

9) Rollback & troubleshooting

- Keep a backup of previous `staticfiles` folder before replacing on server.
- If static files 404 after deploy, check:
  - Nginx `alias` path matches `STATIC_ROOT`
  - Files exist in the directory
  - File permissions (web user can read)
  - If using Manifest storage, ensure hashed filenames are generated and templates reference `{% static 'path' %}` rather than hard-coded names

---

10) Recommended next actions for us
- I can patch `settings.py` to add the `MEDIA_URL` snippet now if you want (safe). Reply "Add MEDIA_URL".
- If you're ready, run the install and `collectstatic` locally and tell me the output; I can help interpret errors. Reply "Run collectstatic" and I’ll provide the exact commands to run on your machine.
- I can create a `PHASE_2_DEPLOY.md` with concrete commands for Nginx + systemd + Gunicorn deployment and CI steps for GitHub Actions/Render/Fly.io. Reply "Create deploy doc".

---

References
- WhiteNoise: http://whitenoise.evans.io/
- django-storages: https://django-storages.readthedocs.io/
- AWS S3 & CloudFront: https://aws.amazon.com

---

Status: PHASE 2 documentation created and todo marked in-progress.
