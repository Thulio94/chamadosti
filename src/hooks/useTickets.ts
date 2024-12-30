import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Ticket } from '../types';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

interface UseTicketsProps {
  page?: number;
  limit?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

export function useTickets({ page = 1, limit = 10, startDate = null, endDate = null }: UseTicketsProps = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuthStore();

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          user:user_id(name, email),
          ti:ti_id(name)
        `, { count: 'exact' });

      // Aplicar filtro de data se fornecido
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      // Aplicar paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setTickets(data || []);
      if (count !== null) setTotalCount(count);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Configurar subscription para atualizações em tempo real
    const subscription = supabase
      .channel('tickets-realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tickets',
      }, () => {
        fetchTickets();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tickets',
      }, () => {
        fetchTickets();
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'tickets',
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [page, limit, startDate, endDate]);

  return { 
    tickets, 
    loading, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    refetch: fetchTickets 
  };
}