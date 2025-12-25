import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiPost } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";


export default function TpcSidebar({ isOpen, toggleSidebar, current }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh');
    await apiPost(apiUrls.LOGOUT, { refresh: refreshToken });
    localStorage.clear();
    navigate('/login');
  };

  const handleAnalyticsClick = (e) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Auto hide after 3 seconds
  };

  return (
    <>
      <div style={{
        width: isOpen ? "250px" : "0",
        overflowX: "hidden",
        transition: "0.3s",
        backgroundColor: "#212529",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        zIndex: 1,
        paddingTop: "20px",
        display: "flex",
        flexDirection: "column"
      }}>
        {isOpen && (
          <>
            <div style={{ padding: "0 1rem", flex: 1 }}>
              <h3 style={{ color: "#fff", marginBottom: "2rem" }}>📊 TPC Panel</h3>

              <NavItem to="/tpc-dashboard" label="Student Profiles" current={current} />
              <NavItem to="/tpc-approvals" label="Approvals" current={current} />
              <NavItem to="/tpc-job-posting" label="Job Posting" current={current} />

              <NavItem to="/tpc-analytics" label="Analytics" current={current} onClick={handleAnalyticsClick} />
              <NavItem to="/tpc-notifications" label="Notifications" current={current} />
              <NavItem to="/tpc-applicants" label="Applicants" current={current} />
              <NavItem to="/tpc-resume-view" label="View Resumes" current={current} />
            </div>
            
            <div style={{ padding: "0 1rem", marginBottom: "2rem" }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                🔓 Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 1000,
          textAlign: "center",
          minWidth: "300px"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
          <h3 style={{ marginBottom: "1rem", color: "#333" }}>Coming Soon!</h3>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            This feature will come soon! Thank you for visiting.
          </p>
          <button
            onClick={() => setShowPopup(false)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            OK
          </button>
        </div>
      )}
    </>
  );
}

function NavItem({ to, label, current, onClick }) {
  const isActive = current === to;
  return (
    <div style={{ marginBottom: "1rem" }}>
      <Link
        to={to}
        onClick={onClick}
        style={{
          color: isActive ? "#ffc107" : "#fff",
          textDecoration: "none",
          fontWeight: isActive ? "bold" : "normal",
        }}
      >
        {label}
      </Link>
    </div>
  );
}
