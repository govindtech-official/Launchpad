from django.urls import path
from .views import *

urlpatterns = [
    path('tpc-job-post-create/', JobPostView.as_view(), name='job-post-create'),
    path('tpc-job-post-list/', JobPostView.as_view(), name='job-post-list'),
    path('tpc-job-post-detail/<int:job_post_id>/', JobPostView.as_view(), name='job-post-detail'),
    path('tpc-job-post-update/<int:job_post_id>/', JobPostView.as_view(), name='job-post-update'),
    path('tpc-job-post-delete/<int:job_post_id>/', JobPostView.as_view(), name='job-post-delete'),
    path('tpc-job-application-create/', JobApplicationView.as_view(), name='job-application-create'),
    path('tpc-job-application-list/', JobApplicationView.as_view(), name='job-application-list'),
    
    path('tpc-notification-create/', TPCNotificationView.as_view(), name='tpc-notification-create'),
    path('tpc-notification-list/', TPCNotificationView.as_view(), name='tpc-notification-list'),
    path('tpc-notification-detail/<int:notification_id>/', TPCNotificationView.as_view(), name='tpc-notification-detail'),
    path('tpc-notification-update/<int:notification_id>/', TPCNotificationView.as_view(), name='tpc-notification-update'),
    path('tpc-notification-delete/<int:notification_id>/', TPCNotificationView.as_view(), name='tpc-notification-delete'),
]