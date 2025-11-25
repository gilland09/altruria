from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config


class Command(BaseCommand):
    help = 'Create or update admin user from ADMIN_EMAIL / ADMIN_PASSWORD environment variables'

    def handle(self, *args, **options):
        User = get_user_model()
        email = config('ADMIN_EMAIL', default='admin@altruria.local')
        password = config('ADMIN_PASSWORD', default='AdminPass123')

        if not email or not password:
            self.stdout.write(self.style.ERROR('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment'))
            return

        try:
            user = User.objects.filter(email=email).first()
            if user:
                user.is_active = True
                user.is_staff = True
                user.is_superuser = True
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Updated existing admin: {email}'))
            else:
                user = User.objects.create_user(email=email, password=password)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created new admin: {email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating/updating admin: {e}'))
