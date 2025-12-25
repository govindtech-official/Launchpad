from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *

# Create your views here.

class SkillView(APIView):
    serializer_class = StudentSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only used internally, not by DRF generics
        return StudentSkill.objects.filter(related_user=self.request.user)  # type: ignore

    def get(self, request):
        """Get skills: students see their own, TPC staff can filter by user id"""
        if request.user.is_tpcstaff:
            user_id = request.query_params.get('user_id')
            if user_id:
                queryset = StudentSkill.objects.filter(related_user__id=user_id) # type: ignore
            else:
                queryset = StudentSkill.objects.all() # type: ignore
        else:
            queryset = StudentSkill.objects.filter(related_user=request.user) # type: ignore
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(related_user=self.request.user)

class ProjectView(APIView):
    serializer_class = StudentProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudentProject.objects.filter(related_user=self.request.user)  # type: ignore

    def get(self, request):
        """Get projects: students see their own, TPC staff can filter by user id"""
        if request.user.is_tpcstaff:
            user_id = request.query_params.get('user_id')
            if user_id:
                queryset = StudentProject.objects.filter(related_user__id=user_id) # type: ignore
            else:
                queryset = StudentProject.objects.all() # type: ignore
        else:
            queryset = StudentProject.objects.filter(related_user=request.user) # type: ignore
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create new project - only students can create"""
        if request.user.is_tpcstaff:
            return Response(
                {"error": "TPC staff cannot create projects"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(related_user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id=None):
        """Delete project - students can delete their own, TPC staff can delete any"""
        if not project_id:
            return Response(
                {"error": "Project ID is required for deletion"},
                status=status.HTTP_400_BAD_REQUEST
            )
        project = get_object_or_404(StudentProject, id=project_id)
        if not request.user.is_tpcstaff and project.related_user != request.user:
            return Response(
                {"error": "You can only delete your own projects"},
                status=status.HTTP_403_FORBIDDEN
            )
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        serializer.save(related_user=self.request.user)

class StudentResumeView(APIView):
    serializer_class = StudentResumeSerializer
    permission_classes = [IsAuthenticated]
    MAX_RESUMES_PER_USER = 4

    def get_queryset(self):
        if self.request.user.is_tpcstaff:
            return StudentResume.objects.filter(is_default=True)  # type: ignore
        else:
            return StudentResume.objects.filter(related_user=self.request.user)  # type: ignore

    def get(self, request, resume_id=None):
        """Get resumes - TPC staff see default resumes, students see only their own"""
        if resume_id:
            # Get specific resume
            resume = get_object_or_404(StudentResume, id=resume_id)
            # Students can only view their own resumes
            if not request.user.is_tpcstaff and resume.related_user != request.user:
                return Response(
                    {"error": "You can only view your own resumes"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = self.serializer_class(resume)
            return Response(serializer.data)
        else:
            # Get all resumes (filtered by user role)
            queryset = self.get_queryset()
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)

    def post(self, request):
        """Create new resume - check 4-resume limit for students"""
        if request.user.is_tpcstaff:
            return Response(
                {"error": "TPC staff cannot create resumes"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user has already reached the maximum limit
        current_resume_count = StudentResume.objects.filter(related_user=request.user).count()  # type: ignore
        if current_resume_count >= self.MAX_RESUMES_PER_USER:
            return Response(
                {
                    "error": f"You have reached the maximum limit of {self.MAX_RESUMES_PER_USER} resumes. Please delete an existing resume before uploading a new one.",
                    "current_count": current_resume_count,
                    "max_limit": self.MAX_RESUMES_PER_USER
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Check if this is the user's first resume
            is_first_resume = current_resume_count == 0
            
            # Save the resume with is_default=True if it's the first resume
            resume = serializer.save(related_user=request.user, is_default=is_first_resume)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, resume_id):
        """Update resume - students can update their own, TPC staff can update any"""
        resume = get_object_or_404(StudentResume, id=resume_id)
        
        # Students can only update their own resumes
        if not request.user.is_tpcstaff and resume.related_user != request.user:
            return Response(
                {"error": "You can only update your own resumes"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.serializer_class(resume, data=request.data, partial=True)
        if serializer.is_valid():
            # Check if the user is trying to set this resume as default
            is_default = request.data.get('is_default', False)
            
            if is_default:
                # If setting this resume as default, set all other resumes of this user to non-default
                StudentResume.objects.filter(  # type: ignore
                    related_user=request.user,
                    is_default=True
                ).exclude(id=resume_id).update(is_default=False)
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, resume_id):
        """Delete resume - students can delete their own, TPC staff can delete any"""
        resume = get_object_or_404(StudentResume, id=resume_id)
        
        # Students can only delete their own resumes
        if not request.user.is_tpcstaff and resume.related_user != request.user:
            return Response(
                {"error": "You can only delete your own resumes"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        resume.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class StudentInternshipView(APIView):
    serializer_class = StudentInternshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_tpcstaff:
            if self.request.query_params.get('user_id'):
                return StudentInternship.objects.filter(student__id=self.request.query_params.get('user_id'))  # type: ignore
            return StudentInternship.objects.all()  # type: ignore
        else:
            return StudentInternship.objects.filter(student=self.request.user)  # type: ignore

    def get(self, request, internship_id=None):
        """Get internships - TPC staff see all, students see only their own"""
        if internship_id:
            # Get specific internship
            internship = get_object_or_404(StudentInternship, id=internship_id)
            # Students can only view their own internships
            if not request.user.is_tpcstaff and internship.student != request.user:
                return Response(
                    {"error": "You can only view your own internships"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = self.serializer_class(internship)
            return Response(serializer.data)
        else:
            # Get all internships (filtered by user role)
            queryset = self.get_queryset()
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)

    def post(self, request):
        """Create new internship - only students can create"""
        if request.user.is_tpcstaff:
            return Response(
                {"error": "TPC staff cannot create internships"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, internship_id):
        """Approve internship - only TPC staff can approve"""
        if not request.user.is_tpcstaff:
            return Response(
                {"error": "Only TPC staff can approve internships"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        internship = get_object_or_404(StudentInternship, id=internship_id)
        
        # Check if approval status is being updated
        approval_status = request.data.get('approval_status')
        if approval_status is None:
            return Response(
                {"error": "approval_status field is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        internship.approval_status = "Approved" or "Rejected"
        internship.approved_by = request.user
        internship.save()
        
        serializer = self.serializer_class(internship)
        return Response(serializer.data)

    def put(self, request, internship_id):
        """Update internship - students can update their own, TPC staff can update any"""
        internship = get_object_or_404(StudentInternship, id=internship_id)
        
        # Students can only update their own internships
        if not request.user.is_tpcstaff and internship.student != request.user:
            return Response(
                {"error": "You can only update your own internships"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.serializer_class(internship, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, internship_id):
        """Delete internship - students can delete their own, TPC staff can delete any"""
        internship = get_object_or_404(StudentInternship, id=internship_id)
        
        # Students can only delete their own internships
        if not request.user.is_tpcstaff and internship.student != request.user:
            return Response(
                {"error": "You can only delete your own internships"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        internship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)