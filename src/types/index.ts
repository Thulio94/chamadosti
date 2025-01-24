export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ti' | 'usuario';
  status: boolean;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'aberto' | 'em_processo' | 'fechado' | 'reaberto';
  user_id: string;
  ti_id: string | null;
  created_at: string;
  updated_at: string;
};

export interface Connection {
  id: string;
  instance_name: string;
  number: string | null;
  webhook_url: string | null;
  webhook_by_events: boolean;
  events: string[];
  status: 'connected' | 'disconnected' | 'pending';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}