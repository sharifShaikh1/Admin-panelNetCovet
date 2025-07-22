import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket as TicketIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';

const ChatListItem = ({ item, isActive, onClick, icon: Icon, title, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} 
    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
    onClick={() => onClick(item)}
  >
    <Icon className={`h-8 w-8 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
    <div className="overflow-hidden">
      <p className={`font-semibold text-base truncate ${isActive ? 'text-primary-foreground' : ''}`}>{title}</p>
      <p className={`text-sm truncate ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{subtitle}</p>
    </div>
  </motion.div>
);

const ChatList = ({ users, ticket, activeChat, setActiveChat, isLoading }) => {
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
    <Card className="w-1/5 max-w-sm flex flex-col border-r border-border rounded-none bg-muted/10">
     <div className="flex flex-col p-1.5 border-b border-border justify-center items-center align-items-center">
        <div className="text-lg font-semibold tracking-tight flex items-center">Conversations</div>
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
            {ticket && (
              <motion.div variants={itemVariants}>
                <ChatListItem
                  item={ticket}
                  isActive={activeChat?._id === ticket._id}
                  onClick={setActiveChat}
                  icon={TicketIcon}
                  title={`Ticket #${ticket.ticketId}`}
                  subtitle={ticket.workDescription}
                />
              </motion.div>
            )}
            {users.map((user) => (
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
            ))}
          </motion.div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ChatList;