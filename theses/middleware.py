"""
Custom middleware for debugging
"""

class DebugCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/auth/'):
            print(f"=== Request to {request.path} ===")
            print(f"Cookies received: {request.COOKIES}")
            print(f"User authenticated: {request.user.is_authenticated}")
            print(f"Session key: {request.session.session_key}")
            
        response = self.get_response(request)
        return response
