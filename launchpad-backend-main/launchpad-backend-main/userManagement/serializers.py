from .models import *
from rest_framework import serializers

# Serializer for CustomUser
class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'username', 'full_name', 'password', 'phone_number', 'father_name', 'profile_picture', 'dob', 'gender', 'alternate_email', 
            'github_link', 'linkedin_link', 'is_verified', 'is_superuser', 'is_staff', 'is_tpcstaff', 'created_at', 'updated_at'
        )

    def get_profile_picture(self, obj):
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return obj.profile_picture.url
        return None

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        return user


# Update serializer for user profile updates
class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = (
            'full_name', 'phone_number', 'father_name', 'profile_picture', 'dob', 'gender', 
            'alternate_email', 'github_link', 'linkedin_link'
        )
        read_only_fields = ('username', 'is_verified', 'is_superuser', 'is_staff', 'is_tpcstaff', 'created_at', 'updated_at')

    def validate_phone_number(self, value):
        if value and len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits long.")
        return value

    def validate_github_link(self, value):
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("GitHub link must be a valid URL starting with http:// or https://")
        return value

    def validate_linkedin_link(self, value):
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("LinkedIn link must be a valid URL starting with http:// or https://")
        return value


# Comprehensive serializer that includes all user details with related data
class UserDetailSerializer(serializers.ModelSerializer):
    academic_details = serializers.SerializerMethodField()
    education_details = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'full_name', 'phone_number', 'father_name', 'dob', 'gender', 'profile_picture', 'alternate_email', 
            'github_link', 'linkedin_link', 'is_verified', 'is_superuser', 'is_staff', 'is_tpcstaff', 'created_at', 'updated_at',
            'academic_details', 'education_details'
        )

    def get_profile_picture(self, obj):
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return obj.profile_picture.url
        return None

    def get_academic_details(self, obj):
        try:
            academic_detail = obj.academic_details
            return {
                'roll_number': academic_detail.roll_number,
                'degree': academic_detail.degree,
                'branch': academic_detail.branch,
                'semester': academic_detail.semester,
                'batch': academic_detail.batch,
                'cpi': academic_detail.cpi,
                'created_at': academic_detail.created_at,
                'updated_at': academic_detail.updated_at
            }
        except:
            return None

    def get_education_details(self, obj):
        try:
            education_detail = obj.education_details
            return {
                'matriculation_school_name': education_detail.matriculation_school_name,
                'matriculation_board': education_detail.matriculation_board,
                'matriculation_year': education_detail.matriculation_year,
                'matriculation_percentage': education_detail.matriculation_percentage,
                'intermediate_school_name': education_detail.intermediate_school_name,
                'intermediate_board': education_detail.intermediate_board,
                'intermediate_year': education_detail.intermediate_year,
                'intermediate_percentage': education_detail.intermediate_percentage,
                'diploma_details': education_detail.diploma_details,
                'created_at': education_detail.created_at,
                'updated_at': education_detail.updated_at
            }
        except:
            return None


class AcademicDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicDetail
        fields = '__all__'


class EducationDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationDetail
        fields = '__all__'