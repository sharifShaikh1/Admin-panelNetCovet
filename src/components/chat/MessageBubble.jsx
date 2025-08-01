import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileDisplay from '../FileDisplay';
import { useTheme } from '../theme-provider';
import { MessageSquareReply, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MessageBubble = ({ msg, isSender, token, API_BASE_URL, conversationId, onReply }) => {
  const hasFile = !!msg.fileKey;
  const hasText = !!msg.text;
  const isOptimistic = !!msg.isOptimistic;
  const hasReply = !!msg.replyTo?._id;

  const [isHovered, setIsHovered] = useState(false);

  const bubbleAlignment = isSender ? "justify-end" : "justify-start";
  const { theme } = useTheme();

  const bubbleBaseClasses = "p-2.5 shadow-sm flex flex-col";
  const senderBubbleClasses = theme === 'dark' 
    ? "bg-blue-700 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm" 
    : "bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm";
  const receiverBubbleClasses = theme === 'dark' 
    ? "bg-gray-700 text-white rounded-tl-lg rounded-tr-lg rounded-bl-sm rounded-br-lg" 
    : "bg-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-bl-sm rounded-br-lg";

  const bubbleClasses = isSender 
    ? `${bubbleBaseClasses} ${senderBubbleClasses}` 
    : `${bubbleBaseClasses} ${receiverBubbleClasses}`;

  const senderName = isSender ? "You" : `${msg.senderId?.fullName} (${msg.senderId?.role})`;

  const ReplyContent = () => {
    if (!hasReply) return null;
    const repliedToSender = msg.replyTo.senderId?.fullName || 'User';
    const replyText = msg.replyTo.text;
    const replyFile = msg.replyTo.fileKey;
    const replyFileType = msg.replyTo.fileType;

    let displayContent = '';
    if (replyText) {
      displayContent = replyText;
    } else if (replyFile) {
      displayContent = replyFileType?.startsWith('image/') ? 'Image' : 'File';
    }

    return (
      <div className="p-1.5 mb-1.5 text-xs rounded-md bg-black/5 dark:bg-white/5 border-l-2 border-blue-400 flex items-center space-x-1.5">
        <MessageSquareReply className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-400 text-xs leading-tight">{repliedToSender}</p>
          <p className="text-[0.65rem] opacity-80 truncate max-w-[120px] leading-tight">{displayContent || 'No content'}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-end gap-2 ${bubbleAlignment} relative`} // Added relative positioning
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col max-w-[75%]`}>
        {!isSender && <span className="text-xs text-muted-foreground ml-2 mb-1">{senderName}</span>}
        <div className={`${bubbleClasses} relative`}> {/* This div is now the relative parent for the icon */}
          <ReplyContent />
          {hasFile && (
            <div className={hasText ? "mb-2" : ""}>
              <FileDisplay msg={msg} token={token} API_BASE_URL={API_BASE_URL} conversationId={conversationId} />
            </div>
          )}
          {hasText && <p className="text-sm break-words">{msg.text}</p>}
          <p className="text-xs text-right mt-1 opacity-60 self-end">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {/* Dropdown Menu always rendered, visibility controlled by opacity */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`absolute top-1.5 ${isSender ? 'right-1.5' : 'left-1.5'} transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onReply(msg)}>Reply</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;