from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterAPIView.as_view(), name='register'),
    path('auth/login/', views.LoginAPIView.as_view(), name='login'),
    path('auth/me/', views.MeAPIView.as_view(), name='me'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Products
    path('', include(router.urls)),

    # Orders
    path('orders/', views.OrderCreateAPIView.as_view(), name='order_create'),
    path('orders/user/<int:user_id>/', views.UserOrdersListAPIView.as_view(), name='user_orders'),
    path('orders/<str:order_id>/', views.OrderDetailAPIView.as_view(), name='order_detail'),
    path('orders/<str:order_id>/status/', views.OrderUpdateStatusAPIView.as_view(), name='order_update_status'),
    path('users/orders/', views.UserOrdersCurrentAPIView.as_view(), name='user_orders_current'),

    # Messages
    path('messages/', views.MessageCreateAPIView.as_view(), name='message_create'),
    path('messages/user/<int:user_id>/', views.UserMessagesListAPIView.as_view(), name='user_messages'),
    path('messages/admin/', views.AdminMessagesListAPIView.as_view(), name='admin_messages'),
]
