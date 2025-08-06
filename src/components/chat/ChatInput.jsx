
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILE_SIZE_MB = 5; // Max file size in MB

export default function ChatInput({ onSendMessage, showFooter }) {
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // Will store the File object
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`; 
    }
  }, [inputValue]);

  const handleSend = () => {
    if (inputValue.trim() || attachedFile) {
      onSendMessage(inputValue.trim(), attachedFile);
      setInputValue('');
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px'; 
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a PDF, DOC, DOCX, or TXT file.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setAttachedFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `File size should not exceed ${MAX_FILE_SIZE_MB}MB.`,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setAttachedFile(null);
        return;
      }
      setAttachedFile(file);
    } else {
      setAttachedFile(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm p-3 md:p-4">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary p-2" onClick={handleAttachClick} aria-label="Attach file">
          <Paperclip size={20} />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
          aria-hidden="true"
          accept=".pdf,.doc,.docx,text/plain,.txt"
        />
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-grow min-h-[40px] max-h-[120px] resize-none rounded-lg border border-input bg-card p-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-sm transition-all duration-150"
          rows={1}
        />
        <Button size="icon" onClick={handleSend} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground p-2" aria-label="Send message" disabled={!inputValue.trim() && !attachedFile}>
          <Send size={20} />
        </Button>
      </div>
      {attachedFile && (
        <div className="max-w-3xl mx-auto mt-2 px-1 flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <Paperclip size={16} className="shrink-0" />
            <span className="truncate" title={attachedFile.name}>
              {attachedFile.name} ({(attachedFile.size / 1024).toFixed(2)} KB)
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveAttachment} className="h-6 w-6 shrink-0" aria-label="Remove attachment">
            <X size={16} />
          </Button>
        </div>
      )}
      {showFooter && (
        <p className="text-xs text-muted-foreground text-center mt-2 px-4">Digital Team is a demo and may make mistakes. Consider checking important information.</p>
      )}
    </div>
  );
}
