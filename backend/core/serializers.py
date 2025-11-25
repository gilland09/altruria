from rest_framework import serializers
from core.models import User, Product, Order, OrderItem, Message
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - excludes password."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_admin', 'mobile', 'address', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password validation."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'mobile', 'address']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model with image support."""
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price', 'description', 'image', 'stock', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model with product details."""
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True, source='product')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price']
        read_only_fields = ['id', 'price']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model with nested items."""
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user_email', 'total', 'payment_method', 'status', 'shipping_address', 'delivery_method', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = self.context.get('items', [])
        order = Order.objects.create(**validated_data)
        total = 0

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            price = product.price
            total += price * quantity
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price=price)

        order.total = total
        order.save()
        return order


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user_email', 'sender', 'text', 'read', 'created_at']
        read_only_fields = ['id', 'created_at']
