import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Paperclip, Send, FileText, Image } from 'lucide-react'; // Added FileText and Image icons

const API_URL = 'http://localhost:8021'; // Your backend URL

const ChatWindow = ({ token, userRole, userId, userName, ticket }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatDisabled, setIsChatDisabled] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getConfig = useCallback(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    const newSocket = io(API_URL, {
      auth: { token },
      query: { userId },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('joinRoom', userId);
    });

    newSocket.on('receiveMessage', (message) => {
      console.log('Received message:', message);
      if (
        (selectedUser && 
         ((message.senderId === selectedUser._id && message.receiverId === userId) || 
          (message.senderId === userId && message.receiverId === selectedUser._id)))
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      } else if (!selectedUser && message.senderId === userId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Chat connection error:', err.message);
      toast.error("Chat Error", { description: "Could not connect to chat server." });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, userId, selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/admin/chat/users`, getConfig());
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error("Error", { description: "Could not fetch users for chat." });
      }
    };

    if (userRole !== 'Engineer') {
      fetchUsers();
    }
  }, [getConfig, userRole]);

  useEffect(() => {
    if (userRole === 'Engineer') {
        const isAssignedAndActive = ticket && ticket.assignedEngineer && ticket.assignedEngineer.engineerId === userId && ticket.status !== 'Closed';
        setIsChatDisabled(!isAssignedAndActive);
        if(isAssignedAndActive){
            axios.get(`${API_URL}/api/admin/chat/users`, getConfig()).then(res => setUsers(res.data));
        }
    } else {
      setIsChatDisabled(!selectedUser);
    }
  }, [userRole, ticket, userId, selectedUser, getConfig]);

  useEffect(() => {
    const fetchMessages = () => {
      if (socket && selectedUser) {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const payload = { 
            senderId: userId, 
            receiverId: selectedUser._id,
            ticketId: ticket?._id,
            limitDate: userRole === 'Engineer' ? fifteenDaysAgo : null
        };
        socket.emit('fetchMessages', payload, (history) => {
          setMessages(history);
        });
      }
    };
    fetchMessages();
  }, [socket, selectedUser, userId, ticket, userRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", { description: "Only JPEG, PNG, GIF, and PDF files are allowed." });
        setSelectedFile(null);
        setFilePreview(null);
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); // No preview for PDF
      }
    }
  };

  const sendMessage = useCallback(async () => {
    if (socket && selectedUser && !isChatDisabled && (newMessage.trim() || selectedFile)) {
      let fileData = null;
      let fileType = null;

      if (selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = () => {
          fileData = reader.result.split(',')[1]; // Get base64 data
          fileType = selectedFile.type;

          const messageData = {
            senderId: userId,
            senderName: userName,
            senderRole: userRole,
            receiverId: selectedUser._id,
            receiverName: selectedUser.fullName,
            receiverRole: selectedUser.role,
            text: newMessage.trim(),
            ticketId: ticket?._id,
            fileData,
            fileType,
          };
          socket.emit('sendMessage', messageData);
          setNewMessage('');
          setSelectedFile(null);
          setFilePreview(null);
        };
      } else {
        const messageData = {
          senderId: userId,
          senderName: userName,
          senderRole: userRole,
          receiverId: selectedUser._id,
          receiverName: selectedUser.fullName,
          receiverRole: selectedUser.role,
          text: newMessage.trim(),
          ticketId: ticket?._id,
        };
        socket.emit('sendMessage', messageData);
        setNewMessage('');
      }
    }
  }, [socket, newMessage, userId, userName, userRole, selectedUser, ticket, isChatDisabled, selectedFile]);

  return (
    <div className="flex h-full bg-background text-foreground rounded-lg shadow-lg overflow-hidden">
      {/* Contacts Sidebar */}
      <Card className="w-1/4 flex flex-col border-r border-border rounded-none">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-xl font-semibold">Contacts</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-2">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200
                  ${selectedUser?._id === user._id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent/60'}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-base">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground p-4">No contacts available.</p>
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col rounded-none">
        <CardHeader className="flex-shrink-0 p-4 border-b border-border">
          <CardTitle className="text-xl font-semibold">
            {selectedUser ? `Chat with ${selectedUser.fullName}` : 'Select a user to chat'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-4 overflow-hidden bg-muted/20">
          <ScrollArea className="flex-1 pr-4 overflow-y-auto">
            <div className="space-y-4 py-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[60%] p-2 rounded-xl shadow-md relative
                      ${msg.senderId === userId
                        ? 'bg-blue-700 text-white rounded-br-none'
                        : 'bg-card text-card-foreground rounded-bl-none'
                      }`}
                  >
                    {msg.fileUrl && (
                      msg.fileType.startsWith('image') ? (
                        <img src={msg.fileUrl} alt="Attachment" className="max-w-full h-auto rounded-md mb-1" />
                      ) : (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline mb-1 block flex items-center">
                          <FileText className="h-4 w-4 mr-1" /> {msg.fileType.split('/')[1].toUpperCase()} File
                        </a>
                      )
                    )}
                    {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                    <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          {filePreview && (
            <div className="flex items-center p-2 border-t border-border bg-card rounded-lg shadow-inner mt-2">
              {filePreview.startsWith('data:image') ? (
                <img src={filePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md mr-2" />
              ) : (
                <span className="text-muted-foreground mr-2">PDF Preview Not Available</span>
              )}
              <span className="text-muted-foreground text-sm">{selectedFile?.name}</span>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="ml-auto">X</Button>
            </div>
          )}
          <div className="flex flex-shrink-0 p-2 border-t border-border bg-card rounded-lg shadow-inner">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,image/jpeg,image/png,image/gif"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current.click()}
              disabled={isChatDisabled}
              className="mr-2"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              placeholder={isChatDisabled ? "You cannot send messages at this time." : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && (newMessage.trim() || selectedFile) && !isChatDisabled) {
                  sendMessage();
                }
              }}
              className="flex-grow mr-2 p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              disabled={isChatDisabled}
            />
            <Button onClick={sendMessage} disabled={isChatDisabled || (!newMessage.trim() && !selectedFile)} className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWindow;