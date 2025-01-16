import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const GlobalSettings = () => {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");

  // Load saved values on component mount
  useEffect(() => {
    const savedOpenRouterKey = localStorage.getItem("openRouterKey");
    const savedGeminiKey = localStorage.getItem("geminiKey");
    const savedSystemPrompt = localStorage.getItem("systemPrompt");
    if (savedOpenRouterKey) setOpenRouterKey(savedOpenRouterKey);
    if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
    console.log("Loaded saved settings from localStorage");
  }, []);

  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setSystemPrompt(newPrompt);
    localStorage.setItem("systemPrompt", newPrompt);
    console.log("System prompt updated:", newPrompt);
    toast.success("System Prompt Updated");
  };

  const handleOpenRouterKeySave = () => {
    if (!openRouterKey.trim()) {
      toast.error("Please enter an OpenRouter API key");
      return;
    }
    console.log("Saving OpenRouter API key");
    localStorage.setItem("openRouterKey", openRouterKey);
    toast.success("OpenRouter API Key Saved");
  };

  const handleGeminiKeySave = () => {
    if (!geminiKey.trim()) {
      toast.error("Please enter a Gemini API key");
      return;
    }
    console.log("Saving Gemini API key");
    localStorage.setItem("geminiKey", geminiKey);
    toast.success("Gemini API Key Saved");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Global Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">API Keys</h3>
            <p className="text-sm text-muted-foreground">
              Configure your API keys for various services.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                OpenRouter API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="Enter OpenRouter API key..."
                  type="password"
                />
                <Button onClick={handleOpenRouterKeySave}>Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Google Gemini API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter Gemini API key..."
                  type="password"
                />
                <Button onClick={handleGeminiKeySave}>Save</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                System Prompt
              </label>
              <Textarea
                placeholder="Enter your system prompt here..."
                className="mt-2"
                value={systemPrompt}
                onChange={handleSystemPromptChange}
              />
              <p className="text-sm text-muted-foreground mt-2">
                This prompt will be used as the base context for all conversations.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
