import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { apiRequest } from '../lib/utils';

const UserCreationForm = ({ token, isOpen, onCancel, onUserCreated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
    companyId: '',
    upiId: '',
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await apiRequest('get', '/admin/companies', null, token);
        setCompanies(data);
      } catch (err) {
        toast.error("Failed to fetch companies", { description: err.message });
      }
    };
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      companyId: value === 'Company Admin' ? prev.companyId : '', // Clear companyId if not Company Admin
      upiId: value === 'Engineer' ? prev.upiId : '', // Clear upiId if not Engineer
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('post', '/admin/users', formData, token);
      toast.success("User created successfully!");
      onUserCreated();
      onCancel();
    } catch (err) {
      toast.error("User creation failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">Full Name</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select onValueChange={handleRoleChange} value={formData.role} required>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Company Admin">Company Admin</SelectItem>
                <SelectItem value="NetCovet Manager">NetCovet Manager</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Engineer">Engineer</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Site In-charge">Site In-charge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role === 'Company Admin' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">Company</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, companyId: value })} value={formData.companyId} required={formData.role === 'Company Admin'}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {formData.role === 'Engineer' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="upiId" className="text-right">UPI ID</Label>
              <Input id="upiId" name="upiId" value={formData.upiId} onChange={handleChange} className="col-span-3" required />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>Create User</Button>
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationForm;