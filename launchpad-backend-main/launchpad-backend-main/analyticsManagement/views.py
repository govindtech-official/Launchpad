from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from userManagement.models import CustomUser, AcademicDetail
from studentKeyFeatureManagement.models import StudentInternship
from studentKeyFeatureManagement.models import StudentResume
from TPCActionCentreManagement.models import JobApplication
from django.db.models import Count, Avg, Q
import datetime

class TPCAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_tpcstaff:
            return Response({"error": "Access denied"}, status=403)

        # Skill Distribution (if you add skill model later, currently dummy)
        # skill_data = Skill.objects.values('name').annotate(count=Count('students'))

        # CPI Distribution
        cpi_distribution = AcademicDetail.objects.values('cpi').annotate(count=Count('id')).order_by('cpi')  # type: ignore

        # Internship Domains
        internship_domains = StudentInternship.objects.filter(is_approved=True) \
            .values('domain').annotate(count=Count('id')).order_by('-count')  # type: ignore

        # Resume Uploads Stats
        resume_stats = StudentResume.objects.values('student').annotate(total=Count('id')).values('total') \
            .annotate(count=Count('student')).order_by('total')  # type: ignore

        # GitHub / LinkedIn completeness
        github_complete = CustomUser.objects.filter(~Q(external_links_github='') & ~Q(external_links_github__isnull=True)).count()  # type: ignore
        linkedin_complete = CustomUser.objects.filter(~Q(external_links_linkedin='') & ~Q(external_links_linkedin__isnull=True)).count()  # type: ignore

        # Job Applications over time
        applications_trend = JobApplication.objects.extra({'date': "date(created_at)"}) \
            .values('date').annotate(count=Count('id')).order_by('date')  # type: ignore

        # Project domains (if project model added, use it here)

        return Response({
            "cpi_distribution": list(cpi_distribution),
            "internship_domains": list(internship_domains),
            "resume_uploads_stats": list(resume_stats),
            "github_complete": github_complete,
            "linkedin_complete": linkedin_complete,
            "job_applications_trend": list(applications_trend),
        })