from django.urls import path
from .views import *

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # path('token-refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('get-studentlist/', StudentListView.as_view(), name='student-list'),
    path('get-user-detail/<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('update-profile/', UserUpdateView.as_view(), name='update-profile'),
]