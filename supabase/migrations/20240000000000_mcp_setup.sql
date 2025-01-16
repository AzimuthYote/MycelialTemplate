-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- MCP Configurations table
create table mcp_configs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  config jsonb not null,
  is_active boolean default true
);

-- MCP Tools table
create table mcp_tools (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  endpoint text not null,
  auth_type text not null,
  auth_config jsonb,
  is_active boolean default true
);

-- MCP Context table
create table mcp_contexts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  session_id uuid not null,
  context_type text not null,
  data jsonb not null,
  ttl timestamp with time zone
);

-- MCP Messages table
create table mcp_messages (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  context_id uuid references mcp_contexts(id),
  direction text not null check (direction in ('incoming', 'outgoing')),
  message_type text not null check (message_type in ('request', 'response', 'notification', 'error')),
  content jsonb not null,
  metadata jsonb
);

-- Add RLS policies
alter table mcp_configs enable row level security;
alter table mcp_tools enable row level security;
alter table mcp_contexts enable row level security;
alter table mcp_messages enable row level security;

-- Create policies
create policy "Allow authenticated users to read configs"
  on mcp_configs for select
  to authenticated
  using (true);

create policy "Allow authenticated users to read tools"
  on mcp_tools for select
  to authenticated
  using (true);

create policy "Allow authenticated users to read their contexts"
  on mcp_contexts for select
  to authenticated
  using (auth.uid() = session_id);

create policy "Allow authenticated users to read their messages"
  on mcp_messages for select
  to authenticated
  using (
    context_id in (
      select id from mcp_contexts 
      where session_id = auth.uid()
    )
  );

-- Create indexes
create index mcp_contexts_session_id_idx on mcp_contexts(session_id);
create index mcp_messages_context_id_idx on mcp_messages(context_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_mcp_configs_updated_at
  before update on mcp_configs
  for each row
  execute function update_updated_at_column();

create trigger update_mcp_tools_updated_at
  before update on mcp_tools
  for each row
  execute function update_updated_at_column();

create trigger update_mcp_contexts_updated_at
  before update on mcp_contexts
  for each row
  execute function update_updated_at_column();
