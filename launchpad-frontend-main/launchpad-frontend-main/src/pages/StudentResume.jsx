import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiGet, apiPost, apiPatch, apiDelete } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function StudentResume() {
  const studentId = localStorage.getItem('id');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [resumes, setResumes] = useState([]);
  const [defaultResumeId, setDefaultResumeId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch resumes from backend
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const resume = await apiGet(`${apiUrls.RESUME}`);
        const filtered = resume.filter(r => r.related_user === parseInt(studentId));
        setResumes(filtered);
        const defaultOne = filtered.find(r => r.is_default);
        if (defaultOne) {
          setDefaultResumeId(defaultOne.id);
        }
      } catch (err) {
        console.error("Failed to load resumes:", err);
      }
    };

    fetchResumes();
  }, [studentId]);

  // Upload new resume
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (resumes.length >= 4) {
      alert("⚠️ You can upload only up to 4 resumes.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("related_user", studentId);

    try {
      const resume = await apiPost(`${apiUrls.RESUME}`, formData);
      setResumes(prev => [...prev, resume]);
      alert("✅ Resume uploaded successfully!");
    } catch (err) {
      console.error("Resume upload failed:", err);
      alert("❌ Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  // Set default resume
  const handleSetDefault = async (id) => {
    try {
      await apiPatch(`${apiUrls.RESUME}${id}/`, {
        is_default: true
      });
      setDefaultResumeId(id);
      setResumes(prev => prev.map(r => ({
        ...r,
        is_default: r.id === id
      })));
      alert("✅ Default resume updated!");
    } catch (err) {
      console.error("Error setting default resume:", err);
      alert("❌ Failed to set default resume.");
    }
  };

  // Delete resume
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      await apiDelete(`${apiUrls.RESUME}${id}/`);
      const updated = resumes.filter(r => r.id !== id);
      setResumes(updated);
      if (id === defaultResumeId && updated.length > 0) {
        handleSetDefault(updated[0].id);
      }
      alert("✅ Resume deleted successfully!");
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("❌ Failed to delete resume.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} current="/student-resume" />
      
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? "250px" : "0",
        transition: "margin-left 0.3s"
      }}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={toggleSidebar} style={styles.menuButton}>
            ☰
          </button>
          <h1 style={styles.pageTitle}>📎 Resume Management</h1>
        </div>

        <div style={styles.container}>
          {/* Upload Section */}
          <div style={styles.uploadSection}>
            <h2 style={styles.sectionTitle}>Upload New Resume</h2>
            <div style={styles.uploadArea}>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleUpload}
                style={styles.fileInput}
                id="resume-upload"
                disabled={isUploading}
              />
              <label htmlFor="resume-upload" style={styles.uploadLabel}>
                {isUploading ? "⏳ Uploading..." : "📁 Choose PDF File"}
              </label>
              <p style={styles.uploadHint}>
                Maximum 4 resumes allowed • PDF files only
              </p>
            </div>
          </div>

          {/* Resumes List */}
          <div style={styles.resumesSection}>
            <h2 style={styles.sectionTitle}>
              Your Resumes ({resumes.length}/4)
            </h2>
            
            {resumes.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📄</div>
                <p style={styles.emptyText}>No resumes uploaded yet</p>
                <p style={styles.emptySubtext}>Upload your first resume to get started</p>
              </div>
            ) : (
              <div style={styles.resumesGrid}>
                {resumes.map((resume) => (
                  <div key={resume.id} style={styles.resumeCard}>
                    <div style={styles.resumeHeader}>
                      <div style={styles.fileInfo}>
                        <div style={styles.fileIcon}>📄</div>
                        <div>
                          <p style={styles.fileName}>
                            {resume.resume_file.split('/').pop()}
                          </p>
                          <p style={styles.uploadDate}>
                            Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {defaultResumeId === resume.id && (
                        <span style={styles.defaultBadge}>🌟 Default</span>
                      )}
                    </div>
                    
                    <div style={styles.resumeActions}>
                      <a 
                        href={resume.resume_file} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download 
                        style={styles.actionButton}
                      >
                        👁️ View
                      </a>
                      {defaultResumeId !== resume.id && (
                        <button 
                          onClick={() => handleSetDefault(resume.id)} 
                          style={styles.actionButton}
                        >
                          ⭐ Set Default
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(resume.id)} 
                        style={styles.deleteButton}
                      >
                        🗑️ Delete
                      </button>
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
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
    padding: '0',
    transition: 'margin-left 0.3s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e9ecef',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    marginRight: '1rem',
    borderRadius: '5px',
    transition: 'background-color 0.2s',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  uploadSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem',
    marginTop: 0,
  },
  uploadArea: {
    border: '2px dashed #007bff',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f8f9ff',
    transition: 'all 0.3s',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  uploadHint: {
    marginTop: '1rem',
    color: '#666',
    fontSize: '0.9rem',
  },
  resumesSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  emptySubtext: {
    fontSize: '1rem',
    color: '#999',
  },
  resumesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  resumeCard: {
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  resumeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: '2rem',
    marginRight: '1rem',
  },
  fileName: {
    fontWeight: 'bold',
    margin: '0 0 0.25rem 0',
    color: '#333',
  },
  uploadDate: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  resumeActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
};
