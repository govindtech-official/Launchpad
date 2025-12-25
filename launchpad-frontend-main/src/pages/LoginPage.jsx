import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export default function LoginPage() {
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.endsWith("@iitp.ac.in")) {
      setError("Only IIT Patna email (@iitp.ac.in) is allowed.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await apiPost(apiUrls.LOGIN, { email, password }, {
        "Content-Type": "application/json",
      });
      const user = result.user;

      localStorage.setItem("id", user.id);
      localStorage.setItem("email", user.email);
      localStorage.setItem("token", result.access);
      localStorage.setItem("refresh", result.refresh);
      localStorage.setItem("is_tpcstaff", user.is_tpcstaff || false); // Store is_tpcstaff flag

      // Navigate based on is_tpcstaff flag
      if (user.is_tpcstaff) {
        navigate("/tpc-dashboard");
      } else {
        navigate("/student-dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoText}>🚀</span>
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your Launchpad Portal account</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Enter your IIT Patna email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                className="login-input"
                required
                disabled={isLoading}
              />
              <span style={styles.inputIcon}>📧</span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                className="login-input"
                required
                disabled={isLoading}
              />
              <span style={styles.inputIcon}>🔒</span>
            </div>
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.error}>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonLoading : {})
            }}
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Having trouble? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logo: {
    marginBottom: '20px',
  },
  logoText: {
    fontSize: '48px',
    display: 'block',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
    fontWeight: '400',
  },
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '16px 48px 16px 16px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '2px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
  },
  inputIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#999',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
  },
  errorIcon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  buttonLoading: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },
};
