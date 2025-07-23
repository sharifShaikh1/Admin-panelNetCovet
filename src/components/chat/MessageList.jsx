import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from './MessageBubble';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme-provider';

const MessageList = ({ messages, userId, token, API_BASE_URL, conversationId }) => {
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    // A more robust way to scroll to bottom
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 100); // Delay to allow for render
    }
  }, [messages]);

  const { theme } = useTheme();
  const backgroundStyle = theme === 'dark' ? { backgroundImage: `url('/src/assets/ChatBackground.jpg')` } : {};

  return (
    <ScrollArea className="flex-1 p-4 overflow-y-auto bg-cover bg-center" style={backgroundStyle} ref={scrollAreaRef}>
      <div className="space-y-6 py-4 pr-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.tempId || msg._id}
              msg={msg}
              isSender={msg.senderId?._id === userId}
              token={token}
              API_BASE_URL={API_BASE_URL}
              conversationId={conversationId}
            />
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};

export default React.memo(MessageList);