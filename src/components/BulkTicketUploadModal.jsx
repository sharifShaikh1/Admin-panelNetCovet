import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import axios from 'axios';

const BulkTicketUploadModal = ({ token, isOpen, onCancel, onComplete }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setFile(selectedFile);
    } else {
      toast.error("Invalid File Type", { description: "Please upload a valid .xlsx Excel file." });
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Validate the parsed data
        if (json.length === 0) throw new Error("Excel sheet is empty or has an invalid format.");

        // Map to the expected backend format
        const tickets = json.map(row => ({
          companyName: row['Company Name'],
          siteAddress: row['Site Address'],
          workDescription: row['Work Description'],
          amount: parseFloat(row['Amount']),
          expertiseRequired: row['Expertise Required'] ? row['Expertise Required'].split(',').map(s => s.trim()) : [],
          coordinates: {
            latitude: parseFloat(row['Latitude']),
            longitude: parseFloat(row['Longitude']),
          },
        }));

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('http://localhost:8021/api/tickets/bulk-create', { tickets }, config);
        
        if (response.data.failedCount > 0) {
          toast.error("Bulk Upload with Failures", {
            description: `${response.data.createdCount} tickets created, ${response.data.failedCount} failed. See console for details.`, // Or display failures more prominently
          });
          console.error("Bulk Upload Failures:", response.data.failures);
        } else {
          toast.success("Bulk Upload Complete", {
            description: response.data.message,
          });
        }
        onComplete(); // Close modal and refresh data

      } catch (err) {
        toast.error("Upload Failed", {
          description: err.response?.data?.message || err.message || "An error occurred during processing.",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Ticket Upload</DialogTitle>
          <DialogDescription>
            Upload an .xlsx file with columns: "Company Name", "Site Address", "Work Description", "Amount", "Expertise Required".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="file-upload">Excel File (.xlsx)</Label>
          <Input id="file-upload" type="file" onChange={handleFileChange} accept=".xlsx" />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload and Create Tickets'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkTicketUploadModal;
