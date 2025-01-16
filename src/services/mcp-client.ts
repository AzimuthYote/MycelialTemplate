import { createClient } from '@supabase/supabase-js';
import { MCPClientConfig, MCPMessage, MCPContext } from '@/types/mcp';

export class MCPClient {
  private config: MCPClientConfig;
  private supabase;

  constructor(config: MCPClientConfig) {
    this.config = config;
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    console.log('Initializing MCP client with config:', config);
  }

  async initialize(): Promise<void> {
    try {
      // Create initial context
      const context = await this.createContext();
      console.log('Created initial MCP context:', context);
      
      // Subscribe to real-time updates
      this.subscribeToMessages(context.id);
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      throw error;
    }
  }

  private async createContext(): Promise<MCPContext> {
    const { data, error } = await this.supabase
      .from('mcp_contexts')
      .insert([
        {
          session_id: (await this.supabase.auth.getUser()).data.user?.id,
          context_type: 'session',
          data: {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating MCP context:', error);
      throw error;
    }

    return data;
  }

  private subscribeToMessages(contextId: string): void {
    this.supabase
      .channel('mcp_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mcp_messages',
          filter: `context_id=eq.${contextId}`,
        },
        async (payload) => {
          console.log('Received new MCP message:', payload);
          const message = payload.new as MCPMessage;
          
          if (this.config.onMessage) {
            try {
              await this.config.onMessage(message);
            } catch (error) {
              console.error('Error handling MCP message:', error);
              if (this.config.onError) {
                this.config.onError(error as Error);
              }
            }
          }
        }
      )
      .subscribe();
  }

  async sendMessage(message: Omit<MCPMessage, 'id' | 'created_at'>): Promise<MCPMessage> {
    const { data, error } = await this.supabase
      .from('mcp_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error sending MCP message:', error);
      throw error;
    }

    console.log('Sent MCP message:', data);
    return data;
  }
}
