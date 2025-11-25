# Complete Altruria Project Setup & Deployment Guide

## Project Overview

Altruria is a complete farm-to-consumer e-commerce platform with:
- **Frontend**: Clean, organized HTML/CSS/JS with modular components
- **Backend**: Production-ready Django REST API with MySQL
- **Authentication**: JWT-based user auth with admin/customer roles
- **Features**: Products, orders, user profiles, support messaging

## Directory Structure

```
altruria_2/
├── frontend/                                   # Frontend application
│   ├── index.html
│   ├── css/                                    # Stylesheets
│   ├── js/                                     # JavaScript logic
│   ├── pages/                                  # HTML pages
│   ├── components/                             # Reusable components
│   ├── images/                                 # Assets
│   └── docs/                                   # Frontend documentation
└── backend/                                    # Django REST backend
    ├── manage.py
    ├── requirements.txt
    ├── .env.example
    ├── README.md                               # Backend setup guide
    ├── altruria_project/                       # Django settings
    ├── core/                                   # Main app (models, views, etc.)
    ├── media/                                  # Uploaded files
    └── migrations/                             # DB migrations
```

## Quick Start (5 minutes)

### Prerequisites
- Python 3.11+
- MySQL Server
- Node.js or Python (for serving frontend)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create MySQL database
mysql -u root -e "CREATE DATABASE altruria;"

# Configure .env
cp .env.example .env
# Edit .env with your DB credentials

# Run migrations
python manage.py migrate

# Seed sample data
python manage.py seed_data

# Start development server
python manage.py runserver
```

Backend available at: **http://localhost:8000**

### 2. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Serve frontend files
python -m http.server 5500
# Or: npx http-server -p 5500
```

Frontend available at: **http://localhost:5500**

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/token/` | Login (get JWT token) |
| GET | `/api/auth/me/` | Get current user |
| GET | `/api/products/` | List all products |
| GET | `/api/products/?q=chicken` | Search products |
| POST | `/api/orders/` | Create order |
| GET | `/api/orders/user/1/` | Get user orders |
| POST | `/api/messages/` | Send message |

See `backend/README.md` for full API documentation.

## Frontend File Structure

### Move Old Files to New Structure

Copy files from root to `frontend/` organized as:

```bash
# CSS files
cp styles.css frontend/css/
cp *-styles.css frontend/css/

# JS files
cp auth.js script.js cart.js checkout.js profile.js settings.js frontend/js/

# HTML pages
cp products.html cart.html checkout.html login.html signup.html profile.html settings.html terms.html privacy.html frontend/pages/

# Keep index.html at root (home page)
cp index.html frontend/

# Components
cp components/*.html frontend/components/
cp include.js frontend/components/

# Images
cp images/* frontend/images/
```

### Update HTML Links

All HTML files in `pages/` should reference:

```html
<!-- From pages/products.html -->
<link rel="stylesheet" href="../css/styles.css">
<script src="../js/config.js"></script>
```

## Database Schema

### User Model
```
- id (Integer, PK)
- username (String, unique)
- email (String, unique)
- is_admin (Boolean)
- mobile (String)
- address (Text)
- created_at (DateTime)
```

### Product Model
```
- id (Integer, PK)
- name (String)
- category (String: meats|vegetables)
- price (Decimal)
- description (Text)
- image (ImageField)
- stock (Integer)
- created_at (DateTime)
```

### Order Model
```
- id (String, PK: ORD-YYYYMMDD-XXXXX)
- user (FK → User)
- total (Decimal)
- payment_method (String: gcash|bank|cod)
- status (String: pending|paid|shipped|completed|cancelled)
- shipping_address (Text)
- delivery_method (String: pickup|delivery)
- created_at (DateTime)
```

### OrderItem Model
```
- id (Integer, PK)
- order (FK → Order)
- product (FK → Product)
- quantity (Integer)
- price (Decimal)
```

### Message Model
```
- id (Integer, PK)
- user (FK → User)
- sender (String: user|admin)
- text (Text)
- read (Boolean)
- created_at (DateTime)
```

## Authentication Flow

### Register
```
POST /api/auth/register/
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}
```

### Login
```
POST /api/token/
{
  "username": "john_doe",
  "password": "SecurePass123"
}

Response:
{
  "access": "<JWT_ACCESS_TOKEN>",
  "refresh": "<JWT_REFRESH_TOKEN>"
}
```

### Authenticated Requests
```
Authorization: Bearer <ACCESS_TOKEN>
```

## Environment Configuration

### Backend `.env` (Development)

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=altruria
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306

# CORS
CORS_ALLOWED=http://localhost:5500,http://localhost:5173

# Admin
ADMIN_EMAIL=admin@altruria.local
ADMIN_PASSWORD=AdminPass123
```

### Backend `.env` (Production)

```env
# Django
SECRET_KEY=<generate-50-char-random-string>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=altruria_prod
DB_USER=altruria_user
DB_PASSWORD=<strong-password>
DB_HOST=<db-host>
DB_PORT=3306

# CORS
CORS_ALLOWED=https://yourdomain.com

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>
```

## Deployment

### Option 1: Self-Hosted (VPS)

```bash
# Install dependencies
sudo apt-get install python3.11 python3-pip mysql-server nginx gunicorn

# Clone project
git clone <repo> /var/www/altruria
cd /var/www/altruria/backend

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure .env
cp .env.example .env
nano .env  # Edit with production settings

# Run migrations
python manage.py migrate
python manage.py seed_data

# Create systemd service for Gunicorn
sudo nano /etc/systemd/system/altruria.service
```

### Option 2: Render/Heroku

1. Push code to GitHub
2. Create new Web Service in Render/Heroku
3. Add environment variables from `.env.example`
4. Connect MySQL database (Render MySQL addon or external)
5. Deploy

```bash
# Render Deploy Commands
heroku run python manage.py migrate
heroku run python manage.py seed_data
```

### Option 3: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend /app
RUN pip install -r requirements.txt
CMD ["gunicorn", "altruria_project.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```bash
docker build -t altruria-backend .
docker run -p 8000:8000 -e DB_NAME=altruria altruria-backend
```

## Testing the Integration

### 1. Test Backend

```bash
# Get products
curl http://localhost:8000/api/products/

# Register user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "password_confirm": "TestPass123"
  }'

# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPass123"}'
```

### 2. Test Frontend

1. Open `http://localhost:5500` in browser
2. Navigate to Products page
3. Verify products load from backend
4. Try registering/logging in
5. Create an order
6. Check admin at `http://localhost:8000/admin`

## Troubleshooting

### CORS Errors
- **Error**: "Access to XMLHttpRequest blocked by CORS policy"
- **Solution**: Add frontend URL to backend `.env` `CORS_ALLOWED`

### Database Connection Error
- **Error**: "Can't connect to MySQL server"
- **Solution**: 
  1. Verify MySQL is running
  2. Check DB credentials in `.env`
  3. Create database: `mysql -u root -e "CREATE DATABASE altruria;"`

### Token Expired
- **Error**: "401 Unauthorized" after some time
- **Solution**: Implement token refresh in frontend - see `config.js` example

### Static Files Not Loading
- **Error**: 404 on CSS/JS files
- **Solution**: 
  1. Verify path references in HTML (`../css/styles.css`)
  2. Ensure frontend server is running on correct port
  3. Check browser console for actual URL being requested

### Admin Interface 404
- **Error**: `/admin/` not found
- **Solution**: Run migrations: `python manage.py migrate`

## Maintenance

### Daily
- Monitor error logs
- Check backend health endpoint
- Review unread messages in admin

### Weekly
- Review orders and payments
- Update product stock
- Check system performance

### Monthly
- Backup database
- Review user analytics
- Update dependencies: `pip list --outdated`
- Security patches

## Security Checklist

- [ ] Change `SECRET_KEY` in production `.env`
- [ ] Set `DEBUG=False` in production
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Set secure CSRF tokens
- [ ] Use strong admin credentials
- [ ] Regular backups
- [ ] Monitor for SQL injection attempts
- [ ] Keep dependencies updated

## Performance Optimization

### Backend
- Enable Redis caching for products
- Use database indexes on frequently queried fields
- Implement pagination (already done in REST framework)
- Use CDN for media files

### Frontend
- Minify CSS and JavaScript
- Optimize images
- Implement lazy loading
- Use service workers for offline support

## Support & Contribution

For issues: Contact `gilland.sabile@bipsu.edu.ph`

## License

© 2025 Altruria. All rights reserved.

---

**Ready to deploy!** Start with backend setup, then frontend, and test all integration points.
