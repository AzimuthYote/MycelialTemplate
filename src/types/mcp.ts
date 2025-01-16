export interface MCPConfig {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  config: Record<string, any>;
  is_active: boolean;
}

export interface MCPTool {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  endpoint: string;
  auth_type: string;
  auth_config?: Record<string, any>;
  is_active: boolean;
}

export interface MCPContext {
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  context_type: string;
  data: Record<string, any>;
  ttl?: string;
}

export interface MCPMessage {
  id: string;
  created_at: string;
  context_id: string;
  direction: 'incoming' | 'outgoing';
  message_type: 'request' | 'response' | 'notification' | 'error';
  content: Record<string, any>;
  metadata?: Record<string, any>;
}

export type MCPMessageHandler = (message: MCPMessage) => Promise<void>;

export interface MCPClientConfig {
  endpoint: string;
  authToken?: string;
  onMessage?: MCPMessageHandler;
  onError?: (error: Error) => void;
}
