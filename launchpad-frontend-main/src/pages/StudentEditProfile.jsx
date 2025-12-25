import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiGet, apiPut } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function StudentEditProfile() {
  const rollNo = localStorage.getItem('rollNo');
  const studentId = localStorage.getItem('id');

  const [formData, setFormData] = useState({
    name: '', fatherName: '', dob: '', gender: '',
    degree: '', branch: '', semester: '', rollNo: rollNo || '',
    batch: '', cpi: '', tenthSchool: '', tenthMarks: '',
    twelfthSchool: '', twelfthMarks: '', diploma: '', mobile: '',
    collegeEmail: '', personalEmail: '', githubLink: '', linkedinLink: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [emailError, setEmailError] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ Load student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet(`${apiUrls.PROFILE}${studentId}`);
        
        if (response.user) {
          const user = response.user;
          
          // Map API response to form data
          const mappedData = {
            name: user.full_name || '',
            fatherName: user.father_name || '',
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            degree: user.academic_details?.degree || '',
            branch: user.academic_details?.branch || '',
            semester: user.academic_details?.semester || '',
            rollNo: user.academic_details?.roll_number || rollNo || '',
            batch: user.academic_details?.batch || '',
            cpi: user.academic_details?.cpi || '',
            tenthSchool: user.education_details?.matriculation_school_name || '',
            tenthMarks: user.education_details?.matriculation_percentage || '',
            twelfthSchool: user.education_details?.intermediate_school_name || '',
            twelfthMarks: user.education_details?.intermediate_percentage || '',
            diploma: user.education_details?.diploma_details || '',
            mobile: user.phone_number || '',
            collegeEmail: user.username || '',
            personalEmail: user.alternate_email || '',
            githubLink: user.github_link || '',
            linkedinLink: user.linkedin_link || ''
          };
          
          setFormData(mappedData);
          setOriginalData(mappedData);
          
          if (user.profile_picture) {
            setPreviewImage(user.profile_picture);
          }
        }
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [studentId, rollNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'collegeEmail') {
      setEmailError(value.endsWith('@iitp.ac.in') ? '' : 'Only @iitp.ac.in emails allowed.');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      alert("❌ Fix email error before submitting.");
      return;
    }

    setSaving(true);

    try {
      // Prepare the data structure according to the API
      const updateData = {
        full_name: formData.name,
        father_name: formData.fatherName,
        dob: formData.dob || null,
        gender: formData.gender,
        phone_number: formData.mobile,
        alternate_email: formData.personalEmail,
        github_link: formData.githubLink,
        linkedin_link: formData.linkedinLink,
        academic_details: {
          degree: formData.degree,
          branch: formData.branch,
          semester: formData.semester,
          roll_number: formData.rollNo,
          batch: formData.batch,
          cpi: formData.cpi
        },
        education_details: {
          matriculation_school_name: formData.tenthSchool,
          matriculation_percentage: formData.tenthMarks,
          intermediate_school_name: formData.twelfthSchool,
          intermediate_percentage: formData.twelfthMarks,
          diploma_details: formData.diploma
        }
      };

      // Use PUT method to update the profile
      await apiPut(`${apiUrls.PROFILE_EDIT}`, updateData);

      setSuccessMessage("✅ Profile updated successfully!");
      
      // Scroll to top of the page to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      setErrorMessage("❌ Failed to save profile.");
      alert("❌ Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <Sidebar isOpen={true} toggleSidebar={() => {}} current="/student-edit-profile" />
      <div style={styles.mainContent}>
        <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📝 Edit Profile</h1>
          <p style={styles.subtitle}>Update your personal and academic information</p>
          {errorMessage && (
            <div style={{ ...styles.successMessage, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div style={styles.successMessage}>
              {successMessage}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 📸 Profile Picture Upload */}
          <div style={styles.imageSection}>
            <label style={styles.imageLabel}>
              <b>Profile Picture</b>
            </label>
            <div style={styles.imageContainer}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={styles.fileInput}
              />
              {previewImage && (
                <div style={styles.previewContainer}>
                  <img 
                    src={"http://localhost:8000"+previewImage} 
                    alt="Preview" 
                    style={styles.previewImage} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* 👇 Personal, Academic, Educational & Contact Fields */}
          <Section title="Personal Details" icon="👤">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
            <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['male', 'female', 'other']} />
          </Section>

          <Section title="Academic Details" icon="🎓">
            <Select label="Degree" name="degree" value={formData.degree} onChange={handleChange} options={['CSDA', 'BBA', 'XYZ']} />
            <Select label="Branch" name="branch" value={formData.branch} onChange={handleChange} options={['CS', 'BBA', 'MBA', 'XYZ']} />
            <Input label="Semester" name="semester" value={formData.semester} onChange={handleChange} />
            <Input label="Roll No" name="rollNo" value={formData.rollNo} readOnly />
            <Input label="Batch" name="batch" value={formData.batch} onChange={handleChange} />
            <Input label="CPI" name="cpi" value={formData.cpi} onChange={handleChange} type="number" step="0.1" min="0" max="10" />
          </Section>

          <Section title="Educational Background" icon="📚">
            <Input label="10th School" name="tenthSchool" value={formData.tenthSchool} onChange={handleChange} />
            <Input label="10th Marks (%)" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange} />
            <Input label="12th School" name="twelfthSchool" value={formData.twelfthSchool} onChange={handleChange} />
            <Input label="12th Marks (%)" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange} />
            <Input label="Diploma Details" name="diploma" value={formData.diploma} onChange={handleChange} />
          </Section>

          <Section title="Contact Details" icon="📞">
            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} />
            <Input label="College Email" name="collegeEmail" value={formData.collegeEmail} onChange={handleChange} readOnly />
            {emailError && <p style={styles.errorText}>{emailError}</p>}
            <Input label="Personal Email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
          </Section>

          <Section title="Social Links" icon="🔗">
            <Input label="GitHub Link" name="githubLink" value={formData.githubLink} onChange={handleChange} />
            <Input label="LinkedIn Link" name="linkedinLink" value={formData.linkedinLink} onChange={handleChange} />
          </Section>

          <button 
            type="submit" 
            style={saving ? styles.buttonDisabled : styles.button}
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

// 🔁 Reusable Components
function Input({ label, name, value, onChange, type = 'text', readOnly = false }) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}><b>{label}:</b></label>
      <input
        name={name}
        value={value || ''}
        onChange={onChange}
        type={type}
        readOnly={readOnly}
        style={readOnly ? styles.inputReadOnly : styles.input}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}><b>{label}:</b></label>
      <select name={name} value={value || ''} onChange={onChange} style={styles.input}>
        <option value="">-- Select {label} --</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function Section({ title, children, icon }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        {icon} {title}
      </h3>
      <div style={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
    marginLeft: '250px',
    transition: 'margin-left 0.3s',
    padding: '2rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6c757d',
    margin: '0',
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e9ecef',
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0 0 1rem 0',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem',
  },
  sectionContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#495057',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    ':focus': {
      outline: 'none',
      borderColor: '#3498db',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)',
    },
  },
  inputReadOnly: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    marginTop: '2rem',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    ':hover': {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
  },
  buttonDisabled: {
    width: '100%',
    marginTop: '2rem',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  imageSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  imageLabel: {
    display: 'block',
    marginBottom: '1rem',
    color: '#495057',
    fontSize: '1rem',
    fontWeight: '600',
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  fileInput: {
    width: '100%',
    padding: '0.75rem',
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  previewContainer: {
    textAlign: 'center',
  },
  previewImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #3498db',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  errorText: {
    color: '#dc3545',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '1rem',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    border: '1px solid #c3e6cb',
    textAlign: 'center',
    fontWeight: '600',
  },
};

// Add CSS animation for loading spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
