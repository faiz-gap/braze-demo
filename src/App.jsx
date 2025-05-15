import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BrazeService from './services/braze-service';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Renamed for clarity
  const navigate = useNavigate(); // For programmatic navigation

  useEffect(() => {
    const token = localStorage.getItem('access_token'); // Or 'actor_id'
    setIsAuthenticated(!!token);
    setIsLoadingAuth(false);

    // Initialize Braze early if needed, or handle per-page
    const initBraze = async () => {
      if (!BrazeService.isInitialized) {
        try {
          await BrazeService.initialize();
          console.log("Global: Braze initialized");
        } catch (error) {
          console.error("Global: Braze initialization error", error);
        }
      }
    };
    initBraze();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    // navigate('/dashboard'); // Navigation handled by LoginForm directly
  };

  const logout = () => {
    if (BrazeService.isInitialized) {
      BrazeService.logOutUser();
    }
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/'); // Navigate to login page
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingAuth } = React.useContext(AuthContext);

  if (isLoadingAuth) {
    return <div className="flex items-center justify-center min-h-screen">Loading Authentication...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = React.useContext(AuthContext);
   return (
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
   );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;