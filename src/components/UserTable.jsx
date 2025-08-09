import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { apiRequest } from '../lib/utils';
import { toast } from 'sonner';

const UserTable = ({ users, view, onAction, onViewDetails, onViewId, token }) => {

  const handleOnboard = async (userId) => {
    try {
      const response = await apiRequest('post', '/stripe/onboard-user', { userId }, token);
      window.location.href = response.url;
    } catch (err) {
      toast.error("Failed to start Stripe onboarding", { description: err.message });
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>UPI ID</TableHead>
            {view === 'pending' && (
              <TableHead>Actions</TableHead>
            )}
             {view !== 'pending' && (
              <TableHead>Stripe Onboarding</TableHead>
            )}
            <TableHead>Details</TableHead>
            <TableHead>ID Proof</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.employeeId}</TableCell>
              <TableCell>{user.upiId}</TableCell>
              {view === 'pending' && (
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction(user._id, 'approve')}
                    className="mr-2"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onAction(user._id, 'reject')}
                  >
                    Reject
                  </Button>
                </TableCell>
              )}
              {view !== 'pending' && user.role === 'Engineer' && (
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOnboard(user._id)}
                  >
                    {user.stripeAccountId ? 'Manage Onboarding' : 'Onboard to Stripe'}
                  </Button>
                </TableCell>
              )}
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewDetails(user)}
                >
                  View
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewId(user.documents.idProofPicture)}
                >
                  View ID
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;