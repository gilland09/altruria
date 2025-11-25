from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import authenticate
import uuid

from core.models import User, Product, Order, OrderItem, Message
from core.serializers import (
    UserSerializer, RegisterSerializer, ProductSerializer,
    OrderSerializer, OrderItemSerializer, MessageSerializer
)


class IsAdmin(permissions.BasePermission):
    """Custom permission to check if user is admin."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class RegisterAPIView(APIView):
    """
    POST /api/auth/register
    Create a new user account.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'User registered successfully', 'user': UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    """
    POST /api/auth/login
    Authenticate user and return JWT tokens.
    Expects: {email, password}
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Authenticate user
        if not user.check_password(password):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class MeAPIView(APIView):
    """
    GET /api/auth/me - Retrieve authenticated user profile.
    PUT /api/auth/me - Update authenticated user profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations.
    - List & retrieve: AllowAny
    - Create, update, destroy: AdminOnly
    - Search by ?q= and filter by ?category=
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'price']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdmin]
        else:
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class OrderCreateAPIView(APIView):
    """
    POST /api/orders/
    Create a new order (requires authentication).
    Expects: {payment_method, shipping_address, delivery_method, items: [{product_id, quantity}]}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        payment_method = request.data.get('payment_method')
        shipping_address = request.data.get('shipping_address')
        delivery_method = request.data.get('delivery_method', 'delivery')
        items_data = request.data.get('items', [])

        if not payment_method or not shipping_address or not items_data:
            return Response(
                {'error': 'payment_method, shipping_address, and items are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate unique order ID
        order_id = f"ORD-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        total = 0
        order_items = []

        for item in items_data:
            product_id = item.get('product_id')
            quantity = item.get('quantity')

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {'error': f'Product {product_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if quantity <= 0:
                return Response(
                    {'error': 'Quantity must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            total += product.price * quantity
            order_items.append({'product': product, 'quantity': quantity, 'price': product.price})

        order = Order.objects.create(
            id=order_id,
            user=user,
            total=total,
            payment_method=payment_method,
            shipping_address=shipping_address,
            delivery_method=delivery_method,
            status='pending'
        )

        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['price']
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserOrdersListAPIView(APIView):
    """
    GET /api/orders/user/<user_id>/
    Retrieve all orders for a specific user (auth required, user or admin).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = request.user
        if user.id != int(user_id) and not user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        orders = Order.objects.filter(user_id=user_id)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailAPIView(APIView):
    """
    GET /api/orders/<order_id>/
    Retrieve a specific order (auth required, owner or admin).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        if request.user.id != order.user.id and not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class OrderUpdateStatusAPIView(APIView):
    """
    PUT /api/orders/<order_id>/status/
    Update order status (admin only).
    Expects: {status: 'pending'|'paid'|'shipped'|'completed'|'cancelled'}
    """
    permission_classes = [IsAdmin]

    def put(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get('status')

        if new_status not in dict(Order.STATUS_CHOICES).keys():
            return Response(
                {'error': f'Invalid status. Choose from: {", ".join(dict(Order.STATUS_CHOICES).keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)


class UserOrdersCurrentAPIView(APIView):
    """
    GET /api/users/orders/
    Retrieve all orders for the authenticated user (auth required).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class MessageCreateAPIView(APIView):
    """
    POST /api/messages/
    Create a new message (auth required).
    Expects: {text}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        text = request.data.get('text')

        if not text:
            return Response(
                {'error': 'text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = Message.objects.create(
            user=user,
            sender='user',
            text=text
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserMessagesListAPIView(APIView):
    """
    GET /api/messages/user/<user_id>/
    Retrieve all messages for a user (auth required, owner or admin).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = request.user
        if user.id != int(user_id) and not user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = Message.objects.filter(user_id=user_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class AdminMessagesListAPIView(APIView):
    """
    GET /api/messages/admin/
    Retrieve all unread messages (admin only).
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        messages = Message.objects.filter(read=False)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def put(self, request):
        """Mark message as read."""
        message_id = request.data.get('message_id')
        message = get_object_or_404(Message, id=message_id)
        message.read = True
        message.save()
        serializer = MessageSerializer(message)
        return Response(serializer.data)
