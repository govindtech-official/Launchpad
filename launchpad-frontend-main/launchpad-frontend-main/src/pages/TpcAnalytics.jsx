import { useEffect, useState } from "react";
import axios from "axios";

export default function TpcAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/tpc-analytics/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("⚠️ Failed to load analytics data.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📊 TPC Analytics Dashboard</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {!analytics ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* CPI Distribution */}
          <div style={styles.card}>
            <h3>📈 CPI Distribution</h3>
            {analytics.cpi_distribution.length === 0 ? (
              <p>No CPI data.</p>
            ) : (
              <ul>
                {analytics.cpi_distribution.map((item, index) => (
                  <li key={index}>
                    CPI: <strong>{item.cpi}</strong> — <strong>{item.count}</strong> students
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Internship Domains */}
          <div style={styles.card}>
            <h3>🧳 Internship Domains</h3>
            {analytics.internship_domains.length === 0 ? (
              <p>No internships found.</p>
            ) : (
              <ul>
                {analytics.internship_domains.map((item, index) => (
                  <li key={index}>
                    Domain: <strong>{item.domain}</strong> — <strong>{item.count}</strong> students
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Resume Upload Stats */}
          <div style={styles.card}>
            <h3>📄 Resume Upload Stats</h3>
            {analytics.resume_uploads_stats.length === 0 ? (
              <p>No resumes uploaded yet.</p>
            ) : (
              <ul>
                {analytics.resume_uploads_stats.map((item, index) => (
                  <li key={index}>
                    <strong>{item.total}</strong> resume(s) — <strong>{item.count}</strong> students
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* GitHub / LinkedIn Completeness */}
          <div style={styles.card}>
            <h3>🔗 External Links Completion</h3>
            <p>✅ GitHub complete: <strong>{analytics.github_complete}</strong> students</p>
            <p>✅ LinkedIn complete: <strong>{analytics.linkedin_complete}</strong> students</p>
          </div>

          {/* Job Applications Trend */}
          <div style={styles.card}>
            <h3>📅 Job Applications Trend</h3>
            {analytics.job_applications_trend.length === 0 ? (
              <p>No job applications yet.</p>
            ) : (
              <ul>
                {analytics.job_applications_trend.map((item, index) => (
                  <li key={index}>
                    Date: <strong>{item.date}</strong> — <strong>{item.count}</strong> applications
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#f4f4f4",
    padding: "1rem",
    marginBottom: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
};
