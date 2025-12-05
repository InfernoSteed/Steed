"""
Views for user authentication and account management.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    ChangePasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Register a new user account.

    Creates a new user and automatically creates their character profile.
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    @extend_schema(
        request=UserRegistrationSerializer,
        responses={201: UserSerializer},
        description="Register a new user account"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create character for user (will be done via signal in core app)

        return Response(
            {
                'user': UserSerializer(user).data,
                'message': 'User registered successfully'
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'username': {'type': 'string'},
                'password': {'type': 'string'}
            }
        }
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'access_token': {'type': 'string'},
                'refresh_token': {'type': 'string'},
                'user': UserSerializer
            }
        }
    },
    description="Login and receive JWT tokens"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login with username and password.

    Returns JWT access and refresh tokens.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user exists
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Check if account is locked
    if user.is_locked:
        return Response(
            {
                'error': 'Account temporarily locked due to too many failed login attempts',
                'locked_until': user.locked_until
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Authenticate
    user = authenticate(username=username, password=password)

    if user is None:
        # Record failed login
        try:
            user = User.objects.get(username=username)
            user.record_failed_login()
        except User.DoesNotExist:
            pass

        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Reset failed login attempts
    user.reset_failed_logins()

    # Update last login IP
    ip_address = request.META.get('REMOTE_ADDR')
    if ip_address:
        user.ip_address = ip_address
        user.save(update_fields=['ip_address'])

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': UserSerializer(user).data
    })


@extend_schema(
    responses={200: UserSerializer},
    description="Get current user's profile"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current authenticated user's profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class ChangePasswordView(generics.UpdateAPIView):
    """
    Change user password.

    Requires current password and new password.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: {'type': 'object', 'properties': {'message': {'type': 'string'}}}},
        description="Change user password"
    )
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'message': 'Password updated successfully'},
            status=status.HTTP_200_OK
        )
