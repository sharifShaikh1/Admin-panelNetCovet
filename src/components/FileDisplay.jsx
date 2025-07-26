import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Paperclip, FileText, Download } from 'lucide-react';

const FileDisplay = ({ msg, token, API_BASE_URL, conversationId }) => {
  const [objectURL, setObjectURL] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let tempURL = null;

    const fetchFile = async () => {
      if (!msg.fileKey || !token || !conversationId) {
        setIsLoading(false);
        return;
      }

      // Optimistic blob shortcut
      if (msg.isOptimistic && msg.fileKey.startsWith('blob:')) {
        setObjectURL(msg.fileKey);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const fileProxyUrl = `${API_BASE_URL}/files/${msg.fileKey}?conversationId=${conversationId}`;

      try {
        const response = await fetch(fileProxyUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        tempURL = URL.createObjectURL(blob);

        if (isMounted) setObjectURL(tempURL);
      } catch (error) {
        console.error('Error fetching file:', error);
        toast.error("File Error", { description: "Could not load file." });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFile();

    return () => {
      isMounted = false;
      if (tempURL && tempURL.startsWith('blob:')) {
        URL.revokeObjectURL(tempURL);
      }
    };
  }, [msg.fileKey, token, conversationId, API_BASE_URL, msg.isOptimistic]);

  if (isLoading) {
    return (
      <div className="flex items-center p-2">
        {msg.fileType === 'application/pdf'
          ? <FileText className="h-6 w-6 text-red-500 mr-2" />
          : <Paperclip className="h-6 w-6 text-muted-foreground mr-2" />}
        <span className="text-muted-foreground flex-grow truncate">
          Loading {msg.originalFileName || 'Attachment'}...
        </span>
      </div>
    );
  }

  if (!objectURL) return null;

  // Image preview logic
  if (msg.fileType && msg.fileType.startsWith('image/')) {
    return (
      <div className="relative group">
        <a href={objectURL} target="_blank" rel="noopener noreferrer">
          <img
            src={objectURL}
            alt={msg.originalFileName || 'Attachment'}
            className="max-w-[250px] h-auto rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.alt = 'Image failed to load.';
              e.target.style = 'width: 250px; height: auto; border: 1px solid #ccc; background: #f0f0f0; padding: 10px;';
            }}
          />
        </a>
        <a
          href={objectURL}
          download={msg.originalFileName || 'image'}
          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    );
  }

  // Other file types (PDF, docs, zips)
  return (
    <div className="flex items-center p-2">
      {msg.fileType === 'application/pdf'
        ? <FileText className="h-6 w-6 text-red-500 mr-2" />
        : <Paperclip className="h-6 w-6 text-muted-foreground mr-2" />}
      <a
        href={objectURL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 hover:underline flex-grow truncate"
      >
        {msg.originalFileName || 'Attachment'}
      </a>
      <a
        href={objectURL}
        download={msg.originalFileName || 'file'}
        className="ml-2 text-muted-foreground hover:text-primary"
      >
        <Download className="h-5 w-5" />
      </a>
    </div>
  );
};

export default FileDisplay;
