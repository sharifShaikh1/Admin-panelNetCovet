import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

const ChatHeader = ({ activeChat, onlineUsers }) => {
  const getChatTitle = () => {
    if (!activeChat) return "Select a chat";

    if (activeChat.fullName) {
      const isOnline = onlineUsers[activeChat._id];
      return (
        <div className="flex items-center">
          <motion.span
            animate={{ scale: isOnline ? [1, 1.2, 1] : 1, transition: isOnline ? { repeat: Infinity, duration: 1.5 } : {} }}
            className={`h-3 w-3 rounded-full mr-3 shrink-0 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span className="truncate">{activeChat.fullName}</span>
        </div>
      );
    }
    return `Ticket #${activeChat.ticketId}`;
  };

  return (
    <CardHeader className="flex-shrink-0 p-4 border-b border-border z-10 bg-background/80 backdrop-blur-sm">
      <div className="text-lg font-semibold tracking-tight">{getChatTitle()}</div>
    </CardHeader>
  );
};

export default ChatHeader;