import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { apiGet } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function StudentDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState([]);
  const [profilePic, setProfilePic] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [profileDetails, setProfileDetails] = useState({});
  const [academicDetails, setAcademicDetails] = useState({});
  const [educationDetails, setEducationDetails] = useState({});

  const email = localStorage.getItem('email');
  const studentId = localStorage.getItem('id');

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const loadProfile = async () => {
    try {
      const result = await apiGet(
        `${apiUrls.PROFILE}${studentId}/`
      );
      const profile = result.user;

      if (profile) {
        setGithub(profile.github || '');
        setLinkedin(profile.linkedin || '');
        setSkills(profile.skills || '');
        setProjects(JSON.parse(profile.projects || '[]'));
        setProfilePic(profile.profile_picture || '');
        setName(profile.full_name || 'Student');
        
        // Handle nested academic details
        if (profile.academic_details) {
          setAcademicDetails(profile.academic_details);
        }
        
        // Handle nested education details
        if (profile.education_details) {
          setEducationDetails(profile.education_details);
        }
        
        // Set basic profile details
        setProfileDetails({
          name: profile.full_name,
          fatherName: profile.father_name,
          dob: profile.dob,
          gender: profile.gender,
          mobile: profile.phone_number,
          collegeEmail: profile.username,
          personalEmail: profile.alternate_email
        });
      }

      const students = JSON.parse(localStorage.getItem("allStudents")) || [];
      const current = students.find(s => s.email === email);
      if (current?.name && !name) {
        setName(current.name);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('focus', loadProfile);
    return () => window.removeEventListener('focus', loadProfile);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setProfilePic(base64);
    };
    reader.readAsDataURL(file);
  };

  // const handleLogout = () => {
  //   localStorage.clear();
  //   window.location.href = '/login';
  // };

  // const handleCopyProfileLink = () => {
  //   const url = `${window.location.origin}/profile/${rollNo}`;
  //   navigator.clipboard.writeText(url);
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 2000);
  // };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        current="/student-dashboard"
      />

      <div style={{
        flex: 1,
        marginLeft: isSidebarOpen ? '250px' : '0',
        transition: 'margin-left 0.3s ease',
        overflowX: 'hidden',
        width: '100%',
      }}>
        <div style={dashboardStyles.topbar}>
          <button onClick={toggleSidebar} style={dashboardStyles.menuBtn}>☰</button>
          <h1 style={{ flex: 1, marginLeft: '1rem' }}>🎓 Student Dashboard</h1>
          {/* <button onClick={handleLogout} style={dashboardStyles.logoutBtn}>Logout</button> */}
        </div>

        <div style={dashboardStyles.content}>
          {/* <div style={{ marginBottom: '1rem' }}>
            <button onClick={handleCopyProfileLink} style={dashboardStyles.shareBtn}>🔗 Share My Profile</button>
            {copied && <span style={{ marginLeft: '1rem', color: 'green' }}>✅ Copied!</span>}
          </div> */}

          <div style={dashboardStyles.mainGrid}>
            {/* Profile Card */}
            <div style={dashboardStyles.profileCard}>
              <div style={dashboardStyles.profileHeader}>
                <div style={dashboardStyles.profileInfo}>
                  <h2 style={dashboardStyles.profileName}>{name}</h2>
                  <div style={dashboardStyles.profileDetails}>
                    <div style={dashboardStyles.detailItem}>
                      <span style={dashboardStyles.detailLabel}>Roll No:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.roll_number || 'N/A'}</span>
                    </div>
                    <div style={dashboardStyles.detailItem}>
                      <span style={dashboardStyles.detailLabel}>Course:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.degree || 'N/A'}</span>
                    </div>
                    <div style={dashboardStyles.detailItem}>
                      <span style={dashboardStyles.detailLabel}>Batch:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.batch || 'N/A'}</span>
                    </div>
                    <div style={dashboardStyles.detailItem}>
                      <span style={dashboardStyles.detailLabel}>Gender:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.gender || 'N/A'}</span>
                    </div>
                  </div>
                  <div style={dashboardStyles.links}>
                    {github && (
                      <a href={github} target="_blank" rel="noopener noreferrer" style={dashboardStyles.linkBtn}>
                        <span style={{ marginRight: '0.5rem' }}>📁</span>GitHub
                      </a>
                    )}
                    {linkedin && (
                      <a href={linkedin} target="_blank" rel="noopener noreferrer" style={{ ...dashboardStyles.linkBtn, backgroundColor: '#0077b5' }}>
                        <span style={{ marginRight: '0.5rem' }}>💼</span>LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                <div style={dashboardStyles.profileImageSection}>
                  <div style={dashboardStyles.imageContainer}>
                    <img
                      src={profilePic ? `http://localhost:8000/${profilePic}` : '/profile-fallback.png'}
                      alt="Profile"
                      style={dashboardStyles.avatar}
                      onError={(e) => {
                        e.target.src = '/profile-fallback.png';
                      }}
                    />
                    <div style={dashboardStyles.imageOverlay}>
                      <label style={dashboardStyles.uploadLabel}>
                        📷 Change Photo
                        <input type="file" accept="image/*" onChange={handleImageChange} style={dashboardStyles.fileInput} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            {skills && (
              <div style={dashboardStyles.skillsCard}>
                <div style={dashboardStyles.cardHeader}>
                  <h3 style={dashboardStyles.cardTitle}>🛠️ Skills</h3>
                </div>
                <div style={dashboardStyles.cardContent}>
                  <p style={dashboardStyles.skillsText}>{skills}</p>
                </div>
              </div>
            )}

            {/* Projects Card */}
            {projects.length > 0 && (
              <div style={dashboardStyles.projectsCard}>
                <div style={dashboardStyles.cardHeader}>
                  <h3 style={dashboardStyles.cardTitle}>🚀 Projects</h3>
                </div>
                <div style={dashboardStyles.cardContent}>
                  <div style={dashboardStyles.projectGrid}>
                    {projects.map((proj, index) => (
                      <div key={proj.id || index} style={dashboardStyles.projectCard}>
                        <h4 style={dashboardStyles.projectTitle}>{proj.title}</h4>
                        {proj.description && <p style={dashboardStyles.projectDescription}>{proj.description}</p>}
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" style={dashboardStyles.projectLink}>
                            🔗 View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Details Card */}
            {profileDetails.name && (
              <div style={dashboardStyles.infoCard}>
                <div style={dashboardStyles.cardHeader}>
                  <h3 style={dashboardStyles.cardTitle}>👤 Personal Details</h3>
                </div>
                <div style={dashboardStyles.cardContent}>
                  <div style={dashboardStyles.detailsGrid}>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Name:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.name}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Father's Name:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.fatherName || 'N/A'}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Date of Birth:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.dob || 'N/A'}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Gender:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.gender || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Details Card */}
            {academicDetails.degree && (
              <div style={dashboardStyles.infoCard}>
                <div style={dashboardStyles.cardHeader}>
                  <h3 style={dashboardStyles.cardTitle}>🎓 Academic Details</h3>
                </div>
                <div style={dashboardStyles.cardContent}>
                  <div style={dashboardStyles.detailsGrid}>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Degree:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.degree}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Branch:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.branch}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Semester:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.semester}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Batch:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.batch}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>CPI:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.cpi}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Roll Number:</span>
                      <span style={dashboardStyles.detailValue}>{academicDetails.roll_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Educational Background Card */}
            {educationDetails.matriculation_school_name && (
              <div style={dashboardStyles.infoCard}>
                <div style={dashboardStyles.cardHeader}>
                  <h3 style={dashboardStyles.cardTitle}>📘 Educational Background</h3>
                </div>
                <div style={dashboardStyles.cardContent}>
                  <div style={dashboardStyles.educationSection}>
                    <h4 style={dashboardStyles.sectionTitle}>10th Standard</h4>
                    <div style={dashboardStyles.detailsGrid}>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>School:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.matriculation_school_name}</span>
                      </div>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Board:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.matriculation_board}</span>
                      </div>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Percentage:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.matriculation_percentage}%</span>
                      </div>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Year:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.matriculation_year}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={dashboardStyles.educationSection}>
                    <h4 style={dashboardStyles.sectionTitle}>12th Standard</h4>
                    <div style={dashboardStyles.detailsGrid}>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>School:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.intermediate_school_name}</span>
                      </div>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Board:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.intermediate_board}</span>
                      </div>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Percentage:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.intermediate_percentage}%</span>
                      </div>
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Year:</span>
                        <span style={dashboardStyles.detailValue}>{educationDetails.intermediate_year}</span>
                      </div>
                    </div>
                  </div>
                  
                  {educationDetails.diploma_details && (
                    <div style={dashboardStyles.educationSection}>
                      <h4 style={dashboardStyles.sectionTitle}>Diploma</h4>
                      <div style={dashboardStyles.detailsGrid}>
                        <div style={dashboardStyles.detailRow}>
                          <span style={dashboardStyles.detailLabel}>Details:</span>
                          <span style={dashboardStyles.detailValue}>{educationDetails.diploma_details}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Details Card */}
            {profileDetails.mobile && (
              <div style={dashboardStyles.infoCard}>
                <div style={dashboardStyles.cardHeader}>
                  <h3 style={dashboardStyles.cardTitle}>📞 Contact Details</h3>
                </div>
                <div style={dashboardStyles.cardContent}>
                  <div style={dashboardStyles.detailsGrid}>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>Mobile:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.mobile}</span>
                    </div>
                    <div style={dashboardStyles.detailRow}>
                      <span style={dashboardStyles.detailLabel}>College Email:</span>
                      <span style={dashboardStyles.detailValue}>{profileDetails.collegeEmail}</span>
                    </div>
                    {profileDetails.personalEmail && (
                      <div style={dashboardStyles.detailRow}>
                        <span style={dashboardStyles.detailLabel}>Personal Email:</span>
                        <span style={dashboardStyles.detailValue}>{profileDetails.personalEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const dashboardStyles = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '1rem 2rem',
    borderBottom: '1px solid #e1e5e9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  menuBtn: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '5px',
    transition: 'background-color 0.2s',
  },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  shareBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  content: {
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    maxWidth: '100%',
    margin: '0',
  },
  profileCard: {
    gridColumn: '1 / -1',
    padding: '2rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e5e9',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 1rem 0',
  },
  profileDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#6c757d',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#2c3e50',
    fontWeight: '500',
  },
  links: {
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  linkBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#24292e',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  profileImageSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #007bff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '0.5rem',
    borderBottomLeftRadius: '60px',
    borderBottomRightRadius: '60px',
    opacity: '0',
    transition: 'opacity 0.3s',
  },
  uploadLabel: {
    cursor: 'pointer',
    fontSize: '0.8rem',
    textAlign: 'center',
    display: 'block',
  },
  fileInput: {
    display: 'none',
  },
  skillsCard: {
    padding: '1.5rem 2rem',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
    marginBottom: '2rem',
    maxWidth: '600px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  projectsCard: {
    padding: '1.5rem',
    backgroundColor: '#fff3e0',
    border: '1px solid #ffcc80',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoCard: {
    padding: '1.5rem 2rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e5e9',
    borderRadius: '12px',
    marginBottom: '2rem',
    maxWidth: '700px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e1e5e9',
    paddingBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0',
  },
  cardContent: {
    color: '#2c3e50',
  },
  skillsText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0',
  },
  projectGrid: {
    display: 'grid',
    gap: '1rem',
  },
  projectCard: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e5e9',
    borderRadius: '8px',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  projectTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
  },
  projectDescription: {
    fontSize: '0.9rem',
    color: '#6c757d',
    margin: '0 0 0.75rem 0',
    lineHeight: '1.5',
  },
  projectLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  detailsGrid: {
    display: 'grid',
    gap: '1rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  educationSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0 0 1rem 0',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e1e5e9',
  },
};
