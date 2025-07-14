import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Login from './Login';
import { Toaster } from "@/components/ui/sonner"; // Using sonner for notifications
import { ThemeProvider } from "./components/theme-provider"; // Importing the theme provider

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin-token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user-role'));
  const [companyId, setCompanyId] = useState(localStorage.getItem('company-id'));

  const handleLogin = (newToken, role, companyId) => {
    localStorage.setItem('admin-token', newToken);
    localStorage.setItem('user-role', role);
    localStorage.setItem('company-id', companyId);
    setToken(newToken);
    setUserRole(role);
    setCompanyId(companyId);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('company-id');
    setToken(null);
    setUserRole(null);
    setCompanyId(null);
  };

  return (
    <>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">

      <Router>
        <Routes>
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/admin" />} />
          <Route
            path="/admin/*"
            element={token ? <AdminDashboard token={token} onLogout={handleLogout} userRole={userRole} companyId={companyId} /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to={token ? "/admin" : "/login"} />} />
        </Routes>
      </Router>
      <Toaster richColors />
      </ThemeProvider>
    </>
  );
}

export default App;
