export interface Workspace {
  id: string;
  name: string;
  model: string;
  threads: Thread[];
  settings: WorkspaceSettings;
}

export interface Thread {
  id: string;
  name: string;
  createdAt: Date;
  messages: Message[];
  workspaceModel?: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

export interface WorkspaceSettings {
  temperature: number;
  maxTokens: number;
}
