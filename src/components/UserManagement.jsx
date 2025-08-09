import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { apiRequest } from '../lib/utils';
import UserTable from './UserTable';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const USER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const userCache = {};

const UserManagement = ({ token, onAction, onViewDetails, handleApiError }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { status } = useParams();
  const [idProofUrl, setIdProofUrl] = useState(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    // Ensure status is valid before fetching
    if (!['pending', 'approved'].includes(status)) return;
    
    setLoading(true);

    const cacheKey = status;
    const cachedData = userCache[cacheKey];

    if (cachedData && (Date.now() - cachedData.timestamp < USER_CACHE_DURATION)) {
      setUsers(cachedData.data);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('get', `/admin/engineers/${status}`, null, token);
      userCache[cacheKey] = { data, timestamp: Date.now() };
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

  const handleViewId = (url) => {
    setIdProofUrl(url);
    setIsIdModalOpen(true);
  };

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
              onViewId={handleViewId}
              token={token}
            />
          )}
        </CardContent>
      </Card>
      <Dialog open={isIdModalOpen} onOpenChange={setIsIdModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ID Proof</DialogTitle>
          </DialogHeader>
          <img src={idProofUrl} alt="ID Proof" className="max-w-full h-auto" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
