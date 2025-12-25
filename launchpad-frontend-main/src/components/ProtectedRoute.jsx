import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const isTpcStaff = localStorage.getItem('is_tpcstaff') === 'true';
  const location = useLocation();

  // Redirect to login if not logged in (check for token)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Define route categories
  const studentPaths = ["/student-dashboard", "/student-add", "/student-notifications", "/student-internship", "/student-internship-view", "/student-resume", "/student-edit-profile", "/connect-with-students", "/student-request-edit"];
  const tpcPaths = ["/tpc-dashboard", "/tpc-internships", "/tpc-student-profiles", "/tpc-approvals", "/tpc-job-posting", "/tpc-analytics", "/tpc-notifications", "/tpc-applicants", "/tpc-resume-view"];

  const isStudentRoute = studentPaths.some(path => location.pathname.startsWith(path));
  const isTpcRoute = tpcPaths.some(path => location.pathname.startsWith(path));

  // Check access based on is_tpcstaff flag
  if (isStudentRoute && isTpcStaff) {
    // TPC staff trying to access student routes - redirect to TPC dashboard
    return <Navigate to="/tpc-dashboard" replace />;
  }
  if (isTpcRoute && !isTpcStaff) {
    // Student trying to access TPC routes - redirect to student dashboard
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
}
