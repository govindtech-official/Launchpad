import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { apiGet, apiPost, apiDelete } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function StudentAdd() {
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    project_title: '',
    project_web_link: '',
    project_github_link: '',
    project_summary: '',
    skills_involved: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const studentId = localStorage.getItem('student_id');

  // 🔄 Load Projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectData = await apiGet(`${apiUrls.PROJECTS}`);

        if (projectData && Array.isArray(projectData)) {
          setProjects(projectData);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        showMessage("❌ Failed to load projects", 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleAddProject = async () => {
    if (!newProject.project_title.trim()) {
      showMessage("⚠️ Project title is required", 'warning');
      return;
    }

    try {
      setLoading(true);
      const projectData = {
        ...newProject,
        related_user: parseInt(studentId)
      };

      const response = await apiPost(`${apiUrls.PROJECTS}`, projectData);

      // Add the new project to the list
      setProjects([...projects, response]);

      // Reset form
      setNewProject({
        project_title: '',
        project_web_link: '',
        project_github_link: '',
        project_summary: '',
        skills_involved: ''
      });

      showMessage("✅ Project added successfully!", 'success');
    } catch (err) {
      console.error("Error adding project:", err);
      showMessage("❌ Failed to add project", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`${apiUrls.PROJECTS}${projectId}/`);

      // Remove from local state
      setProjects(projects.filter(p => p.id !== projectId));
      showMessage("✅ Project deleted successfully!", 'success');
    } catch (err) {
      console.error("Error deleting project:", err);
      showMessage("❌ Failed to delete project", 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div style={styles.pageContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => { }} current="/student-add" />
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? '250px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <h1 style={styles.title}>🚀 Project Portfolio</h1>
              <p style={styles.subtitle}>Showcase your skills and experience with amazing projects</p>
            </div>
            <div style={styles.headerStats}>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{projects.length}</span>
                <span style={styles.statLabel}>Projects</span>
              </div>
            </div>
          </div>

          {message && (
            <div style={{
              ...styles.message,
              ...styles[`message${messageType.charAt(0).toUpperCase() + messageType.slice(1)}`]
            }}>
              {message}
            </div>
          )}

          <div style={styles.formSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>➕ Add New Project</h2>
              <div style={styles.sectionLine}></div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.required}>*</span> Project Title
                </label>
                <input
                  style={styles.input}
                  type="text"
                  value={newProject.project_title}
                  onChange={(e) => setNewProject({ ...newProject, project_title: e.target.value })}
                  placeholder="Enter an impressive project title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Skills & Technologies</label>
                <input
                  style={styles.input}
                  type="text"
                  value={newProject.skills_involved}
                  onChange={(e) => setNewProject({ ...newProject, skills_involved: e.target.value })}
                  placeholder="React, Django, CSS, JavaScript, etc."
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>🌐 Live Demo URL</label>
                <input
                  style={styles.input}
                  type="url"
                  value={newProject.project_web_link}
                  onChange={(e) => setNewProject({ ...newProject, project_web_link: e.target.value })}
                  placeholder="https://your-awesome-project.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📂 GitHub Repository</label>
                <input
                  style={styles.input}
                  type="url"
                  value={newProject.project_github_link}
                  onChange={(e) => setNewProject({ ...newProject, project_github_link: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📝 Project Description</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe what your project does, the problems it solves, your role, and the technologies you used..."
                value={newProject.project_summary}
                onChange={(e) => setNewProject({ ...newProject, project_summary: e.target.value })}
                rows="5"
              />
            </div>

            <div style={styles.buttonContainer}>
              <button
                onClick={handleAddProject}
                style={{
                  ...styles.addBtn,
                  ...(loading || !newProject.project_title.trim() ? styles.addBtnDisabled : {})
                }}
                disabled={loading || !newProject.project_title.trim()}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}>⏳</span>
                    Adding Project...
                  </>
                ) : (
                  <>
                    <span style={styles.btnIcon}>✨</span>
                    Add Project
                  </>
                )}
              </button>
            </div>
          </div>

          <div style={styles.projectsSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📋 Your Projects</h2>
              <div style={styles.sectionLine}></div>
            </div>

            {loading && projects.length === 0 ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}>⏳</div>
                <p style={styles.loadingText}>Loading your amazing projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📁</div>
                <h3 style={styles.emptyTitle}>No projects yet</h3>
                <p style={styles.emptyText}>Start building your portfolio by adding your first project above!</p>
              </div>
            ) : (
              <div style={styles.projectsGrid}>
                {projects.map((project) => (
                  <div key={project.id} style={styles.projectCard}>
                    <div style={styles.projectHeader}>
                      <div style={styles.projectTitleContainer}>
                        <h3 style={styles.projectTitle}>{project.project_title}</h3>
                        <div style={styles.projectMeta}>
                          <span style={styles.projectDate}>
                            📅 {formatDate(project.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        style={styles.deleteBtn}
                        disabled={loading}
                        title="Delete project"
                      >
                        🗑️
                      </button>
                    </div>

                    {project.skills_involved && (
                      <div style={styles.skillsContainer}>
                        {project.skills_involved.split(',').map((skill, index) => (
                          <span key={index} style={styles.skillTag}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.project_summary && (
                      <p style={styles.projectDescription}>{project.project_summary}</p>
                    )}

                    <div style={styles.projectLinks}>
                      {project.project_web_link && (
                        <a
                          href={project.project_web_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.projectLink}
                        >
                          🌐 Live Demo
                        </a>
                      )}
                      {project.project_github_link && (
                        <a
                          href={project.project_github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.projectLink}
                        >
                          📂 View Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(45deg, #fff, #f0f0f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: 0,
  },
  headerStats: {
    display: 'flex',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  message: {
    padding: '1rem 1.5rem',
    marginBottom: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  messageSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  messageError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  messageWarning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7',
  },
  formSection: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '20px',
    marginBottom: '3rem',
    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
  },
  sectionHeader: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3748',
    margin: '0 0 1rem 0',
  },
  sectionLine: {
    width: '60px',
    height: '4px',
    backgroundColor: '#667eea',
    margin: '0 auto',
    borderRadius: '2px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4a5568',
    fontSize: '0.95rem',
  },
  required: {
    color: '#e53e3e',
    marginRight: '0.25rem',
  },
  input: {
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8fafc',
  },
  textarea: {
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8fafc',
    minHeight: '120px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  addBtn: {
    padding: '1rem 2.5rem',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  addBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  btnIcon: {
    fontSize: '1.2rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  projectsSection: {
    marginTop: '2rem',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#718096',
  },
  loadingText: {
    marginTop: '1rem',
    fontSize: '1.1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4a5568',
    margin: '0 0 0.5rem 0',
  },
  emptyText: {
    color: '#718096',
    fontSize: '1.1rem',
    margin: 0,
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
  },
  projectCard: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  projectTitleContainer: {
    flex: 1,
  },
  projectTitle: {
    margin: '0 0 0.5rem 0',
    color: '#2d3748',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    lineHeight: '1.3',
  },
  projectMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  projectDate: {
    color: '#718096',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(197, 48, 48, 0.2)',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  skillTag: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontSize: '0.85rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  projectDescription: {
    color: '#4a5568',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    fontSize: '1rem',
  },
  projectLinks: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  projectLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f7fafc',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    border: '2px solid #e2e8f0',
    fontSize: '0.9rem',
  },
};
