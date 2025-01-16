import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, Thread } from "@/types/workspace";
import { toast } from "sonner";
import { Menu } from "lucide-react";

interface ChatMainProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeThread: Thread | null;
}

export const ChatMain = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeThread,
}: ChatMainProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    setIsLoading(true);
    try {
      const openRouterKey = localStorage.getItem("openRouterKey");
      if (!openRouterKey) {
        toast.error("Please set your OpenRouter API key in settings");
        return;
      }

      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: messageInput,
        role: "user",
        createdAt: new Date(),
      };

      // Add user message to thread immediately for better UX
      activeThread.messages.push(userMessage);
      setMessageInput("");

      console.log("Sending message to OpenRouter with model:", activeThread.workspaceModel);

      // Get system prompt from localStorage
      const systemPrompt = localStorage.getItem("systemPrompt") || "";
      console.log("Using system prompt:", systemPrompt);

      // Prepare messages array for OpenRouter API
      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        ...activeThread.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }))
      ];

      // Make API call to OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": window.location.origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: activeThread.workspaceModel || "gpt-3.5-turbo",
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from OpenRouter:", data);
      
      // Create and add AI message
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.choices[0].message.content,
        role: "assistant",
        createdAt: new Date(),
      };

      activeThread.messages.push(aiMessage);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeThread) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground">
        Select a thread to start chatting
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-screen">
      <div className="flex items-center border-b px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h2 className="font-semibold ml-2">{activeThread.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeThread.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </main>
  );
};
