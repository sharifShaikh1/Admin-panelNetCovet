import React, { useState, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import UserManagement from './components/UserManagement';
import TicketManagement from './components/TicketManagement';
import DetailsModal from './components/DetailsModal';
import ConfirmModal from './components/ConfirmModal';
import TicketCreationForm from './components/TicketCreationForm';
import TicketDetailsModal from './components/TicketDetailsModal';
import AssignEngineerModal from './components/AssignEngineerModal';
import { LogOut, Users, Ticket as TicketIcon, MessageSquare, Menu } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import { ModeToggle } from './components/mode-toggle';
import { Button } from "@/components/ui/button";
import UserCreationForm from './components/UserCreationForm';

const API_URL = 'http://localhost:8021/api';

const AdminDashboard = ({ token, onLogout, userRole, companyId }) => {
  const isAdmin = userRole === 'Admin';
  const isCompanyAdmin = userRole === 'Company Admin';
  const isNetCovetManager = userRole === 'NetCovet Manager';
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketIdToAssign, setTicketIdToAssign] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false });
  const [showUserCreationForm, setShowUserCreationForm] = useState(false); // New state for user creation form
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for sidebar collapse
  const navigate = useNavigate();
  const location = useLocation();

  const getConfig = useCallback(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const handleApiError = useCallback((err) => {
    toast.error("An Error Occurred", { description: err.response?.data?.message || 'Please try again later.' });
    if (err.response?.status === 401 || err.response?.status === 403) onLogout();
  }, [onLogout]);

  const handleApprovalAction = async (userId, action) => {
    setConfirmState({ isOpen: false });
    try {
      const { data } = await axios.put(`${API_URL}/admin/engineers/${userId}/${action}`, {}, getConfig());
      toast.success(data.message);
      navigate(0);
    } catch (err) { handleApiError(err); }
  };

  const promptForAction = (userId, action) => {
    setConfirmState({ isOpen: true, title: `Confirm ${action}`, message: `Are you sure you want to ${action} this application?`, onConfirm: () => handleApprovalAction(userId, action) });
  };

  const handleCreateTicket = async (ticketData) => {
    try {
      const { data } = await axios.post(`${API_URL}/admin/tickets`, ticketData, getConfig());
      toast.success(data.message);
      setShowCreateTicket(false);
      navigate('/admin/tickets/Open', { replace: true });
    } catch (err) { handleApiError(err); }
  };

  const handleAssignEngineer = async (ticketId, engineerId) => {
    try {
      const { data } = await axios.put(`${API_URL}/admin/tickets/${ticketId}/assign`, { engineerId }, getConfig());
      toast.success(data.message);
      setViewingTicket(null);
      setTicketIdToAssign(null);
      navigate(0);
    } catch (err) { handleApiError(err); }
  };
  
  const handleStatusChange = (ticketId, status) => {
    setConfirmState({
      isOpen: true,
      title: `Confirm Status Change`,
      message: `Are you sure you want to mark this ticket as '${status}'?`,
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        try {
          const { data } = await axios.put(`${API_URL}/tickets/${ticketId}/status`, { status }, getConfig());
          toast.success(data.message);
          setViewingTicket(null);
          navigate(0);
        } catch (err) {
          handleApiError(err);
        }
      },
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <nav className={`bg-card text-foreground flex flex-col flex-shrink-0 border-r ${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            {!isSidebarCollapsed && <h1 className="text-2xl font-bold">FieldSync</h1>}
            <ModeToggle />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ul className="flex-grow px-4 py-4">
          {(isAdmin || isNetCovetManager) && (
            <li className="mb-2">
              <NavLink to="/admin/engineers/pending" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${location.pathname.startsWith('/admin/engineers') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
                  <Users className="h-5 w-5" /> {!isSidebarCollapsed && "User Management"}
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li className="mb-2">
              <NavLink to="/admin/create-user" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${location.pathname.startsWith('/admin/create-user') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
                  <Users className="h-5 w-5" /> {!isSidebarCollapsed && "Create User"}
              </NavLink>
            </li>
          )}
          {(isAdmin || isCompanyAdmin || isNetCovetManager) && (
            <li>
              <NavLink to="/admin/tickets/Open" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${location.pathname.startsWith('/admin/tickets') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
                  <TicketIcon className="h-5 w-5" /> {!isSidebarCollapsed && "Ticket Management"}
              </NavLink>
            </li>
          )}
          <li className="mb-2">
            <NavLink to="/admin/chat" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${location.pathname.startsWith('/admin/chat') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
                <MessageSquare className="h-5 w-5" /> {!isSidebarCollapsed && "Chat"}
            </NavLink>
          </li>
        </ul>
        <div className="p-4 border-t">
            <Button variant="destructive" className="w-full justify-start gap-3" onClick={onLogout}>
                <LogOut className="h-5 w-5"/> {!isSidebarCollapsed && "Logout"}
            </Button>
        </div>
      </nav>
      
      <main className="flex-1 flex flex-col p-8 overflow-y-hidden">
        <Routes>
          {isAdmin && (
            <Route path="engineers/:status" element={<UserManagement token={token} onAction={promptForAction} onViewDetails={setViewingUser} handleApiError={handleApiError} />} />
          )}
          {(isAdmin || isCompanyAdmin || isNetCovetManager) && (
            <Route path="tickets/:status" element={<TicketManagement token={token} onViewDetails={setViewingTicket} onCreateTicket={() => setShowCreateTicket(true)} onStatusChange={handleStatusChange} handleApiError={handleApiError} userRole={userRole} companyId={companyId} />} />
          )}
          <Route path="*" element={<Navigate to={isAdmin ? "/admin/engineers/pending" : "/admin/tickets/Open"} replace />} />
          <Route path="chat" element={<ChatWindow token={token} userRole={userRole} userId={localStorage.getItem('user-id')} userName={localStorage.getItem('user-full-name')} ticket={viewingTicket} />} />
          {isAdmin && (
            <Route path="create-user" element={<UserCreationForm token={token} isOpen={true} onCancel={() => navigate(-1)} onUserCreated={() => navigate('/admin/engineers/pending')} />} />
          )}
        </Routes>
      </main>
      
      {viewingUser && <DetailsModal user={viewingUser} open={!!viewingUser} setOpen={() => setViewingUser(null)} />}
      {viewingTicket && <TicketDetailsModal ticket={viewingTicket} open={!!viewingTicket} setOpen={() => setViewingTicket(null)} onDirectAssign={handleAssignEngineer} onManualAssignRequest={() => setTicketIdToAssign(viewingTicket._id)} userRole={userRole} token={token} />}
      {showCreateTicket && <TicketCreationForm onSubmit={handleCreateTicket} onCancel={() => setShowCreateTicket(false)} userRole={userRole} companyId={companyId} />}
      {ticketIdToAssign && <AssignEngineerModal ticketId={ticketIdToAssign} onAssign={handleAssignEngineer} onCancel={() => setTicketIdToAssign(null)} />}
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState({ isOpen: false })} />
    </div>
  );
};

export default AdminDashboard;
