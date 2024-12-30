import React, { useEffect, useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { TicketCard } from '../components/TicketCard';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface StatusCount {
  aberto: number;
  'em processo': number;
  'em_processo': number;
  fechado: number;
  reaberto: number;
}

export function Dashboard() {
  const { tickets, loading, refetch } = useTickets();
  const navigate = useNavigate();
  const recentTickets = tickets.slice(0, 10);
  const [statusCount, setStatusCount] = useState<StatusCount>({
    aberto: 0,
    'em processo': 0,
    'em_processo': 0,
    fechado: 0,
    reaberto: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatusCount = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('tickets')
        .select('status')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const counts = {
        aberto: 0,
        'em processo': 0,
        'em_processo': 0,
        fechado: 0,
        reaberto: 0,
      };

      data.forEach((ticket) => {
        if (ticket.status === 'em_processo' || ticket.status === 'em processo') {
          counts['em processo']++;
        } else {
          counts[ticket.status as keyof StatusCount]++;
        }
      });

      setStatusCount(counts);
    } catch (error) {
      console.error('Erro ao buscar contagem de status:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), fetchStatusCount()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStatusCount();

    // Configurar subscription para atualizações em tempo real dos contadores
    const subscription = supabase
      .channel('dashboard-status')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
          filter: `created_at=gte.${new Date().setHours(0, 0, 0, 0)}`,
        },
        () => {
          fetchStatusCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `created_at=gte.${new Date().setHours(0, 0, 0, 0)}`,
        },
        () => {
          fetchStatusCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalEmProcesso = statusCount['em processo'] + statusCount['em_processo'];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos chamados de hoje</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          )}
          <span className="ml-2">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chamados Abertos</p>
              <p className="text-3xl font-semibold text-gray-900">{statusCount.aberto}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Processo</p>
              <p className="text-3xl font-semibold text-gray-900">{totalEmProcesso}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reabertos</p>
              <p className="text-3xl font-semibold text-gray-900">{statusCount.reaberto}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fechados</p>
              <p className="text-3xl font-semibold text-gray-900">{statusCount.fechado}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Chamados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => navigate(`/chamado/${ticket.id}`)}
            />
          ))}
          {recentTickets.length === 0 && (
            <p className="text-gray-500 col-span-2 text-center py-8">
              Nenhum chamado encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}