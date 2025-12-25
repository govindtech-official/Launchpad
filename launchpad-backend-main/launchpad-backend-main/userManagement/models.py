from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Create your models here.


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        abstract = True


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, referral_code=None, **extra_fields):
        if not username:
            raise ValueError("The username field must be set")

        username = self.normalize_email(username)
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password=password, **extra_fields)
    
    
# Base user model that holds common fields for both user types
class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.EmailField(unique=True)
    full_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15, blank=True, null= True)
    father_name = models.CharField(max_length=30, blank=True, null= True)
    profile_picture = models.ImageField(upload_to='profile_picture/', null=True, blank=True)
    dob = models.DateTimeField(blank= True, null= True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    github_link = models.URLField(blank=True, null=True)
    linkedin_link = models.URLField(blank=True, null=True)
    alternate_email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)    # type: ignore
    is_staff = models.BooleanField(default=False)    # type: ignore
    is_verified = models.BooleanField(default=False) # type: ignore
    is_tpcstaff = models.BooleanField(default=False) # type: ignore
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    USERNAME_FIELD = 'username'

    objects = CustomUserManager()

    def __str__(self):
        return self.username


class AcademicDetail(BaseModel):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='academic_details')
    roll_number = models.CharField(unique=True, max_length=100)
    degree = models.CharField(max_length=100)
    branch = models.CharField(max_length=100)
    semester = models.CharField(max_length=100)
    batch = models.CharField(max_length=100)
    cpi = models.FloatField()

    def __str__(self):
        return f"{self.roll_number}"


class EducationDetail(BaseModel):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='education_details')

    matriculation_school_name = models.CharField(max_length=100)
    matriculation_board = models.CharField(max_length=100)
    matriculation_year = models.IntegerField()
    matriculation_percentage = models.FloatField()

    intermediate_school_name = models.CharField(max_length=100)
    intermediate_board = models.CharField(max_length=100)
    intermediate_year = models.IntegerField()
    intermediate_percentage = models.FloatField()

    diploma_details = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user}"