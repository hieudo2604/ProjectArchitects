import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Dashboard from "./pages/Dashboard";
import ProjectBoard from "./pages/ProjectBoard";

//if user is not logged in and tries to visit /dashboard, they get redirected to /
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

//if user is already logged in and visits /, they get redirected to /dashboard automatically
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true,}}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} /> 
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projectboard/:projectId" element={<ProtectedRoute><ProjectBoard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>  
  );
}

export default App;

