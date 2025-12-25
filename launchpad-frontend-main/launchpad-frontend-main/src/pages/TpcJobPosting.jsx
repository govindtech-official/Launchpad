import { useEffect, useState } from "react";
import TpcSidebar from '../components/TpcSidebar';
import { apiGet, apiPost, apiDelete } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function TpcJobPosting() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [newJob, setNewJob] = useState({
    comapany_name: "",
    offered_position: "",
    application_deadline: "",
    venue: "",
    job_description: "",
    job_type: "",
    eligibility: "",
    skills_required: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`${apiUrls.GETJOBPOSTS}`);
      setJobs(response || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!newJob.comapany_name || !newJob.offered_position || !newJob.application_deadline) {
      alert("Please fill in all required fields (Company Name, Position, and Deadline)");
      return;
    }

    try {
      setLoading(true);
      const response = await apiPost(`${apiUrls.CREATEJOBPOSTS}`, newJob);
      setJobs((prev) => [...prev, response]);
      setNewJob({
        comapany_name: "",
        offered_position: "",
        application_deadline: "",
        venue: "",
        job_description: "",
        job_type: "",
        eligibility: "",
        skills_required: "",
      });
      alert("Job posted successfully!");
    } catch (err) {
      console.error("Error adding job:", err);
      alert("Error creating job post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`${apiUrls.DELETEJOBPOSTS}${id}/`);
      setJobs((prev) => prev.filter((job) => job.id !== id));
      alert("Job posting deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Error deleting job post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <TpcSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          current="/tpc-job-posting"
        />
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>💼 Job Postings Management</h2>
            <p style={styles.subtitle}>Create and manage job postings for students</p>
          </div>

          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>Create New Job Posting</h3>
            <div style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company Name *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Enter company name"
                    value={newJob.comapany_name}
                    onChange={(e) => setNewJob({ ...newJob, comapany_name: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Position *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Enter job position"
                    value={newJob.offered_position}
                    onChange={(e) => setNewJob({ ...newJob, offered_position: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Application Deadline *</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={newJob.application_deadline}
                    onChange={(e) => setNewJob({ ...newJob, application_deadline: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Venue</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Enter venue/location"
                    value={newJob.venue}
                    onChange={(e) => setNewJob({ ...newJob, venue: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job Type</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g., Full-time, Internship, Contract"
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Eligibility</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g., B.Tech, MCA, etc."
                    value={newJob.eligibility}
                    onChange={(e) => setNewJob({ ...newJob, eligibility: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Skills Required</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g., React, Python, AWS"
                  value={newJob.skills_required}
                  onChange={(e) => setNewJob({ ...newJob, skills_required: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Job Description</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Enter detailed job description"
                  value={newJob.job_description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, job_description: e.target.value })
                  }
                />
              </div>

              <button 
                onClick={handleAddJob} 
                style={styles.addBtn}
                disabled={loading}
              >
                {loading ? "Creating..." : "➕ Create Job Posting"}
              </button>
            </div>
          </div>

          <div style={styles.jobsContainer}>
            <h3 style={styles.sectionTitle}>Current Job Postings</h3>
            
            {loading && jobs.length === 0 ? (
              <div style={styles.loading}>Loading job postings...</div>
            ) : jobs.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No job postings available.</p>
                <p>Create your first job posting using the form above.</p>
              </div>
            ) : (
              <div style={styles.jobsGrid}>
                {jobs.map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <h4 style={styles.jobTitle}>{job.offered_position}</h4>
                      <span style={styles.jobCompany}>{job.comapany_name}</span>
                    </div>
                    
                    <div style={styles.jobDetails}>
                      <div style={styles.jobInfo}>
                        <span style={styles.infoLabel}>Deadline:</span>
                        <span style={styles.infoValue}>{formatDate(job.application_deadline)}</span>
                      </div>
                      
                      {job.venue && (
                        <div style={styles.jobInfo}>
                          <span style={styles.infoLabel}>Venue:</span>
                          <span style={styles.infoValue}>{job.venue}</span>
                        </div>
                      )}
                      
                      {job.job_type && (
                        <div style={styles.jobInfo}>
                          <span style={styles.infoLabel}>Type:</span>
                          <span style={styles.infoValue}>{job.job_type}</span>
                        </div>
                      )}
                      
                      {job.eligibility && (
                        <div style={styles.jobInfo}>
                          <span style={styles.infoLabel}>Eligibility:</span>
                          <span style={styles.infoValue}>{job.eligibility}</span>
                        </div>
                      )}
                      
                      {job.skills_required && (
                        <div style={styles.jobInfo}>
                          <span style={styles.infoLabel}>Skills:</span>
                          <span style={styles.infoValue}>{job.skills_required}</span>
                        </div>
                      )}
                      
                      {job.job_description && (
                        <div style={styles.jobInfo}>
                          <span style={styles.infoLabel}>Description:</span>
                          <span style={styles.infoValue}>{job.job_description}</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.jobActions}>
                      <button
                        onClick={() => handleDelete(job.id)}
                        style={styles.deleteBtn}
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "🗑️ Delete"}
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
  container: {
    padding: "2rem",
    fontFamily: "sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#2c3e50",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#7f8c8d",
    margin: "0",
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    padding: "2rem",
    marginBottom: "2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  formTitle: {
    fontSize: "1.5rem",
    color: "#2c3e50",
    margin: "0 0 1.5rem 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  input: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "2px solid #e1e8ed",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
  },
  textarea: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "2px solid #e1e8ed",
    fontSize: "1rem",
    minHeight: "120px",
    resize: "vertical",
    transition: "border-color 0.3s ease",
  },
  addBtn: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
    alignSelf: "flex-start",
  },
  jobsContainer: {
    marginTop: "2rem",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    color: "#2c3e50",
    margin: "0 0 1.5rem 0",
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
    color: "#7f8c8d",
    fontSize: "1.1rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#7f8c8d",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  jobCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    border: "1px solid #e1e8ed",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  jobHeader: {
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #f1f3f4",
  },
  jobTitle: {
    fontSize: "1.3rem",
    color: "#2c3e50",
    margin: "0 0 0.5rem 0",
    fontWeight: "600",
  },
  jobCompany: {
    fontSize: "1rem",
    color: "#3498db",
    fontWeight: "500",
  },
  jobDetails: {
    marginBottom: "1.5rem",
  },
  jobInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.8rem",
    padding: "0.5rem 0",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#34495e",
    fontSize: "0.9rem",
  },
  infoValue: {
    color: "#2c3e50",
    fontSize: "0.9rem",
    textAlign: "right",
    maxWidth: "60%",
    wordWrap: "break-word",
  },
  jobActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  deleteBtn: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.3s ease",
  },
};
