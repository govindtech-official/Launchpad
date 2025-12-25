from django.db import models
from django.utils.html import MAX_URL_LENGTH
from userManagement.models import CustomUser

# Create your models here.

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        abstract = True


class StudentSkill(BaseModel):
    related_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='related_user_skills')
    skill_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.skill_name}"


class StudentProject(BaseModel):
    related_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='related_user_projects')
    project_title = models.CharField(max_length=200)
    project_web_link = models.URLField(blank=True, null=True)
    project_github_link = models.URLField(blank=True, null=True)
    project_summary = models.TextField(blank=True, null=True)
    skills_involved = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.project_title}"


class StudentResume(BaseModel):
    related_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='related_user_resumes')
    resume_file = models.FileField(upload_to='resumes/')
    is_default = models.BooleanField(default=False) # type: ignore

    def __str__(self):
        return f"{self.related_user}"


class StudentInternship(BaseModel):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='student_internships')
    organization_name = models.CharField(max_length=255)
    domain = models.CharField(max_length=100)
    internship_duration = models.CharField(max_length=100)
    internship_description = models.TextField()
    certificate = models.FileField(upload_to='internships-certificate/', blank=True, null=True)
    experience_letter = models.FileField(upload_to='internships-experience-letter/', blank=True, null=True)
    approval_status = models.CharField(max_length=100, default='Pending') # type: ignore
    approved_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='approved_internships', null=True, blank=True, limit_choices_to={'is_tpcstaff': True})

    def __str__(self):
        return f"{self.student} - {self.organization_name}"