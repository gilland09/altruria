# Altruria Django REST Backend

A production-ready Django REST Framework API for the Altruria farm-to-consumer e-commerce platform. Supports user authentication, product management, orders, and customer support messaging.

## Features

- ✅ Custom User model with admin/customer roles
- ✅ JWT-based authentication (djangorestframework-simplejwt)
- ✅ Product management (CRUD) with category filtering
- ✅ Order management with order items and status tracking
- ✅ Customer support messaging system
- ✅ MySQL database integration
- ✅ CORS support for frontend integration
- ✅ Django admin interface
- ✅ Management command for database seeding
- ✅ Production-ready configuration (environment variables)

## Project Structure

```
backend/
├── manage.py                           # Django management script
├── requirements.txt                    # Python dependencies
├── .env.example                        # Environment variables template
├── Procfile                            # Deployment configuration
├── README.md                           # This file
├── altruria_project/
│   ├── __init__.py
│   ├── settings.py                     # Django settings (DB, REST, JWT, CORS)
│   ├── urls.py                         # Main URL routing
│   ├── wsgi.py                         # WSGI application
│   ├── asgi.py                         # ASGI application
│   └── migrations/
├── core/
│   ├── __init__.py
│   ├── models.py                       # User, Product, Order, OrderItem, Message
│   ├── serializers.py                  # DRF serializers
│   ├── views.py                        # API views and viewsets
│   ├── urls.py                         # Core API routes
│   ├── admin.py                        # Django admin configuration
│   ├── apps.py                         # App config
│   ├── migrations/
│   └── management/
│       └── commands/
│           └── seed_data.py            # Seed database with sample data
└── media/                              # Uploaded product images
```

## Installation

### Prerequisites

- Python 3.11+
- MySQL Server (XAMPP, MariaDB, or hosted)
- pip (Python package manager)
- Virtual environment (venv or conda)

### Step 1: Set Up Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Database & Environment

1. **Create MySQL Database:**

   ```sql
   CREATE DATABASE altruria;
   CREATE USER 'altruria_user'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT ALL PRIVILEGES ON altruria.* TO 'altruria_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

   Or use the root user (simplest for development):

   ```sql
   CREATE DATABASE altruria;
   ```

2. **Create `.env` file** (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:

   ```env
   SECRET_KEY=your-very-secret-key-change-this
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DB_NAME=altruria
   DB_USER=root
   DB_PASSWORD=
   DB_HOST=127.0.0.1
   DB_PORT=3306
   CORS_ALLOWED=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:5173
   ADMIN_EMAIL=admin@altruria.local
   ADMIN_PASSWORD=AdminPass123
   ```

### Step 4: Run Migrations

```bash
python manage.py migrate
```

### Step 5: Seed Sample Data

```bash
python manage.py seed_data
```

This creates:
- Admin user (username: `admin`, email: `admin@altruria.local`, password: `AdminPass123`)
- 10 sample products (meats and vegetables)

### Step 6: Create Superuser (Optional, if not seeded)

```bash
python manage.py createsuperuser
```

### Step 7: Run Development Server

```bash
python manage.py runserver
```

Server runs at: `http://localhost:8000`
Django Admin: `http://localhost:8000/admin`

## API Documentation

### Base URL

`http://localhost:8000/api`

### Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

#### Obtain Tokens

**POST** `/token/`

Request:
```json
{
  "username": "admin",
  "password": "AdminPass123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Refresh Access Token

**POST** `/token/refresh/`

Request:
```json
{
  "refresh": "<refresh_token>"
}
```

Response:
```json
{
  "access": "<new_access_token>"
}
```

---

### Authentication Endpoints

#### Register

**POST** `/auth/register/`

Request:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+639123456789",
  "address": "123 Farm Road, Naval, Biliran"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false,
    "mobile": "+639123456789",
    "address": "123 Farm Road, Naval, Biliran",
    "created_at": "2025-11-16T10:30:00Z"
  }
}
```

#### Get Current User

**GET** `/auth/me/` (Requires authentication)

Response:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@altruria.local",
  "first_name": "",
  "last_name": "",
  "is_admin": true,
  "mobile": "",
  "address": "",
  "created_at": "2025-11-16T10:00:00Z"
}
```

---

### Product Endpoints

#### List All Products (Paginated)

**GET** `/products/`

Query parameters:
- `?q=chicken` - Search by name/description
- `?category=meats` - Filter by category (meats|vegetables)
- `?ordering=-price` - Order by price (ascending/descending)

Response:
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Organic Chicken Breast",
      "category": "meats",
      "price": "280.00",
      "description": "Fresh, hormone-free chicken breast from our farm.",
      "image": "http://localhost:8000/media/products/chicken.jpg",
      "stock": 50,
      "created_at": "2025-11-16T10:00:00Z"
    },
    ...
  ]
}
```

#### Get Single Product

**GET** `/products/{id}/`

Response:
```json
{
  "id": 1,
  "name": "Organic Chicken Breast",
  "category": "meats",
  "price": "280.00",
  "description": "Fresh, hormone-free chicken breast from our farm.",
  "image": "http://localhost:8000/media/products/chicken.jpg",
  "stock": 50,
  "created_at": "2025-11-16T10:00:00Z"
}
```

#### Create Product (Admin Only)

**POST** `/products/`

Request (multipart/form-data):
```
name: Organic Chicken Breast
category: meats
price: 280.00
description: Fresh, hormone-free chicken breast
image: <binary>
stock: 50
```

Response: (201 Created)
```json
{
  "id": 11,
  "name": "Organic Chicken Breast",
  ...
}
```

#### Update Product (Admin Only)

**PUT/PATCH** `/products/{id}/`

Request:
```json
{
  "price": "300.00",
  "stock": 45
}
```

#### Delete Product (Admin Only)

**DELETE** `/products/{id}/`

Response: (204 No Content)

---

### Order Endpoints

#### Create Order (Requires Authentication)

**POST** `/orders/`

Request:
```json
{
  "payment_method": "gcash",
  "shipping_address": "123 Main St, Naval, Biliran",
  "delivery_method": "delivery",
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 3, "quantity": 1}
  ]
}
```

Response: (201 Created)
```json
{
  "id": "ORD-20251116-ABC12345",
  "user_email": "john@example.com",
  "total": "840.00",
  "payment_method": "gcash",
  "status": "pending",
  "shipping_address": "123 Main St, Naval, Biliran",
  "delivery_method": "delivery",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Organic Chicken Breast",
        "category": "meats",
        "price": "280.00",
        "description": "...",
        "image": "...",
        "stock": 50,
        "created_at": "..."
      },
      "quantity": 2,
      "price": "280.00"
    },
    ...
  ],
  "created_at": "2025-11-16T10:35:00Z",
  "updated_at": "2025-11-16T10:35:00Z"
}
```

#### Get User's Orders

**GET** `/orders/user/{user_id}/` (Requires authentication, user or admin)

Response:
```json
[
  {
    "id": "ORD-20251116-ABC12345",
    "user_email": "john@example.com",
    ...
  },
  ...
]
```

#### Get Order Details

**GET** `/orders/{order_id}/` (Requires authentication, owner or admin)

Response:
```json
{
  "id": "ORD-20251116-ABC12345",
  ...
}
```

#### Update Order Status (Admin Only)

**PUT** `/orders/{order_id}/status/`

Request:
```json
{
  "status": "shipped"
}
```

Valid statuses: `pending`, `paid`, `shipped`, `completed`, `cancelled`

Response:
```json
{
  "id": "ORD-20251116-ABC12345",
  "status": "shipped",
  ...
}
```

---

### Message Endpoints

#### Create Message (Requires Authentication)

**POST** `/messages/`

Request:
```json
{
  "text": "I have a question about the delivery time for my order."
}
```

Response: (201 Created)
```json
{
  "id": 1,
  "user_email": "john@example.com",
  "sender": "user",
  "text": "I have a question about the delivery time for my order.",
  "read": false,
  "created_at": "2025-11-16T10:40:00Z"
}
```

#### Get User Messages

**GET** `/messages/user/{user_id}/` (Requires authentication, user or admin)

Response:
```json
[
  {
    "id": 1,
    "user_email": "john@example.com",
    "sender": "user",
    "text": "I have a question...",
    "read": false,
    "created_at": "2025-11-16T10:40:00Z"
  },
  ...
]
```

#### Get Admin Messages (Unread)

**GET** `/messages/admin/` (Requires admin authentication)

Response:
```json
[
  {
    "id": 2,
    "user_email": "john@example.com",
    "sender": "user",
    "text": "...",
    "read": false,
    "created_at": "..."
  },
  ...
]
```

#### Mark Message as Read (Admin Only)

**PUT** `/messages/admin/`

Request:
```json
{
  "message_id": 2
}
```

Response:
```json
{
  "id": 2,
  "read": true,
  ...
}
```

---

## cURL Examples

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "+639123456789",
    "address": "123 Main St"
  }'
```

### Login (Get Token)

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Search Products

```bash
curl -X GET "http://localhost:8000/api/products/?q=chicken&category=meats"
```

### Create Order

```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "gcash",
    "shipping_address": "123 Main St, Naval",
    "delivery_method": "delivery",
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

### Create Message

```bash
curl -X POST http://localhost:8000/api/messages/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "When will my order arrive?"
  }'
```

### Update Order Status (Admin)

```bash
curl -X PUT http://localhost:8000/api/orders/ORD-20251116-ABC12345/status/ \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

---

## Deployment

### Option 1: Deploy to Render

1. **Create `.env` in Render Dashboard:**
   - Set all variables from `.env.example`

2. **Create MySQL Database:**
   - Add Render MySQL database or use external DB
   - Update `DB_*` env vars

3. **Push to GitHub:**
   ```bash
   git push origin main
   ```

4. **Connect Render:**
   - Create new Web Service
   - Connect GitHub repo
   - Set environment variables
   - Deploy

5. **Run Migrations:**
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```

### Option 2: Deploy to Heroku

```bash
# Install Heroku CLI
heroku login
heroku create altruria-backend
heroku addons:create cleardb:ignite  # MySQL add-on

# Push code
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py seed_data
```

### Option 3: Manual Server (VPS/Dedicated)

```bash
# Install Python, MySQL, dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with Gunicorn
gunicorn altruria_project.wsgi:application --bind 0.0.0.0:8000

# Or with Supervisor for process management
# See Supervisor docs: http://supervisord.org
```

---

## Security Notes

⚠️ **Production Checklist:**

- [ ] Change `SECRET_KEY` in `.env` to a random 50+ character string
- [ ] Set `DEBUG=False` in production `.env`
- [ ] Use strong database password
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set `ALLOWED_HOSTS` to your domain(s)
- [ ] Use secure CSRF settings
- [ ] Implement rate limiting (django-ratelimit)
- [ ] Use Redis for caching and session storage
- [ ] Enable HSTS headers
- [ ] Rotate JWT secrets periodically

---

## Troubleshooting

### MySQL Connection Error

**Error:** `django.db.utils.OperationalError: Can't connect to MySQL server`

**Solution:**
```bash
# Ensure MySQL is running
# Windows: Services -> MySQL80
# macOS: brew services start mysql
# Linux: sudo service mysql start

# Check .env DB credentials are correct
# Verify DB exists: mysql -u root -e "SHOW DATABASES;"
```

### Migration Issues

**Error:** `django.db.utils.ProgrammingError`

**Solution:**
```bash
# Reset migrations (CAUTION: loses data)
python manage.py migrate core zero
python manage.py migrate
python manage.py seed_data
```

### CORS Issues

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Ensure `CORS_ALLOWED` in `.env` includes your frontend URL
- Example: `CORS_ALLOWED=http://localhost:5173,http://localhost:3000`

### Token Expired

**Solution:**
Use refresh token to get new access token:
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```

---

## Contributing

Contributions welcome! Follow PEP 8 style guide and add tests for new features.

---

## License

Altruria © 2025. All rights reserved.

---

## Support

For issues, feature requests, or questions, contact: gilland.sabile@bipsu.edu.ph
