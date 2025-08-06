
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, Pause, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function PresentationModal({ isOpen, onClose, presentationData, onRegenerate }) {
  const [slides, setSlides] = useState([]); // Stores { html: string, audioSrc?: string }
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingPresentation, setIsLoadingPresentation] = useState(true);
  const autoplayIntervalRef = useRef(null);
  const currentAudioElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCurrentAudio();
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
      setIsPlaying(false);
      return;
    }

    setIsLoadingPresentation(true);
    const { html: htmlContent, audio: parsedAudio } = presentationData || { html: null, audio: [] };
    
    if (htmlContent) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const sectionElements = Array.from(doc.getElementsByTagName('section'));
        
        const processedSlides = sectionElements.map((section, index) => {
          const audioSrc = parsedAudio[index] || null;
          // Capture the entire <section> tag with its content
          return { html: section.outerHTML, audioSrc: audioSrc };
        });

        setSlides(processedSlides);
        setCurrentSlide(0);
        setIsPlaying(false);
      } catch (error) {
        console.error("Error parsing presentation HTML:", error);
        setSlides([]);
      }
    } else {
        setSlides([]); 
    }
    setIsLoadingPresentation(false);
  }, [isOpen, presentationData]);

  const stopCurrentAudio = () => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.currentTime = 0;
      currentAudioElementRef.current.onended = null; 
      currentAudioElementRef.current = null;
    }
  };
  
  const playAudioForSlide = (slideIndex) => {
    stopCurrentAudio(); 
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);

    const slideData = slides[slideIndex];
    if (slideData && slideData.audioSrc) {
      const audioElement = new Audio(slideData.audioSrc);
      currentAudioElementRef.current = audioElement;
      audioElement.preload = "auto";
      
      audioElement.onended = () => {
        if (isPlaying) { 
          nextSlide();
        }
        currentAudioElementRef.current = null; 
      };
      
      audioElement.play().catch(e => {
        console.error("Error playing audio:", e);
        if (isPlaying) {
          autoplayIntervalRef.current = setInterval(nextSlide, 5000);
        }
      });
    } else if (isPlaying) { 
      autoplayIntervalRef.current = setInterval(nextSlide, 5000);
    }
  };


  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev < slides.length - 1 ? prev + 1 : prev;
      if (next === slides.length - 1 && isPlaying) { 
        setIsPlaying(false); 
      }
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const togglePlay = () => {
    if (slides.length === 0) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    if (newIsPlaying && currentSlide === slides.length - 1) { 
        setCurrentSlide(0); 
    }
  };

  useEffect(() => {
    if (!isOpen || slides.length === 0 || isLoadingPresentation) return;

    if (isPlaying) {
      playAudioForSlide(currentSlide);
    } else {
      stopCurrentAudio();
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    }
    
    return () => {
      stopCurrentAudio();
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [currentSlide, isPlaying, slides, isLoadingPresentation, isOpen]); 


  const renderSlide = (slide) => {
    // This div is now a simple container, and the slide.html contains the full <section>
    return (
      <div
        dangerouslySetInnerHTML={{ __html: slide.html }}
        className="w-full h-full"
      />
    ); 
  };
  
  let contentToRender;

  if (isLoadingPresentation) {
    contentToRender = (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground p-4 text-center">
        Loading presentation...
      </div>
    );
  } else if (slides.length > 0) {
    contentToRender = renderSlide(slides[currentSlide]);
  } else {
    contentToRender = (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground p-4 text-center">
        No presentation content found. Please return to chat and generate a presentation.
      </div>
    );
  }
  
  const handleRegenerate = () => {
      if (onRegenerate && presentationData?.sourceDocumentId) {
          onRegenerate(presentationData.sourceDocumentId);
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0 sm:rounded-lg shadow-2xl">
          <DialogHeader className="p-4 border-b shrink-0 bg-card flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-headline">Presentation</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-1.5">
                <RefreshCcw size={14} />
                Regenerate Presentation
            </Button>
          </DialogHeader>
          <div className="flex-grow bg-background overflow-hidden">
             {contentToRender}
          </div>
          <div className="p-3 border-t flex flex-col items-center justify-center gap-4 bg-card rounded-b-lg shrink-0">
           <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentSlide === 0 || slides.length === 0} aria-label="Previous slide">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={togglePlay} disabled={slides.length === 0} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={nextSlide} disabled={currentSlide === slides.length - 1 || slides.length === 0} aria-label="Next slide">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="h-full w-full">
            <Progress value={slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0} className="w-full h-2" />
             <div className="text-xs text-muted-foreground mt-1 text-center">
                Slide {slides.length > 0 ? currentSlide + 1 : 0} of {slides.length}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    