import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = 'http://localhost:8021/api';

const AssignEngineerModal = ({ ticketId, onAssign, onCancel }) => {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngineers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin-token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/admin/engineers/approved`, config);
        setEngineers(data);
      } catch (err) {
        toast.error("Failed to fetch engineers", {
          description: err.response?.data?.message || "An error occurred while loading available engineers.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEngineers();
  }, []);

  const handleSubmit = () => {
    if (!selectedEngineer) {
      return toast.error("No Engineer Selected", {
        description: "Please select an engineer from the list.",
      });
    }
    onAssign(ticketId, selectedEngineer);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-6 rounded-lg shadow-xl">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">Assign Engineer Manually</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select an approved engineer to send an assignment request for this ticket.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">Loading available engineers...</div>
        ) : (
          <div className="py-4 space-y-2">
            <Label htmlFor="engineer-select" className="text-base">Available Engineers</Label>
            <Select onValueChange={setSelectedEngineer} value={selectedEngineer}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="-- Select an Engineer --" />
              </SelectTrigger>
              <SelectContent>
                {engineers.map(eng => (
                  <SelectItem key={eng._id} value={eng._id}>
                    {eng.fullName} ({eng.expertise.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <DialogFooter className="pt-4 border-t border-border">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedEngineer}>
            Send Assignment Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEngineerModal;
