import { useEffect, useState } from "react";

export default function TpcStudentProfiles() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("allStudents")) || [];
    setStudents(data);
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2>📋 All Student Profiles</h2>

      <input
        type="text"
        placeholder="Search by name or roll no..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.search}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Course</th>
            <th>Batch</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <tr key={s.rollNo}>
                <td>{s.name}</td>
                <td>{s.rollNo}</td>
                <td>{s.course}</td>
                <td>{s.batch}</td>
                <td>{s.gender}</td>
                <td>
                  <a
                    href={`/profile/${s.rollNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.viewBtn}
                  >
                    🔍 View
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  search: {
    padding: "0.6rem",
    width: "100%",
    marginBottom: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  viewBtn: {
    padding: "0.3rem 0.8rem",
    fontSize: "0.9rem",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "5px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
