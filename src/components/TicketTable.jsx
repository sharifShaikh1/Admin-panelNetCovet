import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Copy, Check, MoreHorizontal, User, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const TicketCard = ({ ticket, onViewDetails, onStatusChange }) => {
    const [copied, setCopied] = useState(false);

    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    const handleCopy = (e, id) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id).then(() => {
            setCopied(true);
            toast.success("Ticket ID copied!");
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // This function can be removed as we will use theme-aware classes directly
    // const getStatusColor = () => { ... };

    const isAssignmentPending = ticket.assignedEngineer?.assignmentStatus === 'pending';
    const hasRequests = ticket.accessRequests?.length > 0;

    const lastInteraction = ticket.interactions[ticket.interactions.length - 1];
    const lastUpdateDate = new Date(lastInteraction?.timestamp || ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        // ✅ CORRECTED: The Card now uses theme-aware colors bg-card and text-card-foreground
<Card className="flex flex-col relative overflow-hidden transition-all hover:shadow-md bg-white text-card-foreground dark:bg-[#243a6e] dark:border dark:border-slate-800">

        {/* ✅ CORRECTED: Status border uses theme colors */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                ${ticket.status === 'Open' ? 'bg-blue-500' : ''} 
                ${ticket.status === 'In Progress' ? 'bg-yellow-500' : ''} 
                ${ticket.status === 'Closed' ? 'bg-gray-500' : ''}`}
            ></div>
            
            <CardHeader className="pl-6 pr-4 pt-4 pb-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => handleCopy(e, ticket.ticketId)}>
                        <p className="font-mono text-sm text-muted-foreground">{ticket.ticketId}</p>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <Badge variant={isAssignmentPending ? "default" : "secondary"}>{isAssignmentPending ? "Pending" : ticket.status}</Badge>
                </div>
                {hasRequests && <Badge variant="destructive" className="mt-2 self-start">{ticket.accessRequests.length} Request(s)</Badge>}
            </CardHeader>
            
            <CardContent className="flex-grow pl-6 pr-4 pb-4">
                <CardTitle className="text-base font-bold text-foreground">{ticket.companyName}</CardTitle>
                <CardDescription className="text-xs mt-1">{ticket.siteAddress}</CardDescription>
                <div className="border-t my-3 border-border"></div>
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                        {ticket.expertiseRequired.map(exp => <Badge key={exp} variant="outline">{exp}</Badge>)}
                    </div>
                    {ticket.assignedEngineer && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                           <User className="h-3 w-3" />
                           <span>Assigned to: {ticket.assignedEngineer.name}</span>
                       </div>
                   )}
                </div>
            </CardContent>
            
            {/* ✅ CORRECTED: The footer now uses theme-aware colors */}
            <CardFooter className="pl-6 pr-4 pb-4 flex justify-between items-center bg-muted/50 border-t">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {lastUpdateDate}</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(ticket)}>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={ticket.status === 'Open'} onClick={(e) => handleActionClick(e, () => onStatusChange(ticket._id, 'Open'))}>Mark as Open</DropdownMenuItem>
                        <DropdownMenuItem disabled={ticket.status === 'In Progress'} onClick={(e) => handleActionClick(e, () => onStatusChange(ticket._id, 'In Progress'))}>Mark as In Progress</DropdownMenuItem>
                        <DropdownMenuItem disabled={ticket.status === 'Closed'} onClick={(e) => handleActionClick(e, () => onStatusChange(ticket._id, 'Closed'))} className="text-destructive focus:text-destructive">Mark as Closed</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
};

const TicketTable = ({ tickets, onViewDetails, onStatusChange }) => {
  if (!tickets || tickets.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No tickets found in this category.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket._id} ticket={ticket} onViewDetails={onViewDetails} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
};

export default TicketTable;
