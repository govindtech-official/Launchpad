import { useEffect, useState } from "react";
import TpcSidebar from '../components/TpcSidebar';
import { apiGet, apiPatch } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function TPCApprovalPage() {
  const [approvals, setApprovals] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");
  const [loadingId, setLoadingId] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const internshipsRes = await apiGet(
        `${apiUrls.INTERNSHIPS}`
      );
      setApprovals(internshipsRes);
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setError("Failed to fetch internship approval requests.");
    }
  };

  const handleAction = async (id, status) => {
    setLoadingId(id);
    try {
      await apiPatch(
        `${apiUrls.INTERNSHIPS}${id}/`,
        { approval_status: status },
      );
      fetchApprovals();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <TpcSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          current="/tpc-approvals"
        />
      </div>
      <div style={styles.mainContent}>
        <h2 style={styles.heading}>📋 Internship Approval Requests</h2>
        {error && <p style={styles.error}>{error}</p>}
        {approvals.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 64, marginBottom: 12 }}>🎉</span>
            <p style={{ color: "#888", marginTop: 16, fontSize: 20, fontWeight: 500 }}>No internship requests pending.<br />Enjoy your day!</p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              style={{
                ...styles.card,
                borderLeft: `6px solid ${getStatusColor(approval.approval_status)}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                position: "relative",
                transition: "box-shadow 0.2s, transform 0.2s",
                marginBottom: 32,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.13)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <div style={styles.avatar}>
                  <span role="img" aria-label="student">👤</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>{approval.organization_name}</h3>
                  <div style={styles.infoRow}><span style={styles.label}>Domain:</span> {approval.domain}</div>
                  <div style={styles.infoRow}><span style={styles.label}>Student ID:</span> {approval.student}</div>
                </div>
                <span style={{ ...styles.badge, ...getBadgeStyle(approval.approval_status) }}>
                  {getStatusIcon(approval.approval_status)} {approval.approval_status}
                </span>
              </div>
              <div style={styles.infoRow}><span style={styles.label}>Duration:</span> {approval.internship_duration}</div>
              <div style={styles.infoRow}><span style={styles.label}>Description:</span> {approval.internship_description}</div>
              <div style={styles.infoRow}><span style={styles.label}>Created:</span> {new Date(approval.created_at).toLocaleDateString()}</div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Certificate:</span>{" "}
                {approval.certificate
                  ? <a href={approval.certificate} target="_blank" rel="noopener noreferrer" style={styles.link}><span role="img" aria-label="certificate">📄</span> View</a>
                  : <span style={{ color: "#bbb" }}><span role="img" aria-label="no-certificate">❌</span> Not uploaded</span>}
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Experience Letter:</span>{" "}
                {approval.experience_letter
                  ? <a href={approval.experience_letter} target="_blank" rel="noopener noreferrer" style={styles.link}><span role="img" aria-label="letter">📄</span> View</a>
                  : <span style={{ color: "#bbb" }}><span role="img" aria-label="no-letter">❌</span> Not uploaded</span>}
              </div>
              {approval.approval_status === "Pending" && (
                <div style={{ marginTop: "1.5rem", display: "flex", gap: 12 }}>
                  <button
                    onClick={() => handleAction(approval.id, "Approved")}
                    style={{ ...styles.approveBtn, minWidth: 120 }}
                    disabled={loadingId === approval.id}
                  >
                    {loadingId === approval.id ? "Approving..." : "✅ Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(approval.id, "Rejected")}
                    style={{ ...styles.rejectBtn, minWidth: 120 }}
                    disabled={loadingId === approval.id}
                  >
                    {loadingId === approval.id ? "Rejecting..." : "❌ Reject"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper for badge color
function getBadgeStyle(status) {
  if (status === "Approved") return { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" };
  if (status === "Rejected") return { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" };
  return { background: "#fff3cd", color: "#856404", border: "1px solid #ffeeba" };
}

function getStatusColor(status) {
  if (status === "Approved") return "#28a745";
  if (status === "Rejected") return "#dc3545";
  return "#ffc107";
}

function getStatusIcon(status) {
  if (status === "Approved") return "✅";
  if (status === "Rejected") return "❌";
  return "⏳";
}

const styles = {
  mainContent: {
    flex: 1,
    padding: "2.5rem 2rem",
    margin: "0 auto",
    width: "100%",
  },
  heading: {
    fontFamily: "sans-serif",
    fontWeight: 700,
    fontSize: 28,
    marginBottom: 24,
    color: "#222"
  },
  error: {
    color: "#dc3545",
    background: "#f8d7da",
    padding: "0.75rem 1rem",
    borderRadius: 6,
    marginBottom: 16,
    border: "1px solid #f5c6cb"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 320,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    marginTop: 60,
  },
  card: {
    border: "1px solid #e3e6f0",
    borderRadius: "14px",
    padding: "1.7rem 1.5rem 1.2rem 1.5rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    transition: "box-shadow 0.2s, transform 0.2s",
    marginBottom: 32,
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    color: "#222",
    marginBottom: 2,
  },
  badge: {
    padding: "0.35em 1.1em",
    borderRadius: 16,
    fontWeight: 700,
    fontSize: 15,
    display: "inline-block",
    marginLeft: 8,
    border: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    letterSpacing: 0.2,
  },
  infoRow: {
    margin: "0.4rem 0",
    color: "#444",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "#888",
    fontWeight: 500,
    minWidth: 120,
    display: "inline-block",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#f0f1f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    marginRight: 18,
    border: "2px solid #e3e6f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  link: {
    color: "#007bff",
    // textDecoration: "underline",
    fontWeight: 500,
    marginLeft: 4,
  },
  approveBtn: {
    padding: "0.6rem 1.3rem",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "22px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
    transition: "background 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(40,167,69,0.08)",
  },
  rejectBtn: {
    padding: "0.6rem 1.3rem",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "22px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
    transition: "background 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(220,53,69,0.08)",
  },
};
