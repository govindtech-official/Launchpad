from django.urls import path
from .views import TPCAnalyticsView

urlpatterns = [
    path('tpc-analytics/', TPCAnalyticsView.as_view(), name='tpc-analytics'),
]