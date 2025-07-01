import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const UserTable = ({ users, view, onAction, onViewDetails }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Employee ID</TableHead>
            {view === 'pending' && (
              <TableHead>Actions</TableHead>
            )}
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.employeeId}</TableCell>
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
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewDetails(user)}
                >
                  View
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