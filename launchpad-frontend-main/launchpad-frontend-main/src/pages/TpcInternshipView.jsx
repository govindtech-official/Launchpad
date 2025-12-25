import { useEffect, useState } from 'react';

export default function TpcInternshipView() {
  const [internships, setInternships] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('internships')) || {};
    setInternships(data);
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📋 Internship Submissions</h2>

      {Object.keys(internships).length === 0 ? (
        <p>No internship data submitted yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Company</th>
              <th>Role</th>
              <th>Duration</th>
              <th>Stipend</th>
              <th>Location</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(internships).map(([rollNo, data]) => (
              <tr key={rollNo}>
                <td>{rollNo}</td>
                <td>{data.company}</td>
                <td>{data.role}</td>
                <td>{data.duration}</td>
                <td>{data.stipend}</td>
                <td>{data.location}</td>
                <td>{data.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
  },
  heading: {
    marginBottom: '1rem',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
  },
  th: {
    backgroundColor: '#f0f0f0',
    padding: '0.75rem',
    textAlign: 'left',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #ddd',
  },
};
