
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import PresentationModal from './PresentationModal';
import DocumentViewer from './DocumentViewer';
import FullScreenLoader from './FullScreenLoader';
import PresentationPromptModal from './PresentationPromptModal';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Sun, Moon, Sparkles, WandSparkles, BarChart3, FilePenLine, MessageSquare, Trash2, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { formatDocument } from '@/ai/flows/format-document-flow';
import { createSlideContent } from '@/ai/flows/create-slide-content-flow';
import { generatePresentation } from '@/ai/flows/generate-presentation-flow';
import { Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";


const promptStarters = [
  {
    icon: <Sparkles size={24} className="text-primary" />,
    title: "Introduce AI at Work",
    prompt: "Research the best strategies for introducing AI into a team's workflow, focusing on communication, training, and addressing potential concerns.",
  },
  {
    icon: <WandSparkles size={24} className="text-primary" />,
    title: "Effective AI Prompts",
    prompt: "I need to train my team on how to ask AI better questions. Research the key principles of effective prompt engineering for business users.",
  },
  {
    icon: <BarChart3 size={24} className="text-primary" />,
    title: "Analyze AI's Impact",
    prompt: "Research and summarize the potential impact of generative AI on the digital marketing industry, including key opportunities and risks.",
  },
];

const loadingMessages = [
  "Thinking... Please wait a moment.",
  "Just a moment while I process that.",
  "Analyzing your request right now.",
  "Let me think about that for you.",
  "Crafting the perfect response now.",
  "Consulting my digital brain for you.",
];


export default function ChatLayout() {
  const [chatHistory, setChatHistory] = useState({});
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPresentationLoading, setIsPresentationLoading] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [presentationData, setPresentationData] = useState({ html: null, audio: [], sourceDocumentId: null });
  const [documentInView, setDocumentInView] = useState(null);
  const [documentToPrompt, setDocumentToPrompt] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [webhookUrl, setWebhookUrl] = useState('');

  const messagesEndRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { state: sidebarState, isMobile, setOpen } = useSidebar();
  
  useEffect(() => {
    // In Next.js, environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
    setWebhookUrl(process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://pro-aiteam-dev.app.n8n.cloud/webhook/a9c1cca5-e09a-4db9-9bba-8f003a372cd7");
  }, []);

  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setCurrentLoadingMessage(
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        );
      }, 2000);
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      const savedSessionId = sessionStorage.getItem('activeChatSessionId');
      
      const history = savedHistory ? JSON.parse(savedHistory) : {};
      setChatHistory(history);

      if (savedSessionId && history[savedSessionId]) {
        setActiveSessionId(savedSessionId);
      }
    } catch (error) {
      console.error("Failed to load chat history from storage:", error);
      setChatHistory({});
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  // Save active session ID to sessionStorage
  useEffect(() => {
    if (activeSessionId) {
      sessionStorage.setItem('activeChatSessionId', activeSessionId);
    }
  }, [activeSessionId]);

  // Save chat history to localStorage
  useEffect(() => {
    if (!historyLoaded) return;
    
    if (Object.keys(chatHistory).length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } else {
        localStorage.removeItem('chatHistory');
    }
  }, [chatHistory, historyLoaded]);

  const getSortedSessions = useCallback((history) => {
    return Object.entries(history).sort(([idA, sessionA], [idB, sessionB]) => {
      const a_ts = sessionA.messages.length > 0 ? new Date(sessionA.messages[sessionA.messages.length - 1].timestamp).getTime() : new Date(sessionA.createdAt || 0).getTime();
      const b_ts = sessionB.messages.length > 0 ? new Date(sessionB.messages[sessionB.messages.length - 1].timestamp).getTime() : new Date(sessionB.createdAt || 0).getTime();
      return b_ts - a_ts;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    const sortedSessions = getSortedSessions(chatHistory);
    
    if (sortedSessions.length > 0) {
      const [latestSessionId, latestSession] = sortedSessions[0];
      if (latestSession.messages.length === 0 && latestSession.title === 'New Chat') {
        setActiveSessionId(latestSessionId);
        setDocumentInView(null);
        return latestSessionId;
      }
    }
  
    const newSessionId = crypto.randomUUID();
    const newSession = {
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
  
    setChatHistory(prev => ({
      ...prev,
      [newSessionId]: newSession
    }));
    setActiveSessionId(newSessionId);
    setDocumentInView(null);
    return newSessionId;
  }, [chatHistory, getSortedSessions]);

  // Effect to manage session integrity
  useEffect(() => {
    if (!historyLoaded) return;

    const historyKeys = Object.keys(chatHistory);

    if (historyKeys.length === 0 && !isLoading) {
        handleNewChat();
        return;
    }
    
    if (!activeSessionId || !chatHistory[activeSessionId]) {
      const sortedSessions = getSortedSessions(chatHistory);
      const newActiveId = sortedSessions.length > 0 ? sortedSessions[0][0] : null;

        if (newActiveId) {
          setActiveSessionId(newActiveId);
        }
    }
  }, [historyLoaded, chatHistory, activeSessionId, isLoading, handleNewChat, getSortedSessions]);


  const messages = chatHistory[activeSessionId]?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSelectChat = (sessionId) => {
    setActiveSessionId(sessionId);
    setDocumentInView(null);
  };

  const handleDeleteChat = (sessionIdToDelete) => {
    setChatHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[sessionIdToDelete];
      return newHistory;
    });
    setDocumentInView(null);
  };

  const addBotMessageToChat = useCallback((text, sessionId, type = 'text', data = {}) => {
    const targetSessionId = sessionId || activeSessionId;
    if (!targetSessionId) return;

    const botMessage = {
      id: String(Date.now() + Math.random()),
      text: String(text),
      sender: 'bot',
      timestamp: new Date(),
      type: type,
      ...data,
    };
    
    setChatHistory(prev => {
      const newHistory = { ...prev };
      const session = newHistory[targetSessionId] ? { ...newHistory[targetSessionId] } : { title: 'New Chat', messages: [] };
      session.messages = [...(session.messages || []), botMessage];
      newHistory[targetSessionId] = session;
      return newHistory;
    });
  }, [activeSessionId]);

  const handleSendMessage = async (text, attachedFile = null) => {
    if (!webhookUrl) {
      addBotMessageToChat(
        "I'm sorry, the webhook URL is not configured. Please contact support.",
        activeSessionId
      );
      return;
    }
    
    const currentSessionId = activeSessionId || handleNewChat();
    setDocumentInView(null);

    let userMessageText = text;
    if (attachedFile && attachedFile instanceof File) {
       userMessageText = `${text || ''}${text ? '\n\n' : ''}📎 File attached: ${attachedFile.name}`;
    }
    
    if (!userMessageText && attachedFile) {
        userMessageText = `📎 File attached: ${attachedFile.name}`;
    }

    const newMessage = {
      id: String(Date.now()),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    
    setChatHistory(prev => {
      const newHistory = { ...prev };
      const session = newHistory[currentSessionId] ? { ...newHistory[currentSessionId] } : { title: 'New Chat', messages: [], createdAt: new Date().toISOString() };
      session.messages = [...(session.messages || []), newMessage];
      if (session.messages.length === 1 && text) {
        session.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
      }
      newHistory[currentSessionId] = session;
      return newHistory;
    });

    setIsLoading(true);

    let botResponse;
    

    try {
      let requestBody;
      const requestHeaders = {};

      const payload = { message: text, sessionId: currentSessionId };
      
      if (attachedFile && attachedFile instanceof File) {
        const formData = new FormData();
        formData.append('message', text || '');
        formData.append('sessionId', currentSessionId);
        
        const fileName = attachedFile.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        formData.append('fileType', fileExtension);
        
        formData.append('file', attachedFile, attachedFile.name);
        requestBody = formData;
      } else {
        requestBody = JSON.stringify(payload);
        requestHeaders['Content-Type'] = 'application/json';
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const responseData = await response.json();
        
          if (responseData.data_result) { 
            const contentToFormat = typeof responseData.data_result === 'object' ? JSON.stringify(responseData.data_result, null, 2) : String(responseData.data_result);
            const formattedDoc = await formatDocument(contentToFormat);
            botResponse = {
              id: String(Date.now() + Math.random()),
              sender: 'bot',
              timestamp: new Date(),
              type: 'document',
              title: formattedDoc.title,
              text: formattedDoc.html,
              rawData: contentToFormat,
            };
          } else if (responseData.message) {
              botResponse = {
                  id: String(Date.now() + Math.random()),
                  text: responseData.message,
                  sender: 'bot',
                  timestamp: new Date(),
                  type: 'text',
              };
          } else {
            botResponse = {
              id: String(Date.now() + Math.random()),
              text: "I received a response, but couldn't understand it.",
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
            };
          }
        } else {
          const errorText = await response.text();
          console.error(`Webhook returned non-JSON response: ${response.status}`, errorText);
          botResponse = {
            id: String(Date.now() + Math.random()),
            text: `I'm sorry, I received an unexpected response from the server. Please try again.`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
          };
        }
      } else {
        const errorText = await response.text();
        console.error(`Error from webhook: ${response.status} ${response.statusText}`, errorText);
        botResponse = {
          id: String(Date.now() + Math.random()),
          text: `I'm sorry, I encountered an error (Status: ${response.status}). Please try sending your message again. If the issue continues, please start a new chat.`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
        };
      }
    } catch (error) {
      console.error("Network or other error:", error);
       botResponse = {
          id: String(Date.now() + Math.random()),
          text: "An unexpected network error occurred. Please try sending your message again. If the issue continues, please start a new chat.",
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
        };
    } finally {
        setIsLoading(false); 
    }
    
    setChatHistory(prev => {
        const newHistory = { ...prev };
        const session = { ...newHistory[currentSessionId] };
        session.messages = [...(session.messages || []), botResponse];
        newHistory[currentSessionId] = session;
        return newHistory;
      });
  };

  const handleGeneratePowerpoint = async (promptOptions) => {
    if (!documentToPrompt) return;

    const { id: documentId, rawData, text: htmlContent } = documentToPrompt;
    
    setIsPromptModalOpen(false);
    setIsPresentationLoading(true);

    try {
      const contentRequest = {
        sourceText: rawData || htmlContent,
        ...promptOptions, 
      };

      const slideContentResponse = await createSlideContent(contentRequest);

      const presentationResponse = await generatePresentation({
        slideContent: slideContentResponse,
      });

      handlePowerpointGenerated(presentationResponse, documentId);
    } catch (error) {
      console.error("Error generating PowerPoint:", error);
      addBotMessageToChat(
        `An error occurred while generating the PowerPoint: ${error.message || 'Unknown error'}. Please check the console for details.`,
        activeSessionId
      );
    } finally {
      setIsPresentationLoading(false);
      setDocumentToPrompt(null);
    }
  };

  const handlePowerpointGenerated = (responseData, documentId) => {
    let presentationPayload = null;
    if (responseData.presentation) {
      presentationPayload = {
        html: responseData.presentation,
        audio: responseData.audio || [],
      };
    } else {
      addBotMessageToChat(
        responseData.result || "An error occurred generating the presentation.",
        activeSessionId
      );
      return;
    }
  
    setChatHistory(prev => {
      const newHistory = { ...prev };
      const session = { ...newHistory[activeSessionId] };
      
      const messageIndex = session.messages.findIndex(msg => msg.id === documentId);
      
      if (messageIndex > -1) {
        const updatedMessage = {
          ...session.messages[messageIndex],
          presentation: presentationPayload,
        };
        session.messages[messageIndex] = updatedMessage;
        
        if (documentInView?.id === documentId) {
          setDocumentInView(updatedMessage);
        }
        
        handleViewPresentation(updatedMessage);
      }
      
      newHistory[activeSessionId] = session;
      return newHistory;
    });
  };

  const handleOpenPromptModal = (documentMessage) => {
    setDocumentToPrompt(documentMessage);
    setIsPromptModalOpen(true);
  };
  
  const handleViewPresentation = (message) => {
    const presentationHtml = message.presentation?.html || message.presentation;
    const presentationAudio = message.presentation?.audio || message.audio || [];
    setPresentationData({ html: presentationHtml, audio: presentationAudio, sourceDocumentId: message.id });
    setIsPresentationModalOpen(true);
  };
  
  const handleDocumentExpand = (message) => {
    setDocumentInView(message);
    if (sidebarState === 'expanded' && !isMobile) {
      setOpen(false);
    }
  };

  const handleDocumentClose = () => {
    setDocumentInView(null);
  }
  
  const handleRegeneratePresentation = (documentId) => {
    const session = chatHistory[activeSessionId];
    if (!session) return;
    
    const documentMessage = session.messages.find(msg => msg.id === documentId);
    if (!documentMessage) return;
    
    setIsPresentationModalOpen(false);
    setDocumentToPrompt(documentMessage);
    setIsPromptModalOpen(true);
  };

  const showCenteredInput = messages.length === 0;

  return (
    <>
      <FullScreenLoader isLoading={isPresentationLoading} label="Building Your Presentation..." />
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className={cn(
            "flex items-center",
            sidebarState === 'collapsed' ? "justify-end" : "justify-between"
          )}>
            {sidebarState !== 'collapsed' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Bot />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Digital Team</TooltipContent>
              </Tooltip>
            )}
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleNewChat} className="h-10 justify-start" tooltip="New Chat">
                        <FilePenLine />
                        <span>New Chat</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <div className="group-data-[collapsible=icon]:hidden">
              <div className="mt-4 px-2 text-sm font-medium text-muted-foreground">Recent</div>
              <SidebarMenu>
                  {getSortedSessions(chatHistory).map(([id, session]) => (
                      <SidebarMenuItem key={id}>
                          <SidebarMenuButton 
                            onClick={() => handleSelectChat(id)} 
                            isActive={id === activeSessionId}
                            className="h-10 justify-start"
                          >
                              <MessageSquare className="shrink-0" />
                              <span className="truncate flex-grow">{session.title}</span>
                          </SidebarMenuButton>
                           <SidebarMenuAction 
                              showOnHover 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(id);
                              }}
                           >
                              <Trash2 />
                           </SidebarMenuAction>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <header className="p-4 border-b border-border shadow-sm bg-card sticky top-0 z-10 flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <h1 className="text-xl font-headline font-semibold text-foreground">Digital Team</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsInfoModalOpen(true)} aria-label="How to use">
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
            </div>
          </header>
          
          <main className="flex-grow flex flex-row overflow-hidden">
             <div className={cn(
                "flex flex-col transition-all duration-300",
                documentInView ? "w-full md:w-1/2" : "w-full"
            )}>
              {showCenteredInput && !documentInView ? (
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                  <Bot size={48} className="text-primary mb-4" />
                  <h2 className="text-3xl font-semibold text-foreground mb-2 font-headline">
                    How can I help you today?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-10 max-w-md">
                    Ask me anything, or start with one of the examples below.
                  </p>
                  
                  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {promptStarters.map((starter, index) => (
                          <Card 
                              key={index} 
                              className="p-6 text-left hover:bg-accent cursor-pointer transition-colors duration-200 border-0"
                              onClick={() => handleSendMessage(starter.prompt)}
                            >
                              <div className="flex items-start gap-4">
                                {starter.icon}
                                <div>
                                    <h3 className="font-semibold text-card-foreground mb-1">{starter.title}</h3>
                                    <p className="text-sm text-muted-foreground">{starter.prompt}</p>
                                </div>
                              </div>
                          </Card>
                      ))}
                  </div>

                  <div className="w-full max-w-xl">
                    <ChatInput onSendMessage={handleSendMessage} showFooter={false} />
                    <p className="text-xs text-muted-foreground text-center mt-2 px-4">Digital Team is a demo and may make mistakes. Consider checking important information.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col h-full overflow-hidden">
                  <ScrollArea className="flex-grow">
                    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
                      {messages.map((msg) => (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          onDocumentExpand={() => handleDocumentExpand(msg)}
                          onGeneratePresentation={() => handleOpenPromptModal(msg)}
                          onViewPresentation={() => handleViewPresentation(msg)}
                          activeDocumentId={documentInView?.id}
                        />
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground">
                            <Bot size={18} />
                          </div>
                          <div className="max-w-[70%] rounded-lg p-3 bg-card text-card-foreground shadow-md rounded-bl-none animate-pulse">
                            <p className="text-sm">{currentLoadingMessage}</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="border-t border-border bg-background">
                    <ChatInput onSendMessage={handleSendMessage} showFooter={!documentInView} />
                  </div>
                </div>
              )}
            </div>

            {documentInView && (
              <div className="hidden md:flex flex-col flex-1 w-1/2 border-l border-border transition-all duration-300 h-full">
                <DocumentViewer 
                  documentData={documentInView} 
                  onClose={handleDocumentClose}
                  onGeneratePresentation={() => handleOpenPromptModal(documentInView)}
                  onViewPresentation={() => handleViewPresentation(documentInView)}
                />
              </div>
            )}
          </main>

          <PresentationModal 
            isOpen={isPresentationModalOpen} 
            onClose={() => setIsPresentationModalOpen(false)} 
            presentationData={presentationData}
            onRegenerate={handleRegeneratePresentation}
          />
          
          <PresentationPromptModal
            isOpen={isPromptModalOpen}
            onClose={() => setIsPromptModalOpen(false)}
            onGenerate={handleGeneratePowerpoint}
            documentTitle={documentToPrompt?.title || ''}
          />

          <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">How to Use This Tool</DialogTitle>
                <DialogDescription>
                  Follow these steps to get the most out of the Digital Team assistant.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm text-foreground">
                  <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
                      <div>
                          <h4 className="font-semibold">Start a Conversation</h4>
                          <p className="text-muted-foreground">Simply type your question or request into the text box at the bottom and press Enter or click the Send button.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
                      <div>
                          <h4 className="font-semibold">Attach a Document</h4>
                          <p className="text-muted-foreground">Click the paperclip icon to attach a document (PDF, DOC, DOCX, TXT). The AI will process its content and provide a formatted summary and analysis.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
                      <div>
                          <h4 className="font-semibold">Generate a Presentation</h4>
                          <p className="text-muted-foreground">After a document has been processed, a "Generate Presentation" button will appear. Click it, choose your preferences, and the AI will create a slide deck for you.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">4</div>
                      <div>
                          <h4 className="font-semibold">View & Navigate</h4>
                          <p className="text-muted-foreground">Click "View Presentation" to open the slides. Use the arrows to navigate, and the "Regenerate" button to create a new version.</p>
                      </div>
                  </div>
              </div>
              <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                      If you encounter an error, please try sending your message again. If the issue persists, starting a new chat can often resolve the problem.
                  </AlertDescription>
              </Alert>
            </DialogContent>
          </Dialog>

        </div>
      </SidebarInset>
    </>
  );
}

    