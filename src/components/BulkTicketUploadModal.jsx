import React, { useState } from 'react';

import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { toast } from "sonner";

// import * as XLSX from 'xlsx'; // REMOVED: Old xlsx import

import ExcelJS from 'exceljs'; // ADDED: ExcelJS import

import axios from 'axios';



const API_URL = 'http://localhost:8021/api'; // Assuming this is defined or available



const BulkTicketUploadModal = ({ token, isOpen, onCancel, onComplete, userRole, companyId }) => {

  const [file, setFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);



  const handleFileChange = (e) => {

    const selectedFile = e.target.files[0];

    // Ensure it's an Excel file type

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

        const data = e.target.result; // Data is ArrayBuffer from FileReader



        // --- NEW EXCELJS PARSING LOGIC ---

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.load(data); // Load the ArrayBuffer data



        const worksheet = workbook.getWorksheet(1); // Get the first worksheet (index 1)

        if (!worksheet) {

          throw new Error("No worksheet found in the Excel file.");

        }



        const json = [];

        let headers = [];



        worksheet.eachRow((row, rowNumber) => {

          if (rowNumber === 1) { // Assuming the first row contains headers

            headers = row.values.map(header => header ? String(header).trim() : '').filter(Boolean);

            // Replace spaces with empty string for keys if your backend expects "CompanyName" instead of "Company Name"

            // headers = headers.map(h => h.replace(/\s/g, '')); // Optional: if your backend keys are camelCase without spaces

          } else {

            const rowData = {};

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {

              const headerName = headers[colNumber - 1]; // ExcelJS columns are 1-indexed

              if (headerName) {

                rowData[headerName] = cell.value;

              }

            });

            // Only push if the row is not entirely empty (e.g., just a blank row at the end of the sheet)

            if (Object.values(rowData).some(val => val !== null && val !== undefined && val !== '')) {

              json.push(rowData);

            }

          }

        });

        // --- END NEW EXCELJS PARSING LOGIC ---



        // Validate the parsed data

        if (json.length === 0) throw new Error("Excel sheet is empty or has an invalid format.");



        // Map to the expected backend format

        const tickets = json.map(row => {
          const baseTicket = {
            companyName: row['Company Name'], // Ensure headers match exactly from Excel
            siteAddress: row['Site Address'],
            workDescription: row['Work Description'],
            amount: parseFloat(row['Amount']),
            expertiseRequired: row['Expertise Required'] ? String(row['Expertise Required']).split(',').map(s => s.trim()).filter(Boolean) : [],
            coordinates: {
              latitude: parseFloat(row['Latitude']),
              longitude: parseFloat(row['Longitude']),
            },
          };
          if (userRole === 'Company Admin' && companyId) {
            baseTicket.companyId = companyId;
          }
          return baseTicket;
        });



        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await axios.post(`${API_URL}/tickets/bulk-create`, { tickets }, config);

        

        toast.success("Bulk Upload Complete", {

          description: response.data.message,

        });

        onComplete(); // Close modal and refresh data



      } catch (err) {

        toast.error("Upload Failed", {

          description: err.response?.data?.message || err.message || "An error occurred during processing.",

        });

      } finally {

        setIsUploading(false);

      }

    };

    reader.readAsArrayBuffer(file); // Read as ArrayBuffer for ExcelJS

  };



  return (

    <Dialog open={isOpen} onOpenChange={onCancel}>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>Bulk Ticket Upload</DialogTitle>

          <DialogDescription>

            Upload an .xlsx file with columns: "Company Name", "Site Address", "Work Description", "Amount", "Expertise Required", "Latitude", "Longitude".

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