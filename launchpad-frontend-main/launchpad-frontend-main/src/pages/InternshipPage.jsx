import { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import { apiGet, apiPost, apiPatch, apiDelete } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function InternshipPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [domain, setDomain] = useState("");
  const [internshipDuration, setInternshipDuration] = useState("");
  const [internshipDescription, setInternshipDescription] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [experienceLetterFile, setExperienceLetterFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`${apiUrls.INTERNSHIPS}`);
      setInternships(response || []);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("❌ Failed to fetch internships.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("organization_name", organizationName);
    formData.append("domain", domain);
    formData.append("internship_duration", internshipDuration);
    formData.append("internship_description", internshipDescription);
    if (certificateFile) formData.append("certificate", certificateFile);
    if (experienceLetterFile) formData.append("experience_letter", experienceLetterFile);

    try {
      setLoading(true);
      await apiPost(`${apiUrls.INTERNSHIPS}`, formData);

      // Reset form
      setOrganizationName("");
      setDomain("");
      setInternshipDuration("");
      setInternshipDescription("");
      setCertificateFile(null);
      setExperienceLetterFile(null);
      setSuccessMessage("✅ Internship saved successfully!");
      setSuccess(true);
      setError("");
      fetchInternships();
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error submitting internship:", err);
      setError("❌ Failed to save internship.");
      setSuccess(false);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?")) return;

    try {
      setLoading(true);
      await apiDelete(`${apiUrls.INTERNSHIPS}${id}/`);
      setSuccessMessage("✅ Internship deleted successfully!");
      setSuccess(true);
      setError("");
      fetchInternships();
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error deleting internship:", err);
      setError("❌ Failed to delete internship.");
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#28a745";
      case "Rejected":
        return "#dc3545";
      case "Pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div style={styles.pageContainer}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        current="/student-internship" 
      />
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? "250px" : "0"
      }}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>
              📄 Submit Internship
            </h2>
            <p style={styles.subtitle}>
              Share your internship experience and achievements
            </p>
          </div>

          {success && (
            <div style={styles.alertSuccess}>
              {successMessage}
            </div>
          )}
          {error && (
            <div style={styles.alertError}>
              {error}
            </div>
          )}

          <div style={styles.formContainer}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Organization Name:</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="Enter organization name"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Domain/Role:</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="e.g., Frontend Developer, Data Science"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration:</label>
                  <input
                    type="text"
                    value={internshipDuration}
                    onChange={(e) => setInternshipDuration(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="e.g., 3 months, 6 months"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description:</label>
                <textarea
                  value={internshipDescription}
                  onChange={(e) => setInternshipDescription(e.target.value)}
                  rows={4}
                  style={styles.textarea}
                  required
                  placeholder="Describe your role, responsibilities, and achievements during the internship..."
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Certificate (PDF):</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                    style={styles.fileInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Experience Letter (PDF):</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setExperienceLetterFile(e.target.files[0])}
                    style={styles.fileInput}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "⏳ Processing..." : "➕ Submit Internship"}
              </button>
            </form>
          </div>

          <div style={styles.divider} />

          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📘 My Internships</h3>
            {loading && <span style={styles.loadingText}>Loading...</span>}
          </div>

          {internships.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>❌ No internships submitted yet.</p>
              <p style={styles.emptySubtext}>Start by adding your first internship experience above.</p>
            </div>
          ) : (
            <div style={styles.internshipsGrid}>
              {internships.map((intern) => (
                <div key={intern.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h4 style={styles.cardTitle}>{intern.organization_name}</h4>
                    <span 
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(intern.approval_status)
                      }}
                    >
                      {intern.approval_status}
                    </span>
                  </div>
                  
                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Domain:</span>
                      <span style={styles.infoValue}>{intern.domain}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Duration:</span>
                      <span style={styles.infoValue}>{intern.internship_duration}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Description:</span>
                      <span style={styles.infoValue}>{intern.internship_description}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Created:</span>
                      <span style={styles.infoValue}>{formatDate(intern.created_at)}</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <div style={styles.fileButtons}>
                      <button
                        onClick={() => handleDownload(intern.certificate)}
                        style={{
                          ...styles.downloadBtn,
                          ...(intern.certificate ? {} : styles.disabledBtn)
                        }}
                        disabled={!intern.certificate}
                      >
                        📄 Certificate {intern.certificate ? "" : "(Not uploaded)"}
                      </button>
                      <button
                        onClick={() => handleDownload(intern.experience_letter)}
                        style={{
                          ...styles.downloadBtn,
                          ...(intern.experience_letter ? {} : styles.disabledBtn)
                        }}
                        disabled={!intern.experience_letter}
                      >
                        📋 Experience Letter {intern.experience_letter ? "" : "(Not uploaded)"}
                      </button>
                    </div>
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => handleDelete(intern.id)} 
                        style={styles.deleteBtn}
                      >
                        ❌ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  mainContent: {
    flex: "1",
    padding: "2rem",
    overflowY: "auto",
    transition: "margin-left 0.3s ease",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#2c3e50",
    margin: "0 0 0.5rem 0",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#6c757d",
    margin: "0",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "0.5rem",
  },
  input: {
    padding: "0.75rem",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      outline: "none",
    },
  },
  textarea: {
    padding: "0.75rem",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "100px",
    transition: "border-color 0.3s ease",
  },
  fileInput: {
    padding: "0.5rem",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  submitBtn: {
    padding: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "1rem",
    ":hover": {
      backgroundColor: "#0056b3",
    },
    ":disabled": {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
    },
  },
  alertSuccess: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    border: "1px solid #c3e6cb",
  },
  alertError: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    border: "1px solid #f5c6cb",
  },
  divider: {
    border: "none",
    height: "2px",
    backgroundColor: "#dee2e6",
    margin: "2rem 0",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "2rem",
    color: "#2c3e50",
    margin: "0",
    fontWeight: "600",
  },
  loadingText: {
    color: "#6c757d",
    fontSize: "0.9rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  emptyText: {
    fontSize: "1.2rem",
    color: "#6c757d",
    margin: "0 0 0.5rem 0",
  },
  emptySubtext: {
    fontSize: "1rem",
    color: "#adb5bd",
    margin: "0",
  },
  internshipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0",
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "white",
  },
  cardContent: {
    marginBottom: "1rem",
  },
  infoRow: {
    display: "flex",
    marginBottom: "0.5rem",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#495057",
    minWidth: "100px",
    fontSize: "0.9rem",
  },
  infoValue: {
    color: "#6c757d",
    fontSize: "0.9rem",
    flex: "1",
  },
  cardActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  fileButtons: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  downloadBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    ":hover": {
      backgroundColor: "#138496",
    },
  },
  disabledBtn: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
    opacity: "0.6",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  deleteBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    ":hover": {
      backgroundColor: "#c82333",
    },
  },
};
