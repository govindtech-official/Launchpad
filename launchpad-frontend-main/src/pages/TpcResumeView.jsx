import { useEffect, useState } from "react";
import TpcSidebar from '../components/TpcSidebar';
import { apiGet } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function TpcResumeAccess() {
  const [resumes, setResumes] = useState([]);
  const [filters, setFilters] = useState({
    branch: "",
    batch: "",
    gender: "",
    onlyDefault: false,
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumeRes = await apiGet(`${apiUrls.RESUME}`);
        const resumes = Array.isArray(resumeRes) ? resumeRes : resumeRes.data || [];

        // Fetch all user profiles in parallel
        const userProfiles = await Promise.all(
          resumes.map(async (r) => {
            const url = `${apiUrls.PROFILE}${r.related_user}`;
            try {
              const res = await apiGet(url);
              // Use .data if present, else use res directly
              return res && res.data ? res.data : res;
            } catch (e) {
              return {};
            }
          })
        );

        // Combine resume and user info
        const enrichedResumes = resumes.map((r, idx) => ({
          ...r,
          studentInfo: userProfiles[idx] || {},
        }));

        setResumes(enrichedResumes);
      } catch (err) {
        console.error("Error fetching resume data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(resumes.map(r => r.studentInfo));
  }, [resumes]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Filtering logic (only works if studentInfo fields are present)
  const filteredResumes = resumes.filter(r => {
    const { branch, batch, gender, onlyDefault } = filters;
    const user = r.studentInfo?.user || {};
    const academic = user.academic_details || {};

    const matchBranch = !branch || academic.branch === branch;
    const matchBatch = !batch || academic.batch === batch;
    const matchGender = !gender || user.gender === gender;
    const matchDefault = !onlyDefault || r.is_default;

    return matchBranch && matchBatch && matchGender && matchDefault;
  });

  const branchOptions = Array.from(new Set(resumes.map(r => r.studentInfo?.user?.academic_details?.branch).filter(Boolean)));
  const batchOptions = Array.from(new Set(resumes.map(r => r.studentInfo?.user?.academic_details?.batch).filter(Boolean)));
  const genderOptions = Array.from(new Set(resumes.map(r => r.studentInfo?.user?.gender).filter(Boolean)));

  return (
    <div>
      <TpcSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        current="/tpc-resume-view"
      />
      <div style={{ ...styles.container, marginLeft: isSidebarOpen ? 220 : 60 }}>
        <h2>📂 TPC Resume Access</h2>

        {/* Filters */}
        <div style={styles.filters}>
          <select name="branch" value={filters.branch} onChange={handleFilterChange} style={styles.select}>
            <option value="">All Branches</option>
            {branchOptions.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>

          <select name="batch" value={filters.batch} onChange={handleFilterChange} style={styles.select}>
            <option value="">All Batches</option>
            {batchOptions.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>

          <select name="gender" value={filters.gender} onChange={handleFilterChange} style={styles.select}>
            <option value="">All Genders</option>
            {genderOptions.map(gender => (
              <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
            ))}
          </select>

          {/* <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="onlyDefault"
              checked={filters.onlyDefault}
              onChange={handleFilterChange}
            />
            Only Default Resumes
          </label> */}
        </div>

        {/* Resume Table */}
        {loading ? (
          <p style={{ marginTop: "2rem" }}>Loading...</p>
        ) : filteredResumes.length === 0 ? (
          <p style={{ marginTop: "2rem" }}>❌ No resumes found matching the filters.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thCenter}>S. No.</th>
                <th style={styles.thCenter}>Name</th>
                <th style={styles.thCenter}>Roll No</th>
                <th style={styles.thCenter}>Batch</th>
                <th style={styles.thCenter}>Gender</th>
                <th style={styles.thCenter}>File</th>
                <th style={styles.thCenter}>Default</th>
              </tr>
            </thead>
            <tbody>
              {filteredResumes.map((r, idx) => (
                <tr key={r.id}>
                  <td style={styles.tdCenter}>{idx + 1}</td>
                  <td style={styles.tdCenter}>{r.studentInfo?.user?.full_name || "-"}</td>
                  <td style={styles.tdCenter}>{r.studentInfo?.user?.academic_details?.roll_number || "-"}</td>
                  <td style={styles.tdCenter}>{r.studentInfo?.user?.academic_details?.batch || "-"}</td>
                  <td style={styles.tdCenter}>{r.studentInfo?.user?.gender || "-"}</td>
                  <td style={styles.tdCenter}>
                    <a
                      href={r.resume_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.downloadLink}
                    >
                      📄 Download
                    </a>
                  </td>
                  <td style={styles.tdCenter}>{r.is_default ? "✅ Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  select: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 0 8px rgba(0,0,0,0.05)",
  },
  downloadLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
  th: {
    padding: "0.8rem",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
  },
  td: {
    padding: "0.8rem",
    border: "1px solid #ccc",
  },
  thCenter: {
    padding: "0.8rem",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    textAlign: "center",
  },
  tdCenter: {
    padding: "0.8rem",
    border: "1px solid #ccc",
    textAlign: "center",
  },
};
