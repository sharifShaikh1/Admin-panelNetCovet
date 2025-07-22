import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Login from './Login';
import { Toaster } from "@/components/ui/sonner"; // Using sonner for notifications
import { ThemeProvider } from "./components/theme-provider"; // Importing the theme provider

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8021/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('admin-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

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
    <ApolloProvider client={client}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.div>
        <Toaster richColors />
      </ThemeProvider>
    </ApolloProvider>
    </>
  );
}

import { motion } from "framer-motion";

export default App;
