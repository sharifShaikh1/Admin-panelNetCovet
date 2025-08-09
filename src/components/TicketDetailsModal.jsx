import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link, MapPin, DollarSign, Wrench, User, Clock, CreditCard } from 'lucide-react'; // Added CreditCard
import { toast } from 'sonner';

const InteractionItem = ({ item }) => (
  <div className="flex items-start space-x-3 text-sm">
    <p className="text-muted-foreground w-24 flex-shrink-0">{new Date(item.timestamp).toLocaleString('en-IN')}</p>
    <div className="font-medium text-foreground">{item.actor}:</div>
    <div className="text-muted-foreground flex-grow">{item.event}</div>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-lg mb-2 text-foreground">{title}</h4>
    {children}
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-base text-muted-foreground">
    {Icon && <Icon className="h-4 w-4 text-primary" />}
    <span className="font-medium text-foreground">{label}:</span>
    <span>{value || 'N/A'}</span>
  </div>
);

const TicketDetailsModal = ({ ticket, open, setOpen, onAssignFromRequest, onManualAssignRequest, userRole, onChat, onPaymentSuccess }) => {
  const [isPaying, setIsPaying] = useState(false);

  if (!ticket) return null;

  const handlePayout = async () => {
    setIsPaying(true);
    try {
      const response = await api.post('/payment/stripe/payout', { ticketId: ticket._id });
      toast.success('Payout Successful!', {
        description: `Transaction ID: ${response.data.transactionId}`,
      });
      onPaymentSuccess(ticket._id); // Notify parent to refresh data
      setOpen(false);
    } catch (error) {
      toast.error('Payout Failed', {
        description: error.response?.data?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsPaying(false);
    }
  };

  const canPay = ticket.status === 'Closed' && ticket.paymentStatus !== 'Paid';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] bg-card text-card-foreground p-6 rounded-lg shadow-xl">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-3xl font-bold">{ticket.companyName}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" /> {ticket.siteAddress}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4">
          <div className="space-y-6 p-2">
            <DetailSection title="Work Details">
              <p className="text-base text-foreground leading-relaxed">{ticket.workDescription}</p>
            </DetailSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <DetailItem icon={DollarSign} label="Amount" value={`₹${ticket.amount}`} />
              <DetailItem label="Payment Status" value={ticket.paymentStatus} />
              <DetailItem icon={Wrench} label="Expertise" value={ticket.expertiseRequired.join(', ')} />
              {ticket.assignedPersonnel && ticket.assignedPersonnel.length > 0 && (
                <DetailItem 
                  icon={User} 
                  label="Assigned To" 
                  value={`${ticket.assignedPersonnel[0].name} (${ticket.assignedPersonnel[0].assignmentStatus})`} 
                />
              )}
            </div>

            {ticket.holdReason && (
              <DetailSection title="Hold Reason">
                <p className="text-base text-foreground leading-relaxed">{ticket.holdReason}</p>
              </DetailSection>
            )}

            {ticket.closingRemarks && (
              <DetailSection title="Closing Remarks">
                <p className="text-base text-foreground leading-relaxed">{ticket.closingRemarks}</p>
              </DetailSection>
            )}

            {ticket.accessRequests?.length > 0 && (
              <DetailSection title="Access Requests">
                <div className="space-y-3 mt-2">
                  {ticket.accessRequests.map(request => (
                    <div key={request.userId._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md border border-border">
                      <p className="text-sm font-medium text-foreground">{request.userId.fullName} ({request.userId.employeeId})</p>
                      {(userRole === 'Admin' || userRole === 'NetCovet Manager') && (
                        <Button size="sm" onClick={() => onAssignFromRequest(ticket._id, request.userId._id)}>Assign</Button>
                      )}
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}
            
            <DetailSection title="Interaction Log">
              <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-3">
                <div className="space-y-3">
                  {ticket.interactions?.slice().reverse().map((item, index) => <InteractionItem key={index} item={item} />)}
                </div>
              </ScrollArea>
            </DetailSection>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t border-border">
          <div className="flex w-full justify-between items-center">
            <div>
              
            </div>
            <div className="flex gap-3">
              {ticket.status === 'Open' && !ticket.assignedEngineer && ticket.accessRequests?.length === 0 && (userRole === 'Admin' || userRole === 'NetCovet Manager') && (
                <Button onClick={() => { setOpen(false); onManualAssignRequest(); }}>Assign Manually</Button>
              )}
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button onClick={() => { onChat(ticket); setOpen(false); }}>View Chat</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;
