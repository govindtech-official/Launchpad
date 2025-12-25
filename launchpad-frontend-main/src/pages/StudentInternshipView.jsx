import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentInternshipView() {
  const [internships, setInternships] = useState([]);
  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/internships/");
        const allInternships = res.data;

        // Filter internships by current logged-in student
        const studentInternships = allInternships.filter(
          (i) => i.student.toString() === studentId
        );
        setInternships(studentInternships);
      } catch (err) {
        console.error("Error fetching internships:", err);
      }
    };

    fetchInternships();
  }, [studentId]);

  if (internships.length === 0) {
    return <h2 style={{ padding: "2rem" }}>❌ No internships submitted yet.</h2>;
  }

  return (
    <div style={styles.container}>
      <h2>🎓 My Internships</h2>
      {internships.map((intern, index) => (
        <div key={index} style={styles.card}>
          <p><strong>🏢 Company:</strong> {intern.company}</p>
          <p><strong>🧑‍💻 Role:</strong> {intern.role}</p>
          <p><strong>📅 Start:</strong> {intern.start_date}</p>
          <p><strong>📅 End:</strong> {intern.end_date}</p>
          <p><strong>📝 Description:</strong> {intern.description}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
};
