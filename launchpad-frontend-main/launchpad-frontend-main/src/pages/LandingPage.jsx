import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Full page background image */}
      <div style={styles.backgroundImage}></div>

      {/* Overlay content */}
      <div style={styles.overlay}>
        <h1 style={styles.heading}>🚀 Welcome to Launchpad Portal</h1>
        <p style={styles.subtext}>Your gateway to placements ,connections and internships.</p>

        <div style={styles.buttonGroup}>
          <button
            style={styles.button}
            onClick={() => navigate('/login?role=student')}
          >
            Student Login
          </button>
          <button
            style={styles.button}
            onClick={() => navigate('/login?role=tpc')}
          >
            TPC Login
          </button>
        </div>

        <div style={styles.links}>
          <a href="#about" style={styles.link}>About the Portal</a> |{' '}
          <a href="#contact" style={styles.link}>Contact Us</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
  },
  backgroundImage: {
    backgroundImage: 'url("/campus.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 0,
    filter: 'brightness(0.7)', // Slight dark overlay for better text readability
  },
  overlay: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    color: 'white',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  heading: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  subtext: {
    fontSize: '1.3rem',
    marginBottom: '2rem',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  links: {
    fontSize: '1rem',
    color: '#ccc',
  },
  link: {
    color: '#ddd',
    textDecoration: 'none',
  },
};
