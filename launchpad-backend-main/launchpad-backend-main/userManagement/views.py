from .models import CustomUser
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomUserSerializer, UserDetailSerializer, UserUpdateSerializer

# Create your views here.


# --------------------------------------------User login api View----------------------------------------------- #

class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get('email')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user:
            if not user.is_active:
                return Response({"error": "Your account is not active. Contact admin for activation."}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            login(request, user)
            
            # Handle profile_picture safely
            profile_picture_url = None
            if user.profile_picture and hasattr(user.profile_picture, 'url'):
                profile_picture_url = user.profile_picture.url
            
            return Response({
                "message": "User logged in successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.username,
                    "full_name": user.full_name,
                    "phone_number": user.phone_number,
                    "father_name": user.father_name,
                    "dob": user.dob,
                    "profile_picture": profile_picture_url,
                    "gender": user.gender,
                    "alternate_email": user.alternate_email,
                    "github_link": user.github_link,
                    "linkedin_link": user.linkedin_link,
                    "is_verified": user.is_verified,
                    "is_superuser": user.is_superuser,
                    "is_staff": user.is_staff,
                    "is_tpcstaff": user.is_tpcstaff,
                    "created_at": user.created_at,
                    "updated_at": user.updated_at,
                }
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials!"}, status=status.HTTP_401_UNAUTHORIZED)


 #--------------------------------------------Logout api View----------------------------------------------- #


class LogoutView(APIView):
    def post(self, request):
        """
        Logout user by blacklisting the refresh token
        """
        try:
            refresh_token = request.data.get("refresh")
            
            # Validate that refresh token is provided
            if not refresh_token:
                return Response({
                    "error": "Refresh token is required",
                    "detail": "Please provide a valid refresh token in the request body"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate and blacklist the token
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                return Response({
                    "message": "User logged out successfully",
                    "detail": "Refresh token has been blacklisted"
                }, status=status.HTTP_200_OK)
                
            except Exception as token_error:
                return Response({
                    "error": "Invalid refresh token",
                    "detail": "The provided refresh token is invalid or expired"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "error": "An error occurred during logout",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#--------------------------------------------Token Refresh View----------------------------------------------- #

# class TokenRefreshView(APIView):
#     def post(self, request):
#         """
#         Get a new access token using refresh token
#         """
#         try:
#             refresh_token = request.data.get("refresh")
            
#             # Validate that refresh token is provided
#             if not refresh_token:
#                 return Response({
#                     "error": "Refresh token is required",
#                     "detail": "Please provide a valid refresh token in the request body"
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Validate and generate new access token
#             try:
#                 token = RefreshToken(refresh_token)
                
#                 # Check if token is blacklisted
#                 if token.blacklist():
#                     return Response({
#                         "error": "Token is blacklisted",
#                         "detail": "This refresh token has been invalidated"
#                     }, status=status.HTTP_401_UNAUTHORIZED)
                
#                 # Generate new access token
#                 new_access_token = token.access_token
                
#                 return Response({
#                     "message": "New access token generated successfully",
#                     "access": str(new_access_token),
#                     "refresh": str(token),  # Return the same refresh token
#                     "token_type": "Bearer",
#                     "expires_in": 3600  # 1 hour in seconds
#                 }, status=status.HTTP_200_OK)
                
#             except Exception as token_error:
#                 return Response({
#                     "error": "Invalid refresh token",
#                     "detail": "The provided refresh token is invalid or expired"
#                 }, status=status.HTTP_401_UNAUTHORIZED)
                
#         except Exception as e:
#             return Response({
#                 "error": "An error occurred during token refresh",
#                 "detail": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#--------------------------------------------Non TPC Staff List View----------------------------------------------- #

class StudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get list of all users whose is_tpcstaff is False
        """

        if not request.user.is_tpcstaff:
            return Response({
                "error": "You are not authorized to access this resource",
                "detail": "Only TPC staff users can access this resource"
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            # Filter users where is_tpcstaff is False
            students = CustomUser.objects.filter(is_tpcstaff=False)
            
            # Serialize the queryset with academic and educational details
            serializer = UserDetailSerializer(students, many=True)
            
            return Response({
                "message": "Non TPC staff users retrieved successfully",
                "count": len(serializer.data),
                "users": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "An error occurred while retrieving users",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#--------------------------------------------User Detail View----------------------------------------------- #

class UserDetailView(APIView):
    def get(self, request, user_id):
        """
        Get user by ID with complete data including academic and educational details
        """
        
        try:
            # Validate user_id is a valid integer
            if not isinstance(user_id, int):
                return Response({
                    "error": f"Invalid user ID format. Expected integer, got: {type(user_id).__name__}",
                    "detail": f"User ID '{user_id}' is not a valid integer"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user by ID
            user = CustomUser.objects.get(id=user_id)
            
            # Serialize the user with complete details
            serializer = UserDetailSerializer(user)
            
            return Response({
                "message": "User details retrieved successfully",
                "user": serializer.data
            }, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response({
                "error": f"User with ID '{user_id}' does not exist",
                "detail": "The requested user was not found in the database"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": "An error occurred while retrieving user details",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#--------------------------------------------User Update View----------------------------------------------- #

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """
        Update user's own profile information
        Users can only update their own profile, not others'
        """
        
        try:
            # Get the current authenticated user
            user = request.user
            
            # Serialize the user data for update
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                # Save the updated user
                serializer.save()
                
                # Return the updated user data
                updated_user = CustomUser.objects.get(id=user.id)
                user_detail_serializer = UserDetailSerializer(updated_user)
                
                return Response({
                    "message": "Profile updated successfully",
                    "user": user_detail_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Invalid data provided",
                    "detail": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "error": "An error occurred while updating profile",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        """
        Partial update of user's own profile information
        """
        return self.put(request)