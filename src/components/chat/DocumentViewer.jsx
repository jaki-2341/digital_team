
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, FileInput, Presentation } from "lucide-react";

export default function DocumentViewer({ documentData, onClose, onGeneratePresentation, onViewPresentation }) {
  const { title, text: htmlContent, presentation } = documentData || { id: null, title: 'Document', text: '' };

  if (!documentData) {
    return null;
  }
  
  const hasPresentation = !!presentation;

  return (
    <div className="h-full flex flex-col bg-card">
      <header className="p-4 border-b shrink-0 flex items-center justify-between gap-4">
        <div className="flex-grow min-w-0">
          <h2 className="text-lg font-headline truncate" title={title}>{title}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {hasPresentation ? (
               <Button variant="outline" size="sm" onClick={onViewPresentation}>
                 <Presentation size={14} />
                 View Presentation
               </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onGeneratePresentation}>
                  <FileInput size={14} />
                  Generate Presentation
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X size={18} />
                <span className="sr-only">Close document view</span>
            </Button>
        </div>
      </header>
      <ScrollArea className="flex-grow">
         <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className={cn(
                "p-4 sm:p-6 break-words",
                "prose dark:prose-invert prose-sm sm:prose-base",
                "max-w-none"
            )}
        />
      </ScrollArea>
    </div>
  );
}
