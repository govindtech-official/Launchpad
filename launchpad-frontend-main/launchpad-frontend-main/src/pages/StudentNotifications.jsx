import { useEffect, useState } from "react";
import Sidebar from '../components/Sidebar';
import { apiGet, apiPost } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";
import { getSessionStorage } from "../hooks/sessionStorage";

export default function StudentNotifications() {
  const [notices, setNotices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem('id');
        
        if (!userId) {
          // If no user ID, just fetch notices and jobs
          const [noticeRes, jobRes] = await Promise.all([
            apiGet(`${apiUrls.GETNOTICES}`),
            apiGet(`${apiUrls.GETJOBPOSTS}`)
          ]);

          console.log("noticeRes", noticeRes);
          console.log("jobRes", jobRes);

          // Handle different response structures
          const noticesData = noticeRes?.data || noticeRes || [];
          const jobsData = jobRes?.data || jobRes || [];

          setNotices(Array.isArray(noticesData) ? noticesData : []);
          setJobs(Array.isArray(jobsData) ? jobsData : []);
        } else {
          // If user is logged in, fetch applied jobs as well
          const [noticeRes, jobRes, appliedJobsRes] = await Promise.all([
            apiGet(`${apiUrls.GETNOTICES}`),
            apiGet(`${apiUrls.GETJOBPOSTS}`),
            apiGet(`${apiUrls.GETAPPLIEDJOBS}`)
          ]);

          // Handle different response structures
          const noticesData = noticeRes?.data || noticeRes || [];
          const jobsData = jobRes?.data || jobRes || [];
          const appliedJobsData = appliedJobsRes?.data || appliedJobsRes || [];

          setNotices(Array.isArray(noticesData) ? noticesData : []);
          setJobs(Array.isArray(jobsData) ? jobsData : []);
          
          // Extract job IDs from applied jobs response
          const appliedJobIds = Array.isArray(appliedJobsData) 
            ? appliedJobsData.map(app => app.job_post_id || app.job_post).filter(Boolean)
            : [];
          setAppliedJobs(new Set(appliedJobIds));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApplyJob = async (jobId) => {
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('id');
      if (!userId) {
        alert('Please login to apply for jobs');
        return;
      }

      // Add job to applying state
      setApplyingJobs(prev => new Set([...prev, jobId]));

      // Get user's default resume from RESUME API
      let userResume = '';
      try {
        const resumeResponse = await apiGet(apiUrls.RESUME);
        console.log('Resume response:', resumeResponse);
        
        // Handle different response structures
        const resumeData = resumeResponse?.data || resumeResponse || [];
        
        if (Array.isArray(resumeData)) {
          // If it's an array, find the default resume
          const defaultResume = resumeData.find(resume => resume.is_default === "True" || resume.is_default === true);
          userResume = defaultResume?.id || '';
        } else if (resumeData?.is_default === "True" || resumeData?.is_default === true) {
          // If it's a single object and it's the default
          userResume = resumeData?.id || '';
        } else {
          userResume = "No resume found";
        }
      } catch (resumeError) {
        console.error('Error fetching resume:', resumeError);
        alert('Failed to fetch resume. Please try again.');
        return;
      }

      if (!userResume) {
        alert('Please upload your resume before applying for jobs');
        return;
      }
      
      // Prepare application data
      const applicationData = {
        student: userId,
        resume: userResume,
        job_post: jobId
      };

      // Call the apply API
      await apiPost(apiUrls.APPLYJOB, applicationData);

      // Add to applied jobs
      setAppliedJobs(prev => new Set([...prev, jobId]));
      
      // Remove from applying state
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });

      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to apply for job. Please try again.');
      
      // Remove from applying state on error
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        current="/student-notifications"
      />
      <div style={{
        ...styles.container,
        marginLeft: isSidebarOpen ? "250px" : "0",
        transition: "margin-left 0.3s ease"
      }}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔔 Student Notifications</h1>
        <p style={styles.subtitle}>Stay updated with the latest notices and job opportunities</p>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading notifications...</p>
        </div>
      ) : (
        <div style={styles.content}>
          {/* TPC Notices */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📢 TPC Notices</h2>
              <span style={styles.count}>{notices?.length || 0} notice{(notices?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
            {(notices?.length || 0) === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No notices posted yet.</p>
              </div>
            ) : (
              <div style={styles.cardGrid}>
                {(notices || []).map((notice) => (
                  <div key={notice.id} style={styles.noticeCard}>
                    <div style={styles.noticeHeader}>
                      <h3 style={styles.noticeTitle}>{notice.title}</h3>
                      <span style={styles.noticeDate}>{formatDate(notice.created_at)}</span>
                    </div>
                    <p style={styles.noticeMessage}>{notice.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Notifications */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>💼 Job Opportunities</h2>
              <span style={styles.count}>{jobs?.length || 0} job{(jobs?.length || 0) !== 1 ? 's' : ''} available</span>
            </div>
            {(jobs?.length || 0) === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No job postings available.</p>
              </div>
            ) : (
              <div style={styles.cardGrid}>
                {(jobs || []).map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <h3 style={styles.jobTitle}>{job.offered_position}</h3>
                      <span style={styles.jobCompany}>{job.comapany_name}</span>
                    </div>
                    
                    <div style={styles.jobDetails}>
                      <div style={styles.jobDetail}>
                        <span style={styles.detailLabel}>🏢 Company:</span>
                        <span style={styles.detailValue}>{job.comapany_name}</span>
                      </div>
                      <div style={styles.jobDetail}>
                        <span style={styles.detailLabel}>📍 Location:</span>
                        <span style={styles.detailValue}>{job.venue || "N/A"}</span>
                      </div>
                      <div style={styles.jobDetail}>
                        <span style={styles.detailLabel}>🎓 Eligibility:</span>
                        <span style={styles.detailValue}>{job.eligibility}</span>
                      </div>
                      <div style={styles.jobDetail}>
                        <span style={styles.detailLabel}>💼 Job Type:</span>
                        <span style={styles.detailValue}>{job.job_type}</span>
                      </div>
                      <div style={styles.jobDetail}>
                        <span style={styles.detailLabel}>⏰ Deadline:</span>
                        <span style={styles.detailValue}>{job.application_deadline}</span>
                      </div>
                    </div>

                    {job.skills_required && (
                      <div style={styles.skillsSection}>
                        <span style={styles.detailLabel}>🛠️ Skills Required:</span>
                        <div style={styles.skillsList}>
                          {job.skills_required.split(',').map((skill, index) => (
                            <span key={index} style={styles.skillTag}>
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.job_description && (
                      <div style={styles.descriptionSection}>
                        <span style={styles.detailLabel}>📝 Description:</span>
                        <p style={styles.descriptionText}>{job.job_description}</p>
                      </div>
                    )}

                    <div style={styles.jobFooter}>
                      <div style={styles.jobFooterLeft}>
                        <span style={styles.statusBadge}>
                          {job.is_active ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                        <span style={styles.postedDate}>Posted: {formatDate(job.created_at)}</span>
                      </div>
                      <button
                        style={{
                          ...styles.applyButton,
                          ...(appliedJobs.has(job.id) ? styles.appliedButton : {}),
                          ...(applyingJobs.has(job.id) ? styles.applyingButton : {})
                        }}
                        onClick={() => handleApplyJob(job.id)}
                        disabled={appliedJobs.has(job.id) || applyingJobs.has(job.id)}
                      >
                        {appliedJobs.has(job.id) 
                          ? '✅ Applied' 
                          : applyingJobs.has(job.id) 
                            ? '⏳ Applying...' 
                            : '📝 Apply'
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
              )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    flex: 1,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    overflowY: "auto",
    width: "100%",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "2.5rem",
    color: "#2c3e50",
    margin: "0 0 0.5rem 0",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#7f8c8d",
    margin: "0",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    fontSize: "1.1rem",
    color: "#7f8c8d",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #ecf0f1",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    color: "#2c3e50",
    margin: "0",
    fontWeight: "600",
  },
  count: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#7f8c8d",
  },
  emptyText: {
    fontSize: "1.1rem",
    margin: "0",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    maxWidth: "100%",
  },
  noticeCard: {
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  noticeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  noticeTitle: {
    fontSize: "1.3rem",
    color: "#2c3e50",
    margin: "0",
    fontWeight: "600",
  },
  noticeDate: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
    backgroundColor: "#ecf0f1",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
  },
  noticeMessage: {
    color: "#34495e",
    lineHeight: "1.6",
    margin: "0",
  },
  jobCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    },
  },
  jobHeader: {
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #ecf0f1",
  },
  jobTitle: {
    fontSize: "1.4rem",
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
    marginBottom: "1rem",
  },
  jobDetail: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
    padding: "0.5rem 0",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#2c3e50",
    fontSize: "0.9rem",
  },
  detailValue: {
    color: "#34495e",
    fontSize: "0.9rem",
    textAlign: "right",
    maxWidth: "60%",
  },
  skillsSection: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  skillsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  skillTag: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "0.3rem 0.6rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  descriptionSection: {
    marginBottom: "1rem",
  },
  descriptionText: {
    color: "#34495e",
    lineHeight: "1.6",
    margin: "0.5rem 0 0 0",
    fontSize: "0.9rem",
  },
  jobFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #ecf0f1",
  },
  jobFooterLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  statusBadge: {
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  postedDate: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
  },
  applyButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "100px",
    ":hover": {
      backgroundColor: "#2980b9",
      transform: "translateY(-1px)",
    },
    ":disabled": {
      backgroundColor: "#bdc3c7",
      cursor: "not-allowed",
      transform: "none",
    },
  },
  appliedButton: {
    backgroundColor: "#27ae60",
    ":hover": {
      backgroundColor: "#27ae60",
    },
  },
  applyingButton: {
    backgroundColor: "#f39c12",
    ":hover": {
      backgroundColor: "#f39c12",
    },
  },
};
