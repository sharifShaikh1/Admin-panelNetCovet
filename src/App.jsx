import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Login from './Login';
import { Toaster } from "@/components/ui/sonner"; // Using sonner for notifications
import { ThemeProvider } from "./components/theme-provider"; // Importing the theme provider

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin-token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('admin-token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    setToken(null);
  };

  return (
    <>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">

      <Router>
        <Routes>
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/admin" />} />
          <Route
            path="/admin/*"
            element={token ? <AdminDashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
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
