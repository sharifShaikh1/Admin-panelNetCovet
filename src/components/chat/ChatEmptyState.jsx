import React from 'react';
import { MessageSquareDashed } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatEmptyState = () => {
  return (
    <motion.div
        key="empty"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/20"
      >
        <MessageSquareDashed className="h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold">Select a Conversation</h3>
        <p className="text-sm">Choose a ticket or a user from the list to start chatting.</p>
    </motion.div>
  );
};

export default ChatEmptyState;