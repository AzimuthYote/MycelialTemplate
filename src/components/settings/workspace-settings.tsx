import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface WorkspaceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  currentModel: string;
  onModelChange: (model: string) => void;
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
}

const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  console.log("Fetching OpenRouter models...");
  const openRouterKey = localStorage.getItem("openRouterKey");
  
  if (!openRouterKey) {
    console.error("OpenRouter API key not found");
    throw new Error("OpenRouter API key not found");
  }

  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      "Authorization": `Bearer ${openRouterKey}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch models:", response.statusText);
    throw new Error("Failed to fetch models");
  }

  const data = await response.json();
  console.log("OpenRouter models fetched:", data);
  return data.data || [];
};

export function WorkspaceSettings({
  open,
  onOpenChange,
  workspaceId,
  currentModel,
  onModelChange,
}: WorkspaceSettingsProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel);

  const { data: models, isLoading, error } = useQuery({
    queryKey: ["openRouterModels"],
    queryFn: fetchOpenRouterModels,
    enabled: open && !!localStorage.getItem("openRouterKey"),
  });

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    onModelChange(value);
    toast.success("Model updated successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Selection</label>
            <Select
              value={selectedModel}
              onValueChange={handleModelChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {error ? (
                  <SelectItem value="error">Error loading models</SelectItem>
                ) : isLoading ? (
                  <SelectItem value="loading">Loading models...</SelectItem>
                ) : (
                  models?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500">
                Error loading models. Please check your API key.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
