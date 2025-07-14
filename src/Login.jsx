import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

const API_URL = 'http://localhost:8021/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const { token, user } = response.data;
      if (!token || !user || !user.role) {
        throw new Error('Login response missing token or user role.');
      }
      // Check if the role is one of the allowed admin panel roles
      const allowedRoles = ['Admin', 'Company Admin', 'NetCovet Manager'];
      if (!allowedRoles.includes(user.role)) {
        throw new Error('Access Denied. Your role does not have access to this panel.');
      }
      toast.success("Login successful!");
      localStorage.setItem('user-id', user.id);
      localStorage.setItem('user-full-name', user.fullName);
      onLogin(token, user.role, user.companyId); // Pass token, role, and companyId
      navigate('/admin');
    } catch (err) {
      toast.error("Login Failed", {
        description: err.response?.data?.message || 'Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Panel Login</CardTitle>
          <CardDescription>Enter credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} placeholder="admin@example.com" /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
