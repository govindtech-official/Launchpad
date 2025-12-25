import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";
import Sidebar from "../components/Sidebar";
import TpcSidebar from '../components/TpcSidebar';

export default function PublicProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internships, setInternships] = useState([]);

  // Choose sidebar based on user type
  const isTpc = localStorage.getItem('is_tpcstaff') === 'true';
  const SidebarComponent = isTpc ? TpcSidebar : Sidebar;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const studentRes = await apiGet(
          `${apiUrls.PROFILE}${id}`
        ); 
        const skillsRes = await apiGet(
          `${apiUrls.SKILLS}`
        );
        const projectsRes = await apiGet(
          `${apiUrls.PROJECTS}`
        );
        const resumeRes = await apiGet(
          `${apiUrls.RESUME}`
        );
        const internshipsRes = await apiGet(
          `${apiUrls.INTERNSHIPS}?user_id=${id}`
        );
        // Map student fields
        const studentData = studentRes.user;
        setStudent(studentData);

        // Filter skills and projects for this user
        const userSkills = (skillsRes || []).filter(skill => skill.related_user === studentData.id);
        const userProjects = (projectsRes || []).filter(proj => proj.related_user === studentData.id);
        // Resume: filter for current user and get file path
        let userResume = null;
        if (Array.isArray(resumeRes)) {
          const userResumeObj = resumeRes.find(r => r.related_user === studentData.id);
          userResume = userResumeObj ? (userResumeObj.resume_file || userResumeObj.resume || null) : null;
        } else if (resumeRes && (resumeRes.resume_file || resumeRes.resume)) {
          userResume = resumeRes.resume_file || resumeRes.resume;
        }

        // Compose profile object
        setProfile({
          name: studentData.full_name || '-',
          roll_no: studentData.academic_details?.roll_number || '-',
          course: studentData.academic_details?.degree || '-',
          batch: studentData.academic_details?.batch || '-',
          gender: studentData.gender || '-',
          profile_pic: studentData.profile_picture || '',
          github: studentData.github_link || '',
          linkedin: studentData.linkedin_link || '',
          skills: userSkills.map(skill => skill.skill_name),
          projects: userProjects.map(proj => ({
            title: proj.project_title,
            link: proj.project_web_link || proj.project_github_link || '',
            description: proj.project_summary || '',
          })),
          resume: userResume,
        });
        setInternships(Array.isArray(internshipsRes) ? internshipsRes : []);
        setError("");
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError("❌ Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // 👤 Handle profile pic (base64 or media path)
  const getProfilePicUrl = () => {
    if (!profile?.profile_pic) return '/profile-fallback.png';
    if (profile.profile_pic.startsWith('data:image')) return profile.profile_pic;
    return `http://localhost:8000${profile.profile_pic}`;
  };

  if (loading) return <p style={styles.loading}>Loading profile...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.pageWrap}>
      <SidebarComponent isOpen={true} toggleSidebar={() => {}} current="/public-profile" />
      <div style={{ marginLeft: 250, transition: 'margin-left 0.3s', flex: 1 }}>
        <div style={styles.container}>
          <h1 style={styles.heading}>🎓 Public Profile</h1>
          <div style={styles.divider} />
          {/* 🔝 Top Section: Info + Image */}
          <div style={styles.profileTop}>
            <div style={{flex: 1}}>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Roll No:</strong> {profile.roll_no}</p>
              <p><strong>Course:</strong> {profile.course}</p>
              <p><strong>Batch:</strong> {profile.batch}</p>
              <p><strong>Gender:</strong> {profile.gender}</p>
            </div>
            {/* 🖼 Profile Picture */}
            <div>
              <img
                src={getProfilePicUrl()}
                alt="Profile"
                style={styles.profileImg}
              />
            </div>
          </div>
          <div style={styles.divider} />
          {/* 🌐 GitHub and LinkedIn */}
          <div style={styles.links}>
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" style={styles.linkBtn}>
                GitHub
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ ...styles.linkBtn, backgroundColor: '#0077b5' }}>
                LinkedIn
              </a>
            )}
          </div>
          {/* 🛠️ Skills */}
          <div style={styles.section}>
            <h3>🛠 Skills Involved</h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div style={styles.skillsWrap}>
                {profile.skills.map((skill, idx) => (
                  <span key={idx} style={styles.skillChip}>{skill}</span>
                ))}
              </div>
            ) : (
              <p style={styles.fallback}>No skills added.</p>
            )}
          </div>
          <div style={styles.divider} />
          {/* 🚀 Projects */}
          <div style={styles.section}>
            <h3>🚀 Projects</h3>
            {profile.projects && profile.projects.length > 0 ? (
              <div style={styles.projectsGrid}>
                {profile.projects.map((proj, index) => (
                  <div key={index} style={styles.projectCard}>
                    <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{proj.title}</p>
                    {proj.link && (
                      <p><a href={proj.link} target="_blank" rel="noopener noreferrer">{proj.link}</a></p>
                    )}
                    {proj.description && <p>{proj.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.fallback}>No projects added.</p>
            )}
          </div>
          <div style={styles.divider} />
          {/* 🎯 Internships */}
          <div style={styles.section}>
            <h3>🎯 Internships</h3>
            {internships.length > 0 ? (
              <div style={styles.internshipsGrid}>
                {internships.map((intern, idx) => (
                  <div key={intern.id || idx} style={styles.internshipCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{intern.organization_name}</span>
                      <span style={{
                        ...styles.statusChip,
                        backgroundColor: intern.approval_status === 'Approved' ? '#28a745' : (intern.approval_status === 'Rejected' ? '#dc3545' : '#ffc107'),
                        color: intern.approval_status === 'Pending' ? '#222' : '#fff'
                      }}>
                        {intern.approval_status}
                      </span>
                    </div>
                    <p style={{margin: '0.3rem 0 0.2rem 0'}}><strong>Domain:</strong> {intern.domain}</p>
                    <p style={{margin: '0.3rem 0 0.2rem 0'}}><strong>Duration:</strong> {intern.internship_duration}</p>
                    <p style={{margin: '0.3rem 0 0.2rem 0'}}><strong>Description:</strong> {intern.internship_description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.fallback}>No internships added.</p>
            )}
          </div>
          <div style={styles.divider} />
          {/* 📄 Resume */}
          <div style={styles.section}>
            <h3>📄 Resume</h3>
            {profile.resume ? (
              <a
                href={`http://localhost:8000${profile.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.resumeBtn}
              >
                View Resume
              </a>
            ) : (
              <p style={styles.fallback}>No resume uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrap: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f4f6fa',
  },
  container: {
    padding: '2rem',
    maxWidth: '1100px',
    minWidth: '900px',
    margin: '2rem auto',
    backgroundColor: '#fff',
    borderRadius: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    fontFamily: 'sans-serif',
  },
  sidebarToggleBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '0.5rem 1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    transition: 'background 0.2s',
  },
  heading: {
    textAlign: 'center',
    fontSize: '2.2rem',
    marginBottom: '0.5rem',
    color: '#222',
    letterSpacing: '1px',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, #007bff 0%, #00c6ff 100%)',
    border: 'none',
    margin: '1.2rem 0',
    opacity: 0.15,
  },
  error: {
    textAlign: 'center',
    marginTop: '2rem',
    color: 'red',
  },
  loading: {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#555',
  },
  profileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '2rem',
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #007bff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  links: {
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  linkBtn: {
    padding: '0.5rem 1.2rem',
    backgroundColor: '#24292e',
    color: 'white',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'background 0.2s',
  },
  section: {
    marginBottom: '2rem',
  },
  skillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.7rem',
    marginTop: '0.5rem',
  },
  skillChip: {
    background: 'linear-gradient(90deg, #007bff 0%, #00c6ff 100%)',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.98rem',
    fontWeight: 500,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.2rem',
  },
  projectCard: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  resumeBtn: {
    padding: '0.7rem 1.5rem',
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  fallback: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  },
  internshipsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.2rem',
    marginTop: '0.5rem',
  },
  internshipCard: {
    padding: '1rem',
    backgroundColor: '#f4f8fb',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: '0.5rem',
  },
  statusChip: {
    padding: '0.3rem 0.9rem',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.95rem',
    display: 'inline-block',
    marginLeft: '0.5rem',
  },
};
