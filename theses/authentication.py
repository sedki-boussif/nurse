"""
Custom authentication for session token
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.utils import timezone


class SessionTokenAuthentication(BaseAuthentication):
    """
    Authenticate using session token in Authorization header
    """
    def authenticate(self, request):
        # Try to get token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Token '):
            return None
        
        token = auth_header.replace('Token ', '')
        
        try:
            # Get session
            session = Session.objects.get(session_key=token, expire_date__gte=timezone.now())
            user_id = session.get_decoded().get('_auth_user_id')
            
            if not user_id:
                return None
            
            user = User.objects.get(pk=user_id)
            return (user, token)
            
        except (Session.DoesNotExist, User.DoesNotExist):
            return None
    
    def authenticate_header(self, request):
        return 'Token'
