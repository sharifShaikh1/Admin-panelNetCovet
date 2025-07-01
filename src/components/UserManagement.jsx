import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import UserTable from './UserTable';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = 'http://localhost:8021/api';

const UserManagement = ({ token, onAction, onViewDetails, handleApiError }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { status } = useParams();

  const fetchUsers = useCallback(async () => {
    // Ensure status is valid before fetching
    if (!['pending', 'approved'].includes(status)) return;
    
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/admin/engineers/${status}`, config);
      setUsers(data);
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setLoading(false); 
    }
  }, [token, status, handleApiError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-6">User Management</h2>
      <Card className="shadow-lg">
        <CardHeader className="p-4 border-b border-border bg-muted/20">
          <nav className="flex space-x-6">
            <NavLink to="/admin/engineers/pending" className={({ isActive }) => `pb-3 px-2 font-semibold text-base ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary hover:border-b-2 hover:border-muted-foreground'}`}>Pending Applications</NavLink>
            <NavLink to="/admin/engineers/approved" className={({ isActive }) => `pb-3 px-2 font-semibold text-base ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary hover:border-b-2 hover:border-muted-foreground'}`}>Approved Engineers</NavLink>
          </nav>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <UserTable 
              users={users} 
              view={status} 
              onAction={onAction} 
              onViewDetails={onViewDetails} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
