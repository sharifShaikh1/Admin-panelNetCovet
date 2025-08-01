import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, FileText, X, MessageSquareReply } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInput = ({ onSendMessage, replyingToMessage, setReplyingToMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File is too large", { description: "Maximum file size is 5MB." });
        return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(file.name);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    onSendMessage(newMessage, selectedFile, replyingToMessage?._id);
    setNewMessage('');
    clearFile();
    setReplyingToMessage(null); // Clear reply after sending
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-border bg-background">
      <AnimatePresence>
        {replyingToMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 p-2 border border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareReply className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-600">Replying to {replyingToMessage.senderId?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[calc(100%-40px)]">
                    {replyingToMessage.text || (replyingToMessage.fileKey ? (replyingToMessage.fileType?.startsWith('image/') ? 'Image' : 'File') : 'No content')}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setReplyingToMessage(null)} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 p-2 border border-border bg-muted/50 rounded-lg overflow-hidden"
          >
            <div className="flex items-center gap-3">
              {filePreview.startsWith('blob:') ? (
                <img src={filePreview} alt="Preview" className="h-14 w-14 object-cover rounded-md" />
              ) : (
                <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
              )}
              <div className="text-muted-foreground text-sm truncate flex-grow">{selectedFile.name}</div>
              <Button variant="ghost" size="icon" onClick={clearFile} className="shrink-0"><X className="h-5 w-5" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow"
        />
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,image/jpeg,image/png,image/gif"
        />
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()} className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button onClick={handleSend} disabled={!newMessage.trim() && !selectedFile}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;