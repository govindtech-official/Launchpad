from rest_framework import serializers
from .models import *


class JobPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPost
        fields = '__all__'


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'


class TPCNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TPCNotification
        fields = '__all__'