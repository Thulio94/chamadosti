export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ti' | 'usuario';
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