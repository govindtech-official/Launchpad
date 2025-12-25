from django.urls import path
from .views import *

urlpatterns = [
    path('student-skills/', SkillView.as_view(), name='student-skills'),
    path('student-projects/', ProjectView.as_view(), name='student-projects'),
    path('student-projects/<int:project_id>/', ProjectView.as_view(), name='student-projects-detail'),
    path('student-resume/', StudentResumeView.as_view(), name='student-resume'),
    path('student-resume/<int:resume_id>/', StudentResumeView.as_view(), name='student-resume-detail'),
    path('student-internships/', StudentInternshipView.as_view(), name='student-internships'),
    path('student-internships/<int:internship_id>/', StudentInternshipView.as_view(), name='student-internship-detail'),
]