import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TpcSidebar from '../components/TpcSidebar';
import { apiGet } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function TpcDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: '',
    batch: '',
    gender: '',
    search: '',
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsRes = await apiGet(`${apiUrls.STUDENTS}`);
        
        // Extract users from the response
        if (studentsRes && studentsRes.users) {
          setStudents(studentsRes.users);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = students.filter((student) => {
    const academicDetails = student.academic_details || {};
    const branch = academicDetails.branch || '';
    const batch = academicDetails.batch || '';
    const gender = student.gender || '';
    const name = student.full_name || '';
    const rollNo = academicDetails.roll_number || '';

    return (
      (!filters.branch || branch.toLowerCase().includes(filters.branch.toLowerCase())) &&
      (!filters.batch || batch.toLowerCase().includes(filters.batch.toLowerCase())) &&
      (!filters.gender || gender.toLowerCase() === filters.gender.toLowerCase()) &&
      (!filters.search ||
        name.toLowerCase().includes(filters.search.toLowerCase()) ||
        rollNo.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const exportCSV = () => {
    const rows = [
      ['Name', 'Roll No', 'Branch', 'Batch', 'Gender', 'Email', 'Phone'],
      ...filtered.map((student) => {
        const academicDetails = student.academic_details || {};
        return [
          student.full_name || 'N/A',
          academicDetails.roll_number || 'N/A',
          academicDetails.branch || 'N/A',
          academicDetails.batch || 'N/A',
          student.gender || 'N/A',
          student.username || 'N/A',
          student.phone_number || 'N/A',
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'students_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <TpcSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          current="/tpc-dashboard"
        />
        <div style={{ flex: 1, paddingLeft: isSidebarOpen ? '250px' : '0', transition: 'padding-left 0.3s ease' }}>
          <div style={styles.container}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading students data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <TpcSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        current="/tpc-dashboard"
      />

      <div style={{ flex: 1, paddingLeft: isSidebarOpen ? '250px' : '0', transition: 'padding-left 0.3s ease' }}>
        <div style={styles.container}>
          {/* 🔝 Top Bar */}
          <div style={styles.topbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={styles.menuBtn}>☰</button>
              <h2 style={styles.title}>👨‍💼 TPC Dashboard – Student List</h2>
              <span style={styles.studentCount}>({filtered.length} students)</span>
            </div>
          </div>

          {/* 🔍 Filter Section */}
          <div style={styles.filterSection}>
            <div style={styles.filterRow}>
              <input
                placeholder="🔍 Search name or roll no"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={styles.filterInput}
              />
              <input
                placeholder="🏛️ Branch"
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                style={styles.filterInput}
              />
              <input
                placeholder="📚 Batch"
                value={filters.batch}
                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                style={styles.filterInput}
              />
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                style={styles.filterInput}
              >
                <option value="">👤 Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={styles.actionRow}>
              <button onClick={exportCSV} style={styles.exportBtn}>
                📤 Export CSV ({filtered.length} students)
              </button>
              <button 
                onClick={() => setFilters({ branch: '', batch: '', gender: '', search: '' })} 
                style={styles.clearBtn}
              >
                🗑️ Clear Filters
              </button>
            </div>
          </div>

          {/* 📋 Student Table */}
          {filtered.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>👤 Name</th>
                    <th style={styles.th}>🆔 Roll No</th>
                    <th style={styles.th}>🏛️ Branch</th>
                    <th style={styles.th}>📚 Batch</th>
                    <th style={styles.th}>👤 Gender</th>
                    <th style={styles.th}>📧 Email</th>
                    <th style={styles.th}>📱 Phone</th>
                    <th style={styles.th}>👁️ Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const academicDetails = student.academic_details || {};
                    return (
                      <tr key={student.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <div style={styles.nameCell}>
                            {student.profile_picture ? (
                              <img 
                                src={"http://localhost:8000/"+student.profile_picture} 
                                alt={student.full_name}
                                style={styles.profilePic}
                              />
                            ) : (
                              <div style={styles.profilePlaceholder}>
                                {student.full_name?.charAt(0) || '?'}
                              </div>
                            )}
                            <span>{student.full_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{academicDetails.roll_number || 'N/A'}</td>
                        <td style={styles.td}>{academicDetails.branch || 'N/A'}</td>
                        <td style={styles.td}>{academicDetails.batch || 'N/A'}</td>
                        <td style={styles.td}>
                          <span style={styles.genderBadge}>
                            {student.gender || 'N/A'}
                          </span>
                        </td>
                        <td style={styles.td}>{student.username || 'N/A'}</td>
                        <td style={styles.td}>{student.phone_number || 'N/A'}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => navigate(`/profile/${student.id}`)}
                            style={styles.viewBtn}
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <h3>No students found</h3>
              <p>Try adjusting your filters or check if there are any students in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add CSS animation for spinner
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the animation into the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinAnimation;
  document.head.appendChild(style);
}

const styles = {
  container: { 
    padding: '2rem', 
    maxWidth: '100%',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '1.5rem'
  },
  studentCount: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  menuBtn: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '5px',
    transition: 'background-color 0.2s'
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  filterSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem'
  },
  actionRow: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  filterInput: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
    flex: 1,
    minWidth: '200px',
    transition: 'border-color 0.2s'
  },
  exportBtn: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  clearBtn: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#95a5a6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem'
  },
  th: {
    padding: '1rem',
    borderBottom: '2px solid #e9ecef',
    textAlign: 'left',
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
    color: '#495057'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #e9ecef',
    verticalAlign: 'middle'
  },
  tableRow: {
    transition: 'background-color 0.2s'
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem'
  },
  profilePic: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  profilePlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  genderBadge: {
    backgroundColor: '#e8f5e8',
    color: '#27ae60',
    padding: '0.3rem 0.8rem',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  viewBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '1rem'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  }
};
