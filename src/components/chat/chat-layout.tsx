import { useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMain } from "./chat-main";
import { Thread } from "@/types/workspace";

export const ChatLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onThreadSelect={setActiveThread}
        activeThread={activeThread}
      />
      <ChatMain 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        activeThread={activeThread}
      />
    </div>
  );
};
