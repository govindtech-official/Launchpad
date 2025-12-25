from django.contrib import admin
from .models import *

# Register your models here.
class TimestampedAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StudentSkill)
class StudentSkillAdmin(TimestampedAdmin):
    list_display = ('related_user', 'skill_name', 'created_at')
    ordering = ['-created_at']
    search_fields = ['related_user']


@admin.register(StudentProject)
class StudentProjectAdmin(TimestampedAdmin):
    list_display = ('related_user', 'project_title', 'created_at')
    ordering = ['-created_at']
    search_fields = ['related_user']


@admin.register(StudentResume)
class StudentRsumeAdmin(TimestampedAdmin):
    list_display = ('related_user', 'created_at')
    ordering = ['-created_at']
    search_fields = ['related_user']

@admin.register(StudentInternship)
class StudentInternshipAdmin(TimestampedAdmin):
    list_display = ('student', 'organization_name', 'domain', 'internship_duration', 'approval_status', 'created_at')
    ordering = ['-created_at']
    list_filter = ['approval_status']
    search_fields = ['student']