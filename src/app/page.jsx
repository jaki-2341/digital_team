import ChatLayout from '@/components/chat/ChatLayout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from "@/components/ui/tooltip";


export default function HomePage() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <ChatLayout />
      </SidebarProvider>
    </TooltipProvider>
  );
}
