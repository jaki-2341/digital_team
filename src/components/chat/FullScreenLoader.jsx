
"use client";

import { Bot } from "lucide-react";

export default function FullScreenLoader({ isLoading, label }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg shadow-2xl">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border-t-4 border-primary animate-spin"></div>
          <Bot size={48} className="absolute inset-0 m-auto text-primary" />
        </div>
        <h2 className="text-xl font-headline font-semibold text-foreground mb-2">{label || "Building Your Presentation..."}</h2>
        <p className="text-muted-foreground">The AI is crafting your slides. This may take a moment.</p>
      </div>
    </div>
  );
}
