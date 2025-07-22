import React from 'react';
import { motion } from 'framer-motion';
import FileDisplay from '../FileDisplay'; // Assuming this component exists and works as intended

const MessageBubble = ({ msg, isSender, token, API_BASE_URL, conversationId }) => {
  const hasFile = !!msg.fileKey;
  const hasText = !!msg.text;
  const isOptimistic = !!msg.isOptimistic;

  const bubbleAlignment = isSender ? "justify-end" : "justify-start";
  const bubbleClasses = isSender
    ? "bg-primary text-primary-foreground rounded-br-none"
    : "bg-card text-card-foreground rounded-bl-none";
  const senderName = isSender ? "You" : `${msg.senderId?.fullName} (${msg.senderId?.role})`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-end gap-2 ${bubbleAlignment}`}
    >
      <div className="flex flex-col max-w-[75%]">
        {!isSender && <span className="text-xs text-muted-foreground ml-2 mb-1">{senderName}</span>}
        <div className={`rounded-xl shadow-md ${hasFile && !hasText ? 'bg-transparent' : bubbleClasses}`}>
          <div className={hasFile && !hasText ? "" : "p-3"}>
            {hasFile && (
              <div className={hasText ? "mb-2" : ""}>
                <FileDisplay msg={msg} token={token} API_BASE_URL={API_BASE_URL} conversationId={conversationId} />
              </div>
            )}
            {hasText && <p className="text-sm break-words">{msg.text}</p>}
          </div>
        </div>
        <p className="text-xs text-right mt-1 opacity-60">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;