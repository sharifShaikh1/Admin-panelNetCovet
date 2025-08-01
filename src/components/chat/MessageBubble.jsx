"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import FileDisplay from "../FileDisplay"
import { useTheme } from "../theme-provider"
import { MessageSquareReply, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const MessageBubble = ({ msg, isSender, token, API_BASE_URL, conversationId, onReply }) => {
  const hasFile = !!msg.fileKey
  const hasText = !!msg.text
  const isOptimistic = !!msg.isOptimistic
  const hasReply = !!msg.replyTo?._id
  const [isHovered, setIsHovered] = useState(false)

  const bubbleAlignment = isSender ? "justify-end" : "justify-start"
  const { theme } = useTheme()

  // Enhanced bubble styling with WhatsApp-like appearance
  const bubbleBaseClasses = "relative px-3 py-2 shadow-md max-w-[320px] transition-all duration-200 ease-out"

  const senderBubbleClasses =
    theme === "dark"
      ? "bg-[#005c4b] text-white rounded-[18px] rounded-br-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
      : "bg-[#dcf8c6] text-gray-900 rounded-[18px] rounded-br-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"

  const receiverBubbleClasses =
    theme === "dark"
      ? "bg-[#202c33] text-white rounded-[18px] rounded-bl-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
      : "bg-white text-gray-900 rounded-[18px] rounded-bl-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"

  const bubbleClasses = isSender
    ? `${bubbleBaseClasses} ${senderBubbleClasses}`
    : `${bubbleBaseClasses} ${receiverBubbleClasses}`

  const senderName = isSender ? "You" : `${msg.senderId?.fullName} (${msg.senderId?.role})`

  const ReplyContent = () => {
    if (!hasReply) return null

    const repliedToSender = msg.replyTo.senderId?.fullName || "User"
    const replyText = msg.replyTo.text
    const replyFile = msg.replyTo.fileKey
    const replyFileType = msg.replyTo.fileType

    let displayContent = ""
    if (replyText) {
      displayContent = replyText
    } else if (replyFile) {
      displayContent = replyFileType?.startsWith("image/") ? "Image" : "File"
    }

    return (
      <div
        className={`
        mb-2 p-2 rounded-lg border-l-4 
        ${
          isSender
            ? "bg-black/10 border-l-white/30"
            : theme === "dark"
              ? "bg-white/5 border-l-[#00a884]"
              : "bg-gray-100/80 border-l-[#00a884]"
        }
      `}
      >
        <div className="flex items-start gap-2">
          <MessageSquareReply className="w-3 h-3 text-[#00a884] flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[#00a884] mb-0.5 leading-tight">{repliedToSender}</p>
            <p className="text-[12px] opacity-75 truncate leading-tight">{displayContent || "No content"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isOptimistic ? 0.6 : 1,
        y: 0,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        opacity: { duration: 0.2 },
      }}
      className={`flex items-end gap-1 ${bubbleAlignment} group mb-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
        {/* Sender name for group chats */}
        {!isSender && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-4 mb-1 font-medium">{senderName}</span>
        )}

        <div className={`${bubbleClasses} ${isHovered ? "shadow-lg" : ""}`}>
          {/* Three dots menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`
                  absolute top-1 ${isSender ? "right-1" : "left-1"} 
                  w-6 h-6 rounded-full flex items-center justify-center
                  transition-all duration-200 ease-out
                  ${
                    isHovered
                      ? "opacity-100 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                      : "opacity-0 pointer-events-none"
                  }
                `}
              >
                <MoreVertical className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isSender ? "end" : "start"}
              className="min-w-[120px] shadow-lg border-0 bg-white dark:bg-gray-800"
            >
              <DropdownMenuItem
                onClick={() => onReply(msg)}
                className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <MessageSquareReply className="w-4 h-4 mr-2" />
                Reply
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reply content */}
          <ReplyContent />

          {/* File content */}
          {hasFile && (
            <div className={`${hasText ? "mb-2" : ""} rounded-lg overflow-hidden`}>
              <FileDisplay msg={msg} token={token} API_BASE_URL={API_BASE_URL} conversationId={conversationId} />
            </div>
          )}

          {/* Text content */}
          {hasText && (
            <div className="break-words">
              <p className="text-[14px] leading-[1.4] whitespace-pre-wrap">{msg.text}</p>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-end justify-end mt-1 -mb-1">
            <span
              className={`
              text-[11px] leading-none select-none
              ${
                isSender
                  ? theme === "dark"
                    ? "text-gray-300/70"
                    : "text-gray-600/70"
                  : theme === "dark"
                    ? "text-gray-400/70"
                    : "text-gray-500/70"
              }
            `}
            >
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* Message status indicators for sender (you can add read receipts here) */}
            {isSender && (
              <div className="ml-1 flex items-center">
                {/* You can add checkmarks or other status indicators here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
