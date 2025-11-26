#!/usr/bin/env python
"""
PythonAnywhere Backend Validation Script
Run this on PythonAnywhere to verify database, products, and settings
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'altruria_project.settings')
django.setup()

from django.conf import settings
from core.models import Product, User

def main():
    print("=" * 60)
    print("ALTRURIA BACKEND VALIDATION - PythonAnywhere")
    print("=" * 60)
    print()
    
    # Check DEBUG setting
    print("1. Django Settings:")
    print(f"   DEBUG: {settings.DEBUG}")
    print(f"   ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"   CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
    print()
    
    # Check Database
    print("2. Database Configuration:")
    db = settings.DATABASES['default']
    print(f"   Engine: {db['ENGINE']}")
    print(f"   Name: {db['NAME']}")
    print(f"   Host: {db['HOST']}")
    print(f"   User: {db['USER']}")
    print()
    
    # Test database connection
    print("3. Database Connection:")
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("   ✅ MySQL connection successful")
    except Exception as e:
        print(f"   ❌ MySQL connection failed: {e}")
        sys.exit(1)
    print()
    
    # Check Products
    print("4. Products Count:")
    try:
        product_count = Product.objects.count()
        print(f"   Total Products: {product_count}")
        if product_count == 0:
            print("   ⚠️  No products found. Run: python manage.py seed_data")
        else:
            print("   ✅ Products loaded")
            # Show sample products
            print("\n   Sample Products:")
            for p in Product.objects.all()[:3]:
                print(f"   - {p.name} ({p.category}) - ₱{p.price}")
    except Exception as e:
        print(f"   ❌ Error querying products: {e}")
    print()
    
    # Check Users
    print("5. Users Count:")
    try:
        user_count = User.objects.count()
        admin_count = User.objects.filter(is_admin=True).count()
        print(f"   Total Users: {user_count}")
        print(f"   Admin Users: {admin_count}")
        if admin_count == 0:
            print("   ⚠️  No admin user. Run: python manage.py createsuperuser")
        else:
            print("   ✅ Admin user exists")
    except Exception as e:
        print(f"   ❌ Error querying users: {e}")
    print()
    
    # Check Static Files
    print("6. Static Files:")
    static_root = settings.STATIC_ROOT
    print(f"   STATIC_ROOT: {static_root}")
    if os.path.exists(static_root):
        file_count = sum(len(files) for _, _, files in os.walk(static_root))
        print(f"   Files collected: {file_count}")
        if file_count > 0:
            print("   ✅ Static files collected")
        else:
            print("   ⚠️  No static files. Run: python manage.py collectstatic --noinput")
    else:
        print("   ⚠️  Static directory doesn't exist. Run: python manage.py collectstatic --noinput")
    print()
    
    # Summary
    print("=" * 60)
    print("VALIDATION COMPLETE")
    print("=" * 60)
    print()
    print("Next Steps:")
    print("1. Configure PythonAnywhere Web Tab:")
    print("   - Source: /home/gillandsabile09/backend")
    print("   - Virtualenv: /home/gillandsabile09/backend/venv")
    print("   - Static: /static/ → /home/gillandsabile09/backend/staticfiles")
    print("   - Media: /media/ → /home/gillandsabile09/backend/media")
    print()
    print("2. Click 'Reload' button in Web tab")
    print()
    print("3. Test API:")
    print("   https://gillandsabile09.pythonanywhere.com/api/products/")
    print()

if __name__ == '__main__':
    main()
