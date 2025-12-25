from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404

# Create your views here.

class JobPostView(APIView):
    serializer_class = JobPostSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPost.objects.all()  # type: ignore

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not self.request.user.is_tpcstaff:
            return Response(
                {"error": "You are not authorized to make job posts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, job_post_id):
        if not self.request.user.is_tpcstaff:
            return Response(
                {"error": "You are not authorized to update job posts."}, 
                status=status.HTTP_403_FORBIDDEN
                )
        job_post = get_object_or_404(JobPost, id=job_post_id)
        serializer = self.serializer_class(job_post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, job_post_id):
        if not self.request.user.is_tpcstaff:
            return Response(
                    {"error": "You are not authorized to delete job posts."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        job_post = get_object_or_404(JobPost, id=job_post_id)
        job_post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class JobApplicationView(APIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_tpcstaff:
            return JobApplication.objects.all()  # type: ignore
        return JobApplication.objects.filter(student=self.request.user)  # type: ignore

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class TPCNotificationView(APIView):
    serializer_class = TPCNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TPCNotification.objects.all()  # type: ignore

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not self.request.user.is_tpcstaff:
            return Response(
                {"error": "You are not authorized to create notifications."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, notification_id):
        if not self.request.user.is_tpcstaff:
            return Response(
                {"error": "You are not authorized to update notifications."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        notification = get_object_or_404(TPCNotification, id=notification_id)
        serializer = self.serializer_class(notification, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, notification_id):
        if not self.request.user.is_tpcstaff:
            return Response(
                {"error": "You are not authorized to delete notifications."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        notification = get_object_or_404(TPCNotification, id=notification_id)
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)