import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket as TicketIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import { Button } from "../ui/button";

const ChatListItem = ({ item, isActive, onClick, icon: Icon, title, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} 
    className={`flex items-center gap-2 sm:gap-4 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
    onClick={() => onClick(item)}
  >
    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
    <div className="overflow-hidden">
      <p className={`font-semibold text-sm sm:text-base truncate ${isActive ? 'text-primary-foreground' : ''}`}>{title}</p>
      <p className={`text-xs sm:text-sm truncate ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{subtitle}</p>
    </div>
  </motion.div>
);

const ChatList = ({ users, tickets, activeChat, setActiveChat, isLoading }) => {
  const [view, setView] = useState('conversations');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <Card className="w-2/5 sm:w-1/3 md:w-1/4 lg:w-1/5 max-w-sm flex flex-col border-r border-border rounded-none bg-muted/10">
     <div className="flex p-1 border-b border-border">
        <Button
          variant={view === 'conversations' ? 'secondary' : 'ghost'}
          className="flex-1 text-xs h-8"
          onClick={() => setView('conversations')}
        >
          <MessageSquare className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Conversations</span>
        </Button>
        <Button
          variant={view === 'tickets' ? 'secondary' : 'ghost'}
          className="flex-1 text-xs h-8"
          onClick={() => setView('tickets')}
        >
          <TicketIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Tickets</span>
        </Button>
      </div>
      <ScrollArea className="flex-grow p-2">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {view === 'tickets' ? (
              tickets.map((ticket) => (
                <motion.div variants={itemVariants} key={ticket._id}>
                  <ChatListItem
                    item={ticket}
                    isActive={activeChat?._id === ticket._id}
                    onClick={setActiveChat}
                    icon={TicketIcon}
                    title={`Ticket #${ticket.ticketId}`}
                    subtitle={ticket.workDescription}
                  />
                </motion.div>
              ))
            ) : (
              users.map((user) => (
                <motion.div variants={itemVariants} key={user._id}>
                  <ChatListItem
                    item={user}
                    isActive={activeChat?._id === user._id}
                    onClick={setActiveChat}
                    icon={MessageSquare}
                    title={user.fullName}
                    subtitle={user.role}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ChatList;
