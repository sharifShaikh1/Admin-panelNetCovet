
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Copy, Check, MoreHorizontal, User, Calendar, Clock, Building, MapPin } from "lucide-react";
import { toast } from "sonner";

const PolishedTicketCard = ({ ticket, onViewDetails, onStatusChange }) => {
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

    const isAssignmentPending = ticket.assignedEngineer?.assignmentStatus === 'pending';
    const hasRequests = ticket.accessRequests?.length > 0;
    const lastInteraction = ticket.interactions[ticket.interactions.length - 1];
    const lastUpdateDate = new Date(lastInteraction?.timestamp || ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const statusColors = {
        Open: "bg-blue-500",
        "In Progress": "bg-yellow-500",
        Closed: "bg-gray-500",
    };

    return (
        <div className="bg-white dark:bg-slate-900/70 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
            <div className={`h-2 ${statusColors[ticket.status] || 'bg-gray-400'}`}></div>
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => handleCopy(e, ticket.ticketId)}>
                            <p className="font-mono text-xs text-muted-foreground">{ticket.ticketId}</p>
                            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {ticket.companyName}
                        </h3>
                    </div>
                    <Badge variant={isAssignmentPending ? "default" : "secondary"} className="text-xs">{isAssignmentPending ? "Pending" : ticket.status}</Badge>
                </div>

                <div className="mt-3">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="line-clamp-2">{ticket.siteAddress}</p>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-1">
                        {ticket.expertiseRequired.slice(0, 3).map(exp => <Badge key={exp} variant="outline" className="text-xs">{exp}</Badge>)}
                        {ticket.expertiseRequired.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
                    </div>
                </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{lastUpdateDate}</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()}>
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
            </div>
        </div>
    );
};

export default PolishedTicketCard;
