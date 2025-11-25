#!/bin/bash
# Altruria - Quick Commands Reference
# Copy these commands for common operations

# ============================================
# SERVER MANAGEMENT
# ============================================

# Start Django Backend (Terminal 1)
cd /c/PROJECTS/altruria_2/backend
source venv/Scripts/activate
python manage.py runserver

# Start Frontend Server (Terminal 2)
cd /c/PROJECTS/altruria_2/frontend
python -m http.server 5500

# Access Points
# Frontend:  http://localhost:5500
# API:       http://localhost:8000/api
# Admin:     http://localhost:8000/admin


# ============================================
# DATABASE OPERATIONS
# ============================================

# Create/Reset Database
mysql -u root -e "DROP DATABASE IF EXISTS altruria; CREATE DATABASE altruria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run Migrations
cd /c/PROJECTS/altruria_2/backend
source venv/Scripts/activate
python manage.py makemigrations core
python manage.py migrate

# Seed Sample Data
python manage.py seed_data

# Access MySQL
mysql -u root altruria


# ============================================
# API TESTING WITH CURL
# ============================================

# Get All Products
curl http://localhost:8000/api/products/

# Get Single Product
curl http://localhost:8000/api/products/1/

# Get Admin Panel
curl http://localhost:8000/admin

# Get JWT Token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@altruria.local", "password": "AdminPass123"}'

# Use Token in Request
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/orders/


# ============================================
# FRONTEND TESTING
# ============================================

# List Frontend Files
ls -la /c/PROJECTS/altruria_2/frontend/

# Verify CSS Files
curl http://localhost:5500/css/styles.css | head -5

# Test Homepage
curl http://localhost:5500/ | head -20

# Test Products Page
curl http://localhost:5500/pages/products.html | head -20


# ============================================
# DEPENDENCY MANAGEMENT
# ============================================

# Update Requirements
cd /c/PROJECTS/altruria_2/backend
source venv/Scripts/activate
pip freeze > requirements.txt

# Install New Package
pip install package_name
pip freeze > requirements.txt

# Check Installed Packages
pip list

# Install from Requirements
pip install -r requirements.txt


# ============================================
# DEBUGGING
# ============================================

# Backend Logs (with timestamps)
python manage.py runserver 2>&1 | tee backend.log

# Frontend Server Logs
python -m http.server 5500 2>&1 | tee frontend.log

# Check Port Usage
# Windows:
netstat -ano | findstr :8000
netstat -ano | findstr :5500

# Linux/Mac:
lsof -i :8000
lsof -i :5500

# Django Shell
python manage.py shell

# Database Query
mysql -u root altruria -e "SELECT * FROM core_product LIMIT 10;"


# ============================================
# FILE OPERATIONS
# ============================================

# Backup Database
mysqldump -u root altruria > backup_altruria.sql

# Restore Database
mysql -u root altruria < backup_altruria.sql

# Create New Page
touch /c/PROJECTS/altruria_2/frontend/pages/newpage.html

# Create New CSS File
touch /c/PROJECTS/altruria_2/frontend/css/newpage-styles.css

# Create New JS File
touch /c/PROJECTS/altruria_2/frontend/js/newpage.js


# ============================================
# MONITORING & PERFORMANCE
# ============================================

# Check CPU/Memory Usage
# Windows PowerShell:
Get-Process python | Select-Object Name, CPU, Memory

# Linux/Mac:
ps aux | grep python

# Monitor Database Size
mysql -u root altruria -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = 'altruria';"

# Monitor API Response Time
curl -w "Time: %{time_total}s\n" http://localhost:8000/api/products/


# ============================================
# TROUBLESHOOTING SHORTCUTS
# ============================================

# Kill All Python Processes
# Windows PowerShell:
Get-Process python | Stop-Process -Force

# Linux/Mac:
pkill -9 python

# Restart Backend
python manage.py runserver --reload

# Clear Browser Cache
# Press Ctrl+Shift+Delete in your browser

# Check if Ports are Open
# Windows PowerShell:
Test-NetConnection -ComputerName localhost -Port 8000
Test-NetConnection -ComputerName localhost -Port 5500

# Check Environment Variables
echo $DATABASE_URL
echo $CORS_ALLOWED_ORIGINS


# ============================================
# ADMIN CREDENTIALS
# ============================================
# Email:    admin@altruria.local
# Password: AdminPass123
# URL:      http://localhost:8000/admin


# ============================================
# USEFUL URLS
# ============================================
# Frontend Home:        http://localhost:5500
# Products Page:        http://localhost:5500/pages/products.html
# Login Page:           http://localhost:5500/pages/login.html
# Cart Page:            http://localhost:5500/pages/cart.html
# API Products:         http://localhost:8000/api/products/
# Admin Panel:          http://localhost:8000/admin
# Django Home:          http://localhost:8000
# API Documentation:    http://localhost:8000/api/ (if browsable API is enabled)
