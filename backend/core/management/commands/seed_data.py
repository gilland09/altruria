from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Product
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample data (admin user and products)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))

        # Create admin user
        admin_email = config('ADMIN_EMAIL', default='admin@altruria.local')
        admin_password = config('ADMIN_PASSWORD', default='AdminPass123')

        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email=admin_email,
                password=admin_password,
                is_admin=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'✓ Admin user created: {admin_email}')
            )
        else:
            self.stdout.write(self.style.WARNING('✓ Admin user already exists'))

        # Sample products
        sample_products = [
            {
                'name': 'Organic Chicken Breast',
                'category': 'meats',
                'price': 280.00,
                'description': 'Fresh, hormone-free chicken breast from our farm. Perfect for grilling or baking.',
                'stock': 50,
            },
            {
                'name': 'Grass-Fed Beef Ribeye',
                'category': 'meats',
                'price': 650.00,
                'description': 'Premium grass-fed beef ribeye steak. Tender and flavorful.',
                'stock': 30,
            },
            {
                'name': 'Free-Range Pork Chops',
                'category': 'meats',
                'price': 320.00,
                'description': 'Juicy pork chops from our free-range animals. Great for family meals.',
                'stock': 45,
            },
            {
                'name': 'Fresh Farm Eggs',
                'category': 'meats',
                'price': 150.00,
                'description': 'Dozen fresh eggs from pasture-raised hens. Rich in nutrients.',
                'stock': 100,
            },
            {
                'name': 'Organic Leafy Greens Mix',
                'category': 'vegetables',
                'price': 120.00,
                'description': 'Fresh mixed organic greens including lettuce, spinach, and kale.',
                'stock': 60,
            },
            {
                'name': 'Heirloom Tomatoes',
                'category': 'vegetables',
                'price': 180.00,
                'description': 'Colorful heirloom tomatoes with rich flavor. Perfect for salads.',
                'stock': 40,
            },
            {
                'name': 'Organic Bell Peppers',
                'category': 'vegetables',
                'price': 90.00,
                'description': 'Sweet bell peppers in red, yellow, and green. Great for cooking.',
                'stock': 70,
            },
            {
                'name': 'Fresh Carrots',
                'category': 'vegetables',
                'price': 85.00,
                'description': 'Sweet and crunchy carrots from our farm. Perfect for cooking or snacking.',
                'stock': 80,
            },
            {
                'name': 'Organic Broccoli',
                'category': 'vegetables',
                'price': 110.00,
                'description': 'Fresh, vibrant green broccoli. Nutrient-packed and delicious.',
                'stock': 50,
            },
            {
                'name': 'Seasonal Root Vegetables Bundle',
                'category': 'vegetables',
                'price': 200.00,
                'description': 'Mix of potatoes, beets, and turnips. Perfect for autumn cooking.',
                'stock': 35,
            },
        ]

        created_count = 0
        for product_data in sample_products:
            if not Product.objects.filter(name=product_data['name']).exists():
                Product.objects.create(**product_data)
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'✓ {created_count} products created')
        )
        self.stdout.write(self.style.SUCCESS('\n✓ Data seeding completed successfully!'))
