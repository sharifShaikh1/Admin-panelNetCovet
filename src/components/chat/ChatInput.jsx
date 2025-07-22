import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInput = ({ onSendMessage }) => {
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
    onSendMessage(newMessage, selectedFile);
    setNewMessage('');
    clearFile();
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-border bg-background">
      <AnimatePresence>
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
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,image/jpeg,image/png,image/gif"
        />
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()} className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow"
        />
        <Button onClick={handleSend} disabled={!newMessage.trim() && !selectedFile}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;