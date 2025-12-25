import { useEffect, useState } from "react";
import axios from "axios";

export default function ConnectWithStudents() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentRes = await axios.get("http://localhost:8000/api/students/");
        const profileRes = await axios.get("http://localhost:8000/api/profiles/");

        // Map profile by student ID
        const profileMap = {};
        profileRes.data.forEach((p) => {
          profileMap[p.student] = p;
        });

        const enrichedStudents = studentRes.data.map((s) => {
          const profile = profileMap[s.id];
          return {
            ...s,
            linkedin: profile?.linkedin || "",
            profile_pic: profile?.profile_pic || "",
          };
        });

        setStudents(enrichedStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();

    // 🔥 Hover zoom-out and color change style injected
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .student-card {
        transition: transform 0.3s ease, background-color 0.3s ease;
      }
      .student-card:hover {
        transform: scale(0.94);
        background-color: #e6f0ff;
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2>🤝 Connect With Fellow Students</h2>

      <input
        type="text"
        placeholder="Search by name or roll no..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.search}
      />

      {students.length === 0 ? (
        <p>Loading students...</p>
      ) : filtered.length === 0 ? (
        <p>❌ No students found.</p>
      ) : (
        <div style={styles.cardGrid}>
          {filtered.map((s) => (
            <div key={s.id} className="student-card" style={styles.card}>
              <img
                src={s.profile_pic || "https://via.placeholder.com/100"}
                alt="Profile"
                style={styles.avatar}
              />
              <h3>{s.name}</h3>
              <p><strong>Roll No:</strong> {s.roll_no}</p>
              <p><strong>Course:</strong> {s.course}</p>
              <p><strong>Batch:</strong> {s.batch}</p>

              {s.linkedin && (
                <a
                  href={s.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.connectBtn}
                >
                  🔗 Connect
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  search: {
    width: "100%",
    padding: "0.8rem",
    marginBottom: "1.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: "1rem",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "0.5rem",
    border: "2px solid #007bff",
  },
  connectBtn: {
    marginTop: "0.5rem",
    display: "inline-block",
    padding: "0.5rem 1rem",
    backgroundColor: "#0077b5",
    color: "white",
    borderRadius: "5px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
