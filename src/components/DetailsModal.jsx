import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from 'lucide-react';

const DetailsModal = ({ user, open, setOpen }) => {
  if (!user) return null;

  // Helper component for displaying data neatly
  const DetailItem = ({ label, value, isBadge = false }) => (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {isBadge ? value : <p className="text-base text-foreground">{value || 'N/A'}</p>}
    </div>
  );

  // Helper component for creating document links
  const DocumentLink = ({ label, url }) => (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <Link className="h-4 w-4" /> View Document
        </a>
      ) : (
        <p className="text-base text-foreground">N/A</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[625px] bg-card text-card-foreground p-6 rounded-lg shadow-xl">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-3xl font-bold">{user.fullName}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg">{user.email}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-2">
            <DetailItem 
              label="Status" 
              value={<Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>{user.status}</Badge>} 
              isBadge={true} 
            />
            <DetailItem label="Role" value={user.role} />
            <DetailItem label="Employee ID" value={user.employeeId} />
            <DetailItem label="Phone Number" value={user.phoneNumber} />
            <DetailItem label="UPI ID" value={user.upiId} />
            
            <DetailItem label="Service Areas" value={user.serviceAreas?.join(', ')} />
            
            <DocumentLink label="Aadhaar" url={user.documents?.aadhaar} />
            <DocumentLink label="Government ID" url={user.documents?.governmentId} />
            <DocumentLink label="Address Proof" url={user.documents?.addressProof} />
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t border-border">
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
