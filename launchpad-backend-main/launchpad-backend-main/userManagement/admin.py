from django.contrib import admin
from .models import *

# Register your models here.
class TimestampedAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CustomUser)
class CustomUserAdmin(TimestampedAdmin):
    list_display = ('username', 'full_name', 'created_at')
    list_filter = ['is_active', 'is_verified', 'is_staff', 'is_tpcstaff', 'is_superuser']
    ordering = ['-created_at']
    search_fields = ['username']


@admin.register(AcademicDetail)
class AcademicDetailAdmin(TimestampedAdmin):
    list_display = ('roll_number', 'degree', 'branch', 'created_at')
    ordering = ['-created_at']
    search_fields = ['roll_number']

@admin.register(EducationDetail)
class EducationDetailAdmin(TimestampedAdmin):
    list_display = ('user', 'created_at')
    ordering = ['-created_at']
    search_fields = ['user']