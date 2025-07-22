import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { apiRequest } from '../../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import ChatList from './ChatList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatEmptyState from './ChatEmptyState';
import SkeletonLoader from './SkeletonLoader';

import { API_BASE_URL } from '../../config';
const API_URL = API_BASE_URL.replace('/api', '');

const ChatLayout = ({ token, userRole, userId, ticket }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial user list
  useEffect(() => {
    if (['Admin', 'NetCovet Manager'].includes(userRole)) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const data = await apiRequest('get', '/admin/chat/users', null, token);
          setAllUsers(data.filter(u => u._id !== userId));
        } catch (error) {
          toast.error("Error", { description: "Could not fetch users for chat." });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    } else {
        setIsLoading(false);
    }
  }, [token, userRole, userId]);

  // Socket connection and event listeners
  useEffect(() => {
    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('receiveMessage', (message) => {
      if (message.conversationId === currentConversationId) {
        setMessages((prev) => {
          const existingIndex = prev.findIndex(m => m.tempId && m.tempId === message.tempId);
          if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = message;
            return updated;
          }
          return [...prev, message];
        });
      }
    });

    newSocket.on('userOnline', ({ userId }) => setOnlineUsers(prev => ({ ...prev, [userId]: true })));
    newSocket.on('userOffline', ({ userId }) => setOnlineUsers(prev => ({ ...prev, [userId]: false })));

    return () => {
      newSocket.disconnect();
    };
  }, [token, currentConversationId]);

  // Handle joining rooms and fetching messages
  useEffect(() => {
    if (!socket || !activeChat) {
        setMessages([]);
        setCurrentConversationId(null);
        return;
    }

    const isDirect = !!activeChat.fullName;
    const event = isDirect ? 'joinDirectChatRoom' : 'joinTicketRoom';
    const id = activeChat._id;
    const payload = isDirect ? { receiverId: id } : { ticketId: id };

    socket.emit(event, id, (response) => {
      if (response.success) {
        socket.emit('fetchMessages', payload, (data) => {
          setMessages(data.messages);
          setCurrentConversationId(data.conversationId);
        });
        if (isDirect) {
          socket.emit('checkUserStatus', id, (isOnline) => {
            setOnlineUsers(prev => ({ ...prev, [id]: isOnline }));
          });
        }
      } else {
        toast.error("Chat Error", { description: response.message });
      }
    });
  }, [socket, activeChat]);

  const sendMessage = useCallback((messageText, file) => {
    if (!socket || !activeChat || (!messageText.trim() && !file)) return;

    const isDirect = !!activeChat.fullName;
    const tempId = `${userId}-${Date.now()}`;
    const messageData = {
      conversationId: currentConversationId,
      ticketId: !isDirect ? activeChat._id : null,
      receiverId: isDirect ? activeChat._id : null,
      text: messageText.trim(),
      originalFileName: file ? file.name : null,
      tempId,
    };

    // Optimistic UI update
    const optimisticMessage = {
      _id: tempId,
      tempId,
      senderId: { _id: userId, fullName: 'You', role: userRole },
      text: messageData.text,
      fileKey: file ? URL.createObjectURL(file) : null,
      fileType: file ? file.type : null,
      originalFileName: messageData.originalFileName,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
      isOptimistic: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    const processAndSend = (fileData = null, fileType = null) => {
      socket.emit('sendMessage', { ...messageData, fileData, fileType }, (res) => {
        if (!res.success) {
          toast.error("Message Failed", { description: res.message || "Could not send." });
          setMessages(prev => prev.filter(m => m._id !== tempId)); // Revert on failure
        }
      });
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => processAndSend(reader.result, file.type);
      reader.readAsArrayBuffer(file);
    } else {
      processAndSend();
    }
  }, [socket, activeChat, userId, userRole, currentConversationId]);

  const isAdmin = ['Admin', 'NetCovet Manager'].includes(userRole);

  return (
    <div className="flex h-full bg-background text-foreground rounded-xl shadow-2xl shadow-slate-300/30 overflow-hidden border border-border">
      {isAdmin && (
        <ChatList
          users={allUsers}
          ticket={ticket}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          isLoading={isLoading}
        />
      )}
      <main className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {activeChat ? (
            <motion.div
              key={activeChat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col h-full min-h-0 overflow-hidden"
            >
              <ChatHeader activeChat={activeChat} onlineUsers={onlineUsers} />
              <MessageList messages={messages} userId={userId} token={token} API_BASE_URL={API_BASE_URL} conversationId={currentConversationId} className="flex-1" />
              <div className="flex-shrink-0 p-4 border-t border-border bg-card rounded-b-xl">
                <ChatInput onSendMessage={sendMessage} />
              </div>
            </motion.div>
          ) : (
            <ChatEmptyState />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ChatLayout;