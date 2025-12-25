from django.contrib import admin
from .models import *

# Register your models here.
class TimestampedAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')


@admin.register(JobPost)
class JobPostAdmin(TimestampedAdmin):
    list_display = ('comapany_name', 'offered_position', 'created_at')
    ordering = ['-created_at']
    search_fields = ['comapany_name']


@admin.register(JobApplication)
class JobApplicationAdmin(TimestampedAdmin):
    list_display = ('student', 'job_post', 'created_at')
    ordering = ['-created_at']
    search_fields = ['student']


@admin.register(TPCNotification)
class TPCNotificationAdmin(TimestampedAdmin):
    list_display = ('title', 'created_at')
    ordering = ['-created_at']
    search_fields = ['title']