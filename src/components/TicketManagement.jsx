import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import TicketTable from './TicketTable';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BulkTicketUploadModal from './BulkTicketUploadModal';
import PaymentModal from './PaymentModal';

import { API_BASE_URL } from '../config';
const API_URL = API_BASE_URL;

const TICKET_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ticketCache = {};

const TicketManagement = ({ token, onViewDetails, onCreateTicket, onStatusChange, handleApiError, userRole, companyId, onChat}) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const { status } = useParams();

    const fetchTickets = useCallback(async () => {
        if (!status) return;
        setLoading(true);

        

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let url = `${API_URL}/tickets/${status}`;
            if (userRole === 'Company Admin' && companyId) {
                url += `?companyId=${companyId}`;
            }
            const { data } = await axios.get(url, config);

            
            setTickets(data);
        } catch (err) { handleApiError(err); }
        finally { setLoading(false); }
    }, [token, status, handleApiError, userRole, companyId]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleUploadComplete = () => {
        setShowBulkUpload(false);
        fetchTickets();
    };

    const handlePay = (ticket) => {
        setSelectedTicket(ticket);
        setShowPaymentModal(true);
    };

    const handlePaymentCancel = () => {
        setShowPaymentModal(false);
        setSelectedTicket(null);
        fetchTickets();
    };

    return (
      // ✅ This outer div is now a flex column that fills the page height
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Ticket Management</h2>
            <div className="flex gap-2">
                {(userRole === 'Admin' || userRole === 'Company Admin') && (
                    <Button variant="outline" onClick={() => setShowBulkUpload(true)}>Bulk Upload</Button>
                )}
                {(userRole === 'Admin' || userRole === 'Company Admin') && (
                    <Button onClick={onCreateTicket}>Create Single Ticket</Button>
                )}
            </div>
        </div>
        
        {/* ✅ The Card now expands to fill the remaining space */}
        <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b flex-shrink-0">
                <nav className="flex space-x-4">
                    <NavLink to="/admin/tickets/Open" className={({ isActive }) => `pb-2 px-1 font-medium text-sm ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}>Open</NavLink>
                    <NavLink to="/admin/tickets/In-Progress" className={({ isActive }) => `pb-2 px-1 font-medium text-sm ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}>In progress</NavLink>
                    <NavLink to="/admin/tickets/Closed" className={({ isActive }) => `pb-2 px-1 font-medium text-sm ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}>Closed</NavLink>
                </nav>
            </CardHeader>
            
            {/* ✅ The CardContent now handles the scrolling */}
            <CardContent className="p-4 flex-1 overflow-y-auto scrollbar-hide">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" />
                    </div>
                ) : (
                    <TicketTable tickets={tickets} onViewDetails={onViewDetails} onStatusChange={onStatusChange} onChat={onChat} onPay={handlePay} />
                )}
            </CardContent>
        </Card>

<BulkTicketUploadModal
  isOpen={showBulkUpload}
  token={token}
  onCancel={() => setShowBulkUpload(false)}
  onComplete={handleUploadComplete}
/>

{selectedTicket && (
    <PaymentModal
        isOpen={showPaymentModal}
        onCancel={handlePaymentCancel}
        ticket={selectedTicket}
        token={token}
    />
)}

      </div>
    );
};

export default TicketManagement;