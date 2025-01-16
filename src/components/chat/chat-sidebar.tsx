import { Button } from "@/components/ui/button";
import { PlusCircle, Menu, Settings, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { Thread, Workspace } from "@/types/workspace";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { WorkspaceSettings } from "@/components/settings/workspace-settings";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onThreadSelect: (thread: Thread) => void;
  activeThread: Thread | null;
}

export const ChatSidebar = ({ 
  isOpen, 
  setIsOpen, 
  onThreadSelect,
  activeThread 
}: ChatSidebarProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [openSettings, setOpenSettings] = useState<string | null>(null);

  const createNewWorkspace = () => {
    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name: "New Workspace",
      model: "gpt-3.5-turbo",
      threads: [],
      settings: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    };

    setWorkspaces((prev) => [...prev, newWorkspace]);
    toast.success("New workspace created");
  };

  const createNewThread = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    const newThread: Thread = {
      id: crypto.randomUUID(),
      name: "New Thread",
      createdAt: new Date(),
      messages: [],
      workspaceModel: workspace.model,
    };

    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id === workspaceId) {
          return {
            ...workspace,
            threads: [...workspace.threads, newThread],
          };
        }
        return workspace;
      })
    );
    toast.success("New thread created");
  };

  const handleModelChange = (workspaceId: string, model: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id === workspaceId) {
          // Update workspace model
          const updatedWorkspace = { ...workspace, model };
          // Update all threads in this workspace with the new model
          updatedWorkspace.threads = updatedWorkspace.threads.map(thread => ({
            ...thread,
            workspaceModel: model
          }));
          return updatedWorkspace;
        }
        return workspace;
      })
    );
  };

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0"
      } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r bg-card`}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={createNewWorkspace}
          >
            <PlusCircle className="h-4 w-4" />
            New Workspace
          </Button>
        </div>
        <div className="flex-1 overflow-auto space-y-2">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="p-2">
              <Accordion type="single" collapsible>
                <AccordionItem value="workspace">
                  <AccordionTrigger className="hover:no-underline">
                    {workspace.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOpenSettings(workspace.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => createNewThread(workspace.id)}
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        New Thread
                      </Button>
                      <div className="space-y-1">
                        {workspace.threads.map((thread) => (
                          <Button
                            key={thread.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start",
                              activeThread?.id === thread.id && "bg-accent"
                            )}
                            onClick={() => onThreadSelect(thread)}
                          >
                            {thread.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <WorkspaceSettings
                open={openSettings === workspace.id}
                onOpenChange={(open) => setOpenSettings(open ? workspace.id : null)}
                workspaceId={workspace.id}
                currentModel={workspace.model}
                onModelChange={(model) => handleModelChange(workspace.id, model)}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
