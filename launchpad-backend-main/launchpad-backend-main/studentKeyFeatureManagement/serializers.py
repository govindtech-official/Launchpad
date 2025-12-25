from rest_framework import serializers
from .models import *


class StudentSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSkill
        fields = '__all__'


class StudentProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProject
        fields = ['id', 'project_title', 'project_web_link', 'project_github_link', 'project_summary', 'skills_involved', 'created_at', 'updated_at']


class StudentResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentResume
        fields = '__all__'

class StudentInternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentInternship
        fields = ['id', 'organization_name', 'domain', 'internship_duration', 'internship_description', 'certificate', 'experience_letter', 'approval_status', 'approved_by', 'created_at', 'updated_at']