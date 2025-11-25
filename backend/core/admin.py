from django.contrib import admin
from django.utils.html import format_html
from core.models import User, Product, Order, OrderItem, Message


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_admin', 'is_staff', 'created_at']
    list_filter = ['is_admin', 'is_staff', 'created_at']
    search_fields = ['username', 'email', 'mobile']
    readonly_fields = ['created_at', 'last_login']
    fieldsets = (
        ('Account', {'fields': ('username', 'email', 'password')}),
        ('Personal', {'fields': ('first_name', 'last_name', 'mobile', 'address')}),
        ('Permissions', {'fields': ('is_admin', 'is_staff', 'is_superuser', 'groups')}),
        ('Dates', {'fields': ('created_at', 'last_login')}),
    )


def product_image_thumbnail(obj):
    if obj.image:
        return format_html(
            '<img src="{}" width="50" height="50" style="border-radius: 4px;"/>',
            obj.image.url
        )
    return "No image"
product_image_thumbnail.short_description = 'Thumbnail'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'stock', product_image_thumbnail, 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Product Info', {'fields': ('name', 'category', 'price', 'stock')}),
        ('Details', {'fields': ('description', 'image')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_display', 'total', 'payment_method', 'status', 'delivery_method', 'created_at']
    list_filter = ['status', 'payment_method', 'delivery_method', 'created_at']
    search_fields = ['id', 'user__username', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Info', {'fields': ('id', 'user', 'status')}),
        ('Payment & Delivery', {'fields': ('payment_method', 'delivery_method', 'total')}),
        ('Shipping', {'fields': ('shipping_address',)}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )

    def user_display(self, obj):
        return f"{obj.user.username} ({obj.user.email})"
    user_display.short_description = 'Customer'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_display', 'sender', 'read', 'created_at', 'message_preview']
    list_filter = ['sender', 'read', 'created_at']
    search_fields = ['user__username', 'user__email', 'text']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Message Info', {'fields': ('user', 'sender', 'read')}),
        ('Content', {'fields': ('text',)}),
        ('Date', {'fields': ('created_at',)}),
    )

    def user_display(self, obj):
        return f"{obj.user.username} ({obj.user.email})"
    user_display.short_description = 'User'

    def message_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    message_preview.short_description = 'Message'
