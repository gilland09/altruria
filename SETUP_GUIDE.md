# Altruria - Complete Setup & Run Guide

## Project Overview

**Altruria** is a full-stack e-commerce platform connecting local farmers with consumers.

- **Backend:** Django REST Framework with MySQL database
- **Frontend:** Static HTML/CSS/JavaScript with real-time API integration
- **Architecture:** Organized folder structure for maintainability

---

## ⚡ Quick Start (30 seconds)

### Option 1: Automated (Windows PowerShell)

```powershell
# Navigate to project root
cd C:\PROJECTS\altruria_2

# Run the startup script
.\START_SERVERS.ps1
```

### Option 2: Manual (Terminal)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/Scripts/activate  # or .\venv\Scripts\Activate.ps1 on Windows
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python -m http.server 5500
```

---

## 🌐 Access the Application

Once servers are running:

| Component | URL | Note |
|-----------|-----|------|
| **Frontend** | http://localhost:5500 | Main e-commerce site |
| **API** | http://localhost:8000/api | REST API endpoints |
| **Admin Panel** | http://localhost:8000/admin | Django admin interface |

---

## 🔑 Admin Credentials

Automatically created during first database setup:

- **Email:** `admin@altruria.local`
- **Password:** `AdminPass123`
- **Access:** http://localhost:8000/admin

---

## 📁 Project Structure

```
altruria_2/
├── backend/                      # Django REST backend
│   ├── altruria_project/        # Project settings
│   │   ├── settings.py          # Django configuration
│   │   ├── urls.py              # URL routing
│   │   └── wsgi.py              # WSGI application
│   ├── core/                    # Main app with models
│   │   ├── models.py            # DB models (User, Product, Order, etc.)
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # API views
│   │   ├── admin.py             # Django admin config
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py # Seed database with sample data
│   ├── manage.py                # Django management script
│   ├── requirements.txt          # Python dependencies
│   └── venv/                    # Python virtual environment
│
├── frontend/                     # Static frontend (organized)
│   ├── index.html               # Homepage
│   ├── css/                     # Stylesheets
│   │   ├── styles.css           # Global styles
│   │   ├── homepage-styles.css  # Homepage specific
│   │   ├── cart-styles.css      # Cart page
│   │   ├── login-styles.css     # Auth pages
│   │   └── [other CSS files]
│   ├── js/                      # JavaScript
│   │   ├── config.js            # API configuration
│   │   ├── constants.js         # App constants
│   │   ├── auth.js              # Authentication logic
│   │   ├── script.js            # Main logic
│   │   ├── cart.js              # Cart management
│   │   └── [other JS files]
│   ├── pages/                   # HTML pages
│   │   ├── products.html        # Product listing
│   │   ├── cart.html            # Shopping cart
│   │   ├── login.html           # Login page
│   │   ├── signup.html          # Registration page
│   │   └── [other pages]
│   ├── images/                  # Product & site images
│   ├── components/              # Reusable UI components
│   └── docs/                    # Frontend documentation
│
├── START_SERVERS.ps1            # Quick start script (PowerShell)
├── QUICK_START.md               # Quick start instructions
└── README.md                    # Project documentation
```

---

## 🛠️ Backend Setup (One-time)

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv --upgrade-deps
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

**Create MySQL Database:**
```bash
mysql -u root -e "DROP DATABASE IF EXISTS altruria; CREATE DATABASE altruria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Run Migrations:**
```bash
python manage.py makemigrations core
python manage.py migrate
```

### 5. Seed Sample Data

```bash
python manage.py seed_data
```

This creates:
- Admin user: `admin@altruria.local` / `AdminPass123`
- 10 sample products (meats & vegetables)

---

## 🎨 Frontend Architecture

### JavaScript Modules

**config.js** - API configuration
- Defines `API_BASE_URL`, `API_ENDPOINTS`
- Exports `TokenManager` for JWT handling
- Exports `apiCall()` helper for authenticated requests

**constants.js** - App-wide constants
- Product categories, order statuses, payment methods
- Validation rules, error/success messages

**auth.js** - Authentication system
- User creation and login management
- localStorage-based session tracking

**script.js** - Main logic
- Product fetching and display
- Search and filtering
- Shopping cart interactions

### CSS Architecture

- **styles.css** - Global styles (colors, typography, layout)
- **homepage-styles.css** - Hero section, promotions, featured products
- **cart-styles.css** - Shopping cart layout
- **login-styles.css** - Auth pages (login/signup)
- And more for specific pages...

### Relative Path Structure

All pages under `pages/` use `../` to reference parent resources:
```html
<!-- Product page at frontend/pages/products.html -->
<link rel="stylesheet" href="../css/styles.css">
<img src="../images/logo.png">
<script src="../js/config.js"></script>
```

---

## 🔌 API Endpoints

### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}/` - Get product details
- `POST /api/products/` - Create product (admin)
- `PUT /api/products/{id}/` - Update product (admin)

### Orders
- `POST /api/orders/` - Create order
- `GET /api/orders/` - List user orders (authenticated)
- `GET /api/orders/{id}/` - Get order details

### Authentication
- `POST /api/token/` - Get JWT tokens
- `POST /api/token/refresh/` - Refresh access token

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql://root@127.0.0.1:3306/altruria
CORS_ALLOWED_ORIGINS=http://localhost:5500
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Port 5500 (Frontend):**
```bash
# Find process using port
lsof -i :5500

# Kill the process
kill -9 <PID>
```

**Port 8000 (Backend):**
```bash
# Django will auto-find next available port if specified as 8000+
python manage.py runserver 8001
```

### Database Connection Error

Verify MySQL is running:
```bash
mysql -u root -e "SELECT 1"
```

### Missing Images

Ensure images are in `frontend/images/`:
```bash
cd frontend/images
ls -la
```

### Module Import Errors

Verify virtual environment is activated and packages installed:
```bash
pip list | grep -i django
```

---

## 📦 Technologies Used

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework 3.14.0** - REST API
- **djangorestframework-simplejwt 5.3.1** - JWT authentication
- **PyMySQL 1.1.0** - MySQL database driver
- **django-cors-headers 4.3.1** - CORS support

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **JavaScript (ES6+)** - Interactivity
- **Font Awesome 6.0** - Icons

### Database
- **MySQL 8.0+** - Primary database

---

## 🚀 Production Deployment

### Backend Deployment

1. **Collect static files:**
   ```bash
   python manage.py collectstatic --noinput
   ```

2. **Use Gunicorn:**
   ```bash
   gunicorn altruria_project.wsgi:application --bind 0.0.0.0:8000
   ```

3. **Use environment variables** for sensitive data

### Frontend Deployment

1. **Build process:** (Already static - no build needed)
2. **Use CDN** for images and static assets
3. **Serve from web server** (Nginx, Apache)

---

## 📝 Development Notes

### Adding a New Page

1. Create HTML file in `frontend/pages/`
2. Use relative paths: `../css/`, `../images/`, `../js/`
3. Import required JS modules:
   ```html
   <script src="../js/config.js"></script>
   <script src="../js/constants.js"></script>
   <script src="../js/script.js"></script>
   ```

### Adding a New API Endpoint

1. Create or modify serializer in `backend/core/serializers.py`
2. Add view in `backend/core/views.py`
3. Register in `backend/core/urls.py`
4. Add endpoint definition to `frontend/js/config.js` under `API_ENDPOINTS`

### Debugging

**Backend:**
```bash
# Enable Django debug toolbar
pip install django-debug-toolbar
```

**Frontend:**
- Use browser DevTools (F12)
- Check Network tab for API calls
- Check Console for JavaScript errors

---

## 📞 Support & Contact

For issues or questions:
- **Email:** gilland.sabile@bipsu.edu.ph
- **Phone:** 09956318845
- **Location:** Naval, Biliran, Philippines

---

## 📄 License

© 2025 Altruria Farm Products. All rights reserved.

---

**Last Updated:** November 21, 2025
