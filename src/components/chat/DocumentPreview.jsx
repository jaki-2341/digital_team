
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FileText, Expand, FileInput, Presentation } from "lucide-react";

export default function DocumentPreview({ title, htmlContent, presentation, onExpand, onGeneratePresentation, onViewPresentation }) {

  const hasPresentation = !!presentation;

  return (
    <div className="w-full rounded-lg border-0 bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-3 border-b gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-grow min-w-0">
          <FileText size={16} className="text-muted-foreground flex-shrink-0" />
          <h3 className="font-semibold text-sm truncate" title={title}>{title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasPresentation ? (
             <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={onViewPresentation}>
               <Presentation size={14} />
               View Presentation
             </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={onGeneratePresentation}>
              <FileInput size={14} />
              Generate Presentation
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onExpand}>
            <Expand size={16} />
            <span className="sr-only">Expand document</span>
          </Button>
        </div>
      </div>
      <ScrollArea className="h-80">
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className={cn(
            "p-4 break-words",
            "prose dark:prose-invert prose-sm",
            "max-w-none"
          )}
        />
      </ScrollArea>
    </div>
  );
}
