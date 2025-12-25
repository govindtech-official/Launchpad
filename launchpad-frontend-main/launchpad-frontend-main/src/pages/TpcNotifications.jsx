import { useEffect, useState } from "react";
import TpcSidebar from '../components/TpcSidebar';
import { apiGet, apiPost, apiDelete } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function TpcNotification() {
  const [newNotice, setNewNotice] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [notices, setNotices] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 🔄 Fetch notices from backend
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await apiGet(`${apiUrls.GETNOTICES}`);
        
        if (response && Array.isArray(response)) {
          setNotices(response);
        } else {
          console.error("Unexpected response format:", response);
          setNotices([]);
        }
      } catch (err) {
        console.error("Error fetching notices:", err);
        setNotices([]);
      }
    };

    fetchNotices();
  }, []);

  // ➕ Add new notice to backend
  const handleAddNotice = async () => {
    if (!newNotice.trim() || !newTitle.trim()) return;

    try {
      const addnotice = await apiPost(
        `${apiUrls.ADDNOTICES}`,
        {
          title: newTitle,
          message: newNotice,
        }
      );
      
      // Check if the response has the expected structure
      if (addnotice && addnotice.id) {
        setNotices((prev) => [addnotice, ...prev]);
        setNewNotice("");
        setNewTitle("");
      } else {
        console.error("Unexpected response structure:", addnotice);
      }
    } catch (err) {
      console.error("Error adding notice:", err);
      // Don't clear the form on error so user can retry
    }
  };

  // ❌ Delete a notice from backend
  const handleDeleteNotice = async (id) => {
    try {
      await apiDelete(`${apiUrls.DELETENOTICES}${id}/`);
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notice:", err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <TpcSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          current="/tpc-notifications"
        />
      </div>
      <div style={styles.container}>
        <h2 style={styles.header}>📢 TPC Notifications Management</h2>
        
        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter notice title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={styles.titleInput}
            />
          </div>
          <div style={styles.inputGroup}>
            <textarea
              placeholder="Write notice message here..."
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              style={styles.textarea}
            />
          </div>
          <button 
            onClick={handleAddNotice} 
            style={styles.addBtn}
            disabled={!newNotice.trim() || !newTitle.trim()}
          >
            ➕ Add Notification
          </button>
        </div>

        <h3 style={styles.sectionHeader}>📋 All Notifications</h3>
        {notices.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No notifications added yet.</p>
          </div>
        ) : (
          <div style={styles.noticesGrid}>
            {notices.map((notice) => (
              <div key={notice.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{notice.title}</h4>
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    style={styles.deleteBtn}
                    title="Delete notification"
                  >
                    ❌
                  </button>
                </div>
                <p style={styles.cardMessage}>{notice.message}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.dateText}>
                    📅 {formatDate(notice.created_at)}
                  </span>
                  <span style={styles.idText}>ID: {notice.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: "2rem",
    maxWidth: "900px",
    margin: "auto",
    fontFamily: "sans-serif",
    backgroundColor: "transparent",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "2rem",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  form: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  titleInput: {
    width: "100%",
    fontSize: "1rem",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "0.5rem",
  },
  textarea: {
    width: "100%",
    height: "120px",
    fontSize: "1rem",
    padding: "1rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    resize: "vertical",
  },
  addBtn: {
    padding: "1rem 2rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s",
    width: "100%",
  },
  sectionHeader: {
    color: "#2c3e50",
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  emptyText: {
    color: "#6c757d",
    fontSize: "1.1rem",
    margin: 0,
  },
  noticesGrid: {
    display: "grid",
    gap: "1rem",
  },
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e9ecef",
    position: "relative",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  cardTitle: {
    margin: 0,
    color: "#2c3e50",
    fontSize: "1.2rem",
    fontWeight: "bold",
    flex: 1,
  },
  cardMessage: {
    color: "#495057",
    fontSize: "1rem",
    lineHeight: "1.6",
    marginBottom: "1rem",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
    color: "#6c757d",
  },
  dateText: {
    fontWeight: "500",
  },
  idText: {
    fontWeight: "500",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 0.8rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.3s",
    marginLeft: "1rem",
  },
};
