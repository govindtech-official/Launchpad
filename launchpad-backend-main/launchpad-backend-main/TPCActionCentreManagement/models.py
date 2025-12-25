from django.db import models
from userManagement.models import CustomUser
from studentKeyFeatureManagement.models import StudentResume

# Create your models here.


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        abstract = True


class JobPost(BaseModel):
    comapany_name = models.CharField(max_length=255)
    job_description = models.TextField()
    offered_position = models.CharField(max_length=255)
    venue = models.CharField(max_length=255)
    application_deadline = models.DateField()
    job_type = models.CharField(max_length=255)
    eligibility = models.CharField(max_length=255)
    skills_required = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True) # type: ignore
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='created_job_posts', null=True, blank=True, limit_choices_to={'is_tpcstaff': True})

    def __str__(self):
        return f"{self.comapany_name} - {self.offered_position}"


class JobApplication(BaseModel):
    job_post = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='job_applications')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='job_applications')
    resume = models.ForeignKey(StudentResume, on_delete=models.SET_NULL, related_name='job_applications', null=True, blank=True)

    def __str__(self):
        return f"{self.student} - {self.job_post}"


class TPCNotification(BaseModel):
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='created_notifications', null=True, blank=True, limit_choices_to={'is_tpcstaff': True})

    def __str__(self):
        return f"{self.title}"