import { Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PublicProfile from "./pages/PublicProfile";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import StudentAdd from "./pages/StudentAdd";
import StudentNotifications from "./pages/StudentNotifications";
import InternshipPage from "./pages/InternshipPage";
import StudentResume from "./pages/StudentResume";
import StudentInternshipView from "./pages/StudentInternshipView";
import StudentEditProfile from "./pages/StudentEditProfile";
import ConnectWithStudents from './pages/ConnectWithStudents';


// TPC Pages
import TpcDashboard from "./pages/TpcDashboard";
import TpcInternshipView from "./pages/TpcInternshipView";
import TpcStudentProfiles from "./pages/TpcStudentProfiles";
import TpcApprovals from "./pages/TpcApprovals";
import TpcJobPosting from "./pages/TpcJobPosting"; 
import TpcAnalytics from "./pages/TpcAnalytics";
import TpcNotifications from "./pages/TpcNotifications";

import TpcApplicants from "./pages/TpcApplicants";
import TpcResumeView from "./pages/TpcResumeView";
import StudentRequestEdit from "./pages/StudentRequestEdit";



// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";




export default function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile/:id" element={<PublicProfile />} />

      {/* Student Protected Routes       */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-add"
        element={
          <ProtectedRoute>
            <StudentAdd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-notifications"
        element={
          <ProtectedRoute>
            <StudentNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-internship"
        element={
          <ProtectedRoute>
            <InternshipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-internship-view"
        element={
          <ProtectedRoute>
            <StudentInternshipView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-resume"
        element={  <ProtectedRoute>
            <StudentResume />
          </ProtectedRoute>
        }
        
      />
      <Route
        path="/student-edit-profile"
        element={ <ProtectedRoute>
            <StudentEditProfile />
          </ProtectedRoute>
         
        }
      />


<Route
  path="/connect-with-students"
  element={
    <ProtectedRoute>
      <ConnectWithStudents />
    </ProtectedRoute>
  }
/>

      


      {/*  TPC Protected routes */}
      <Route
        path="/tpc-dashboard"
        element={
          <ProtectedRoute>
            <TpcDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tpc-internships"
        element={
          <ProtectedRoute>
            <TpcInternshipView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tpc-student-profiles"
        element={
          <ProtectedRoute>
            <TpcStudentProfiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tpc-approvals"
        element={
          <ProtectedRoute>
            <TpcApprovals />
          </ProtectedRoute>
        }
      />
    <Route
  path="/tpc-job-posting"
  element={
    <ProtectedRoute>
      <TpcJobPosting />
    </ProtectedRoute>
  }
/>
      <Route
        path="/tpc-analytics"
        element={
          <ProtectedRoute>
            <TpcAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tpc-notifications"
        element={
          <ProtectedRoute>
            <TpcNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tpc-applicants"
        element={
          <ProtectedRoute>
            <TpcApplicants />
          </ProtectedRoute>
        }
      />

      <Route
  path="/tpc-resume-view"
  element={
    <ProtectedRoute>
      <TpcResumeView />
    </ProtectedRoute>
  }
/>

      



<Route
  path="/student-request-edit"
  element={
    <ProtectedRoute>
      <StudentRequestEdit />
    </ProtectedRoute>
  }
/>


      {/* ❌ 404 Fallback */}
      <Route
        path="*"
        element={<h2 style={{ padding: '2rem' }}>404 - Page Not Found</h2>}
      />
    </Routes>
  );
}
