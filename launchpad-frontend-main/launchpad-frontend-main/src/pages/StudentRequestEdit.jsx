import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentEdit() {
  const [internship, setInternship] = useState(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(""); // approval status
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchInternship();
  }, []);

  const fetchInternship = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/internships/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const latest = res.data[res.data.length - 1];
      setInternship(latest);
      setCompany(latest.company);
      setRole(latest.role);
      setStartDate(latest.start_date);
      setEndDate(latest.end_date);
      setDescription(latest.description);
      setStatus(latest.status || "Not Requested");
    } catch (err) {
      console.error("Error fetching internship:", err);
      setError("⚠️ Could not load internship data.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!internship) {
      setError("No internship found to edit.");
      return;
    }

    const payload = {
      internship: internship.id,
      new_company: company,
      new_role: role,
      new_start_date: startDate,
      new_end_date: endDate,
      new_description: description,
    };

    try {
      await axios.post("http://localhost:8000/api/internship-approvals/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("✅ Edit request submitted for approval.");
    } catch (err) {
      console.error("Error submitting approval request:", err);
      setError("❌ Failed to submit approval request.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>✏️ Request Internship Edit</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {!internship ? (
        <p>Loading internship data...</p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Company Name:</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={styles.input}
          />

          <label>Role:</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          />

          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />

          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={styles.textarea}
          />

          <button type="submit" style={styles.button}>
            📤 Request Edit Approval
          </button>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "650px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.6rem",
    marginBottom: "1rem",
    fontSize: "1rem",
  },
  textarea: {
    padding: "0.6rem",
    marginBottom: "1rem",
    fontSize: "1rem",
  },
  button: {
    padding: "0.8rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
  },
};
