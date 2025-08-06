"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSliders } from "lucide-react";
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';

const keySections = [
    "1. Title Slide (Generated from document)",
    "2. Session Overview (Default)",
    "3. Work-Related Tip (Generated from document)",
    "4. Work-Related Tip - Continuation (Generated from document)",
    "5. General Selling Tip (Generated from document)",
    "6. Featured Service of the Night (From your input below)",
    "7. Service FAQ (Generated based on Featured Service)",
    "8. Announcement (From your input below, optional)",
    "9. Motivational Quote (Generated from document)",
    "10. Thank You (Default)"
].join("\n");

export default function PresentationPromptModal({ isOpen, onClose, onGenerate, documentTitle }) {
  const [featuredService, setFeaturedService] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementClosing, setAnnouncementClosing] = useState('');

  const handleGenerateClick = () => {
    if (!featuredService) {
        // Basic validation feedback
        alert("Please enter a Featured Service.");
        return;
    }
    onGenerate({
      featuredService,
      announcementTitle,
      announcementContent,
      announcementClosing,
    });
  };
  
  // Reset local state when the modal opens or closes
  useEffect(() => {
    if (!isOpen) {
        setFeaturedService('');
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAnnouncementClosing('');
    }
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
          <>
            <DialogHeader>
              <DialogTitle>Craft Your Presentation</DialogTitle>
              <DialogDescription>
                Provide a few key details. The AI will generate the rest of the content based on the document <span className="font-bold">"{documentTitle}"</span>.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="featuredService" className="text-base">Featured Service</Label>
                        <p className="text-sm text-muted-foreground mb-2">This is required. The AI will create an FAQ slide based on this service.</p>
                        <Input 
                            id="featuredService" 
                            value={featuredService} 
                            onChange={(e) => setFeaturedService(e.target.value)} 
                            placeholder="e.g., Logo Design Services" 
                            required 
                        />
                    </div>

                    <Separator />
                    
                    <div>
                        <Label className="text-base">Announcement (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-3">Leave blank and the AI will create a generic sales-related announcement.</p>
                         <div className="space-y-3">
                            <div>
                                <Label htmlFor="announcementTitle" className="text-xs font-semibold">Title</Label>
                                <Input id="announcementTitle" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="e.g., System Maintenance Scheduled" />
                            </div>
                             <div>
                                <Label htmlFor="announcementContent" className="text-xs font-semibold">Content</Label>
                                <Textarea id="announcementContent" value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} placeholder="Please be advised that our systems will undergo maintenance..." className="min-h-[80px]" />
                            </div>
                             <div>
                                <Label htmlFor="announcementClosing" className="text-xs font-semibold">Closing Message</Label>
                                <Input id="announcementClosing" value={announcementClosing} onChange={(e) => setAnnouncementClosing(e.target.value)} placeholder="Your prompt attention is appreciated." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" onClick={handleGenerateClick}>
                <FileSliders className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </DialogFooter>
          </>
      </DialogContent>
    </Dialog>
  );
}