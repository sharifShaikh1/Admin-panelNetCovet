import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { apiRequest } from '../../lib/utils';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Paperclip, Send, FileText, X, MessageSquare, Ticket as TicketIcon, Download } from 'lucide-react';
import FileDisplay from '../FileDisplay';

import { API_BASE_URL } from '../../config';
const API_URL = API_BASE_URL.replace('/api', '');

const ChatWindow = ({ token, userRole, userId, ticket }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isChatDisabled, setIsChatDisabled] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [currentConversationId, setCurrentConversationId] = useState(null);


  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

  useEffect(() => {
    if (['Admin', 'NetCovet Manager'].includes(userRole)) {
      const fetchUsers = async () => {
        try {
          const data = await apiRequest('get', '/admin/chat/users', null, token);
          setAllUsers(data.filter(u => u._id !== userId));
        } catch (error) {
          toast.error("Error", { description: "Could not fetch users for chat." });
        }
      };
      fetchUsers();
    }
  }, [token, userRole, userId]);

  useEffect(() => {
    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect_error', (err) => toast.error("Chat Error", { description: err.message }));
    newSocket.on('disconnect', () => console.log('Disconnected from chat server'));

    newSocket.on('receiveMessage', (message) => {
      // Ensure the message belongs to the active chat before adding it
      if (message.conversationId === currentConversationId) {
        setMessages((prev) => {
          // Replace temp message with final one from server
          const existingIndex = prev.findIndex(m => m.tempId === message.tempId);
          if (existingIndex > -1) {
            const updatedMessages = [...prev];
            updatedMessages[existingIndex] = message;
            return updatedMessages;
          }
          // Add new message if not a replacement
          return [...prev, message];
        });
      }
    });

    newSocket.on('userOnline', ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    });

    newSocket.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    });

    return () => {
      newSocket.off('receiveMessage');
      newSocket.off('userOnline');
      newSocket.off('userOffline');
      newSocket.disconnect();
    };
  }, [token, userId, currentConversationId]);


  useEffect(() => {
    if (!socket || !activeChat) {
        setIsChatDisabled(true);
        setMessages([]);
        setCurrentConversationId(null);
        return;
    }

    const isDirect = !!activeChat.fullName;
    const joinEvent = isDirect ? 'joinDirectChatRoom' : 'joinTicketRoom';
    const idToJoin = activeChat._id;
    const fetchPayload = isDirect ? { receiverId: idToJoin } : { ticketId: idToJoin };

    socket.emit(joinEvent, idToJoin, (response) => {
        if (response.success) {
            socket.emit('fetchMessages', fetchPayload, (data) => {
                setMessages(data.messages);
                setCurrentConversationId(data.conversationId); // Store conversation ID
            });
            setIsChatDisabled(false);
            if (isDirect) {
                socket.emit('checkUserStatus', idToJoin, (isOnline) => {
                    setOnlineUsers(prev => ({ ...prev, [idToJoin]: isOnline }));
                });
            }
        } else {
            toast.error("Chat Error", { description: response.message });
            setIsChatDisabled(true);
        }
    });
}, [socket, activeChat]);


  useEffect(scrollToBottom, [messages]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", { description: "Only JPEG, PNG, GIF, and PDF are allowed." });
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(file.name);
    }
  };

  const sendMessage = useCallback(() => {
    if (!socket || isChatDisabled || (!newMessage.trim() && !selectedFile)) return;
  
    const isDirect = !!activeChat?.fullName;
    const tempId = `${userId}-${Date.now()}`; // Unique temporary ID
  
    const messageData = {
      conversationId: currentConversationId,
      ticketId: !isDirect ? activeChat?._id : null,
      receiverId: isDirect ? activeChat?._id : null,
      text: newMessage.trim(),
      originalFileName: selectedFile ? selectedFile.name : null,
      tempId: tempId,
    };
  
    // Optimistically update UI
    const optimisticMessage = {
      _id: tempId, // Use tempId as key
      tempId: tempId,
      senderId: { _id: userId, fullName: 'You', role: userRole },
      text: messageData.text,
      fileKey: selectedFile ? URL.createObjectURL(selectedFile) : null,
      fileType: selectedFile ? selectedFile.type : null,
      originalFileName: messageData.originalFileName,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
      isOptimistic: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  
    const processAndSend = (fileData = null, fileType = null) => {
      socket.emit('sendMessage', { ...messageData, fileData, fileType }, (response) => {
        if (!response.success) {
          toast.error("Message Failed", { description: response.message || "Could not send message." });
          // Revert optimistic update on failure
          setMessages(prev => prev.filter(m => m._id !== tempId));
        }
      });
    };
  
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        processAndSend(arrayBuffer, selectedFile.type);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      processAndSend();
    }
  }, [socket, newMessage, selectedFile, activeChat, isChatDisabled, userId, userRole, currentConversationId]);
  

  const getChatTitle = () => {
    if (!activeChat) return "Select a chat";
    if (activeChat.fullName) {
      const isOnline = onlineUsers[activeChat._id];
      return (
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          <span>{activeChat.fullName}</span>
        </div>
      );
    }
    return `Ticket #${activeChat.ticketId}`;
  };

  return (
    <div className="flex h-full bg-background text-foreground rounded-lg shadow-lg overflow-hidden">
      {['Admin', 'NetCovet Manager'].includes(userRole) && (
        <Card className="w-1/3 max-w-sm flex flex-col border-r border-border rounded-none">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="text-xl font-semibold">Chats</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-grow p-2">
            {ticket && (
              <div
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeChat?._id === ticket._id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/60'}`}
                onClick={() => setActiveChat(ticket)}
              >
                <TicketIcon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-base">Ticket #{ticket.ticketId}</p>
                  <p className="text-sm text-muted-foreground truncate">{ticket.workDescription}</p>
                </div>
              </div>
            )}
            {allUsers.map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeChat?._id === user._id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/60'}`}
                onClick={() => setActiveChat(user)}
              >
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-base">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </Card>
      )}

      <Card className="flex-1 flex flex-col rounded-none">
        <CardHeader className="flex-shrink-0 p-4 border-b border-border">
          <CardTitle className="text-xl font-semibold">{getChatTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-4 overflow-hidden bg-muted/20">
          <ScrollArea className="flex-1 pr-4 overflow-y-auto">
            <div className="space-y-4 py-4">
              {messages.map((msg) => {
                const isOnlyImage = msg.fileKey && msg.fileType?.startsWith('image/') && !msg.text;
                return (
                  <div key={msg._id} className={`flex ${msg.senderId?._id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[70%]">
                      {msg.senderId?._id !== userId && <span className="text-xs text-muted-foreground ml-2 mb-1">{msg.senderId?.fullName} ({msg.senderId?.role})</span>}
                      <div className={`rounded-xl shadow-md ${isOnlyImage ? '' : `p-3 ${msg.senderId?._id === userId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none'}`}`}>
                        {msg.fileKey && (
                          <FileDisplay msg={msg} token={token} API_BASE_URL={API_BASE_URL} conversationId={currentConversationId} />
                        )}
                        {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                        {!isOnlyImage && (
                           <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                       {isOnlyImage && (
                           <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                    </div>
                  </div>
                );
              })}
               <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          {filePreview && (
            <div className="flex items-center p-2 border-t border-border bg-card rounded-lg shadow-inner mt-2">
              {filePreview.startsWith('data:image') ? <img src={filePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md mr-2" /> : <FileText className="h-10 w-10 text-muted-foreground mr-2" />}
              <span className="text-muted-foreground text-sm truncate">{selectedFile?.name}</span>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedFile(null); setFilePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="ml-auto"><X className="h-5 w-5"/></Button>
            </div>
          )}
          <div className="flex flex-shrink-0 items-center p-2 border-t border-border bg-card rounded-lg shadow-inner mt-2">
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()} disabled={isChatDisabled} className="mr-2"><Paperclip className="h-5 w-5" /></Button>
            <Input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,image/jpeg,image/png,image/gif" />
            <Input
              type="text"
              placeholder={isChatDisabled ? "Select a chat to begin." : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isChatDisabled && sendMessage()}
              className="flex-grow mr-2"
              disabled={isChatDisabled}
            />
            <Button onClick={sendMessage} disabled={isChatDisabled || (!newMessage.trim() && !selectedFile)}><Send className="h-5 w-5" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWindow;