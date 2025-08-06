
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Bot, FileText, Presentation } from "lucide-react";
import DocumentPreview from './DocumentPreview';

export default function ChatMessage({ message, onDocumentExpand, onGeneratePresentation, onViewPresentation, activeDocumentId }) {
  const { text, sender, timestamp, type = 'text', title, id, presentation, rawData } = message;
  const isUser = sender === 'user';
  const [clientTimeString, setClientTimeString] = useState('');

  useEffect(() => {
    if (timestamp) {
      try {
        const dateObject = new Date(timestamp);
        if (!isNaN(dateObject.getTime())) {
          setClientTimeString(dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setClientTimeString('');
        }
      } catch (e) {
        setClientTimeString('');
      }
    } else {
        setClientTimeString('');
    }
  }, [timestamp]);

  const renderContent = () => {
    switch(type) {
      case 'document':
        const isExpanded = activeDocumentId === id;
        if (isExpanded) {
          return (
             <Button 
                variant="outline" 
                className="h-auto py-2 px-3 bg-accent/50 hover:bg-accent/80 border-0 text-accent-foreground justify-start w-full text-left"
                onClick={() => onDocumentExpand(message)}
              >
              <FileText size={16} className="mr-2 shrink-0" />
              <span className="truncate flex-grow min-w-0">{title}</span>
            </Button>
          )
        }
        return (
          <DocumentPreview
            title={title}
            htmlContent={text}
            presentation={presentation}
            onExpand={() => onDocumentExpand(message)}
            onGeneratePresentation={onGeneratePresentation}
            onViewPresentation={onViewPresentation}
          />
        );
      case 'text':
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{text}</p>;
    }
  };

  const isDocument = type === 'document';
  const isDocumentExpanded = isDocument && activeDocumentId === id;

  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-message-appear",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/80 text-primary-foreground">
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%]",
          isDocument
            ? "" 
            : "rounded-lg p-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : isDocumentExpanded ? "border-0" : "bg-card text-card-foreground rounded-bl-none border-0"
        )}
      >
        {renderContent()}
        {!isDocument && clientTimeString && (
          <p className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}>
            {clientTimeString}
          </p>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
