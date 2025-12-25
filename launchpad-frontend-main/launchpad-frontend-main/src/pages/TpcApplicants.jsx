import { useEffect, useState } from "react";
import TpcSidebar from '../components/TpcSidebar';
import { apiGet } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function Applicants({ jobId }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailedApplicants, setDetailedApplicants] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchApplicants();
  }, []);

    const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [getapplicants, jobsResponse] = await Promise.all([
        apiGet(`${apiUrls.GETAPPLICANTS}`),
        apiGet(`${apiUrls.GETJOBPOSTS}`)
      ]);
      
      if (getapplicants && Array.isArray(getapplicants)) {
        setApplicants(getapplicants);
        
        // Create a map of job details for quick lookup
        const jobsMap = {};
        if (jobsResponse && Array.isArray(jobsResponse)) {
          setAllJobs(jobsResponse);
          jobsResponse.forEach(job => {
            jobsMap[job.id] = job;
          });
        }
        
        // Fetch detailed student information for each applicant
        const detailedData = await Promise.all(
          getapplicants.map(async (applicant) => {
            try {
              const studentDetail = await apiGet(
                `${apiUrls.PROFILE}${applicant.student}`
              );
              
              return {
                ...applicant,
                studentDetails: studentDetail.user,
                jobDetails: jobsMap[applicant.job_post] || null,
                appliedDate: new Date(applicant.created_at).toLocaleDateString(),
              };
            } catch (err) {
              console.error(`Error fetching student ${applicant.student}:`, err);
              return {
                ...applicant,
                studentDetails: null,
                jobDetails: jobsMap[applicant.job_post] || null,
                appliedDate: new Date(applicant.created_at).toLocaleDateString(),
              };
            }
          })
        );
        
        setDetailedApplicants(detailedData);
      } else {
        setApplicants([]);
        setDetailedApplicants([]);
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("❌ Failed to load applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResumes = async () => {
    try {
      // This would need to be implemented based on your backend API
      alert("📥 Resume download feature will be implemented soon!");
    } catch (err) {
      console.error("Error downloading resumes:", err);
      alert("❌ Failed to download resumes.");
    }
  };

  const handleViewProfile = (studentId) => {
    window.open(`/profile/${studentId}`, '_blank');
  };

  const handleJobFilterChange = (e) => {
    setSelectedJobFilter(e.target.value);
  };

  const filteredApplicants = selectedJobFilter 
    ? detailedApplicants.filter(applicant => 
        applicant.jobDetails && applicant.jobDetails.id.toString() === selectedJobFilter
      )
    : detailedApplicants;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ width: 220, flexShrink: 0 }}>
                 <TpcSidebar
           isOpen={isSidebarOpen}
           toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
           current="/tpc-applicants"
         />
      </div>
          <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
        <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📄 Applicants List</h2>
        <div style={styles.stats}>
          <span style={styles.statItem}>
            📊 Total Applicants: {detailedApplicants.length}
          </span>
          {selectedJobFilter && (
            <span style={styles.statItem}>
              🔍 Filtered: {filteredApplicants.length}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading applicants...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyText}>
            {selectedJobFilter 
              ? "No applicants found for the selected job." 
              : "No applicants yet for any job."
            }
          </p>
        </div>
      ) : (
        <>
          <div style={styles.actionsContainer}>
            <div style={styles.filtersContainer}>
              <select 
                value={selectedJobFilter} 
                onChange={handleJobFilterChange}
                style={styles.filterSelect}
              >
                <option value="">All Jobs</option>
                {allJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.offered_position} - {job.comapany_name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleDownloadResumes} style={styles.downloadBtn}>
              ⬇️ Download All Resumes (ZIP)
            </button>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
                              <thead>
                  <tr>
                    <th style={styles.th}>👤 Name</th>
                    <th style={styles.th}>🆔 Roll No</th>
                    <th style={styles.th}>🏛️ Branch</th>
                    <th style={styles.th}>📚 Batch</th>
                    <th style={styles.th}>📊 CPI</th>
                    <th style={styles.th}>💼 Job Applied For</th>
                    <th style={styles.th}>🏢 Company</th>
                    <th style={styles.th}>📅 Applied On</th>
                    <th style={styles.th}>📄 Resume</th>
                  </tr>
                </thead>
                              <tbody>
                  {filteredApplicants.map((applicant, index) => {
                  const student = applicant.studentDetails;
                  const academicDetails = student?.academic_details || {};
                  
                  return (
                    <tr key={applicant.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          {student?.profile_picture ? (
                            <img 
                              src={`http://localhost:8000/${student.profile_picture}`}
                              alt={student.full_name}
                              style={styles.profilePic}
                            />
                          ) : (
                            <div style={styles.profilePlaceholder}>
                              {student?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span 
                            style={styles.nameText}
                            onClick={() => handleViewProfile(applicant.student)}
                            onMouseEnter={(e) => e.target.style.cursor = 'pointer'}
                            onMouseLeave={(e) => e.target.style.cursor = 'default'}
                          >
                            {student?.full_name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>{academicDetails.roll_number || 'N/A'}</td>
                      <td style={styles.td}>{academicDetails.branch || 'N/A'}</td>
                      <td style={styles.td}>{academicDetails.batch || 'N/A'}</td>
                                             <td style={styles.td}>
                         <span style={styles.cpiBadge}>
                           {academicDetails.cpi || 'N/A'}
                         </span>
                       </td>
                       <td style={styles.td}>
                         <div style={styles.jobInfo}>
                           <span style={styles.jobTitle}>
                             {applicant.jobDetails?.offered_position || 'N/A'}
                           </span>
                         </div>
                       </td>
                       <td style={styles.td}>
                         <span style={styles.companyBadge}>
                           {applicant.jobDetails?.comapany_name || 'N/A'}
                         </span>
                       </td>
                       <td style={styles.td}>{applicant.appliedDate}</td>
                      <td style={styles.td}>
                        {applicant.resume ? (
                          <a 
                            href={`http://localhost:8000/${applicant.resume}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.resumeLink}
                          >
                            📄 View Resume
                          </a>
                        ) : (
                          <span style={styles.noResume}>No Resume</span>
                        )}
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "95%",
    margin: "2rem auto",
    fontFamily: "sans-serif",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e9ecef",
  },
  title: {
    margin: 0,
    color: "#2c3e50",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  stats: {
    display: "flex",
    gap: "1rem",
  },
  statItem: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#6c757d",
    fontSize: "1.1rem",
  },
  errorContainer: {
    textAlign: "center",
    padding: "2rem",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "1.1rem",
    fontWeight: "500",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyText: {
    color: "#6c757d",
    fontSize: "1.2rem",
  },
  actionsContainer: {
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  filtersContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  filterSelect: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "2px solid #e1e8ed",
    fontSize: "0.9rem",
    backgroundColor: "white",
    cursor: "pointer",
    minWidth: "200px",
  },
  downloadBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    "&:hover": {
      backgroundColor: "#218838",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  },
  th: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderBottom: "2px solid #dee2e6",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057",
  },
  tableRow: {
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  td: {
    padding: "1rem",
    borderBottom: "1px solid #dee2e6",
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  profilePic: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profilePlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  nameText: {
    fontWeight: "500",
    color: "#007bff",
    cursor: "pointer",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#0056b3",
    },
  },
  cpiBadge: {
    backgroundColor: "#17a2b8",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  jobInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  jobTitle: {
    fontWeight: "600",
    color: "#2c3e50",
    fontSize: "0.9rem",
  },
  companyBadge: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  resumeLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.2s ease",
  },
  noResume: {
    color: "#6c757d",
    fontStyle: "italic",
  },
  viewBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#0056b3",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
    },
  },
};
