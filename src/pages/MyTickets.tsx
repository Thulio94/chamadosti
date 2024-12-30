import React, { useEffect, useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { TicketCard } from '../components/TicketCard';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  role: string;
}

export function MyTickets() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tiUsers, setTiUsers] = useState<User[]>([]);
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { tickets, loading, totalPages, currentPage, refetch } = useTickets({
    page,
    limit: 10,
    startDate,
    endDate
  });

  useEffect(() => {
    const fetchTiUsers = async () => {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'ti');
      
      if (error) {
        console.error('Erro ao buscar técnicos:', error);
        toast.error('Erro ao carregar lista de técnicos');
        return;
      }
      
      setTiUsers(usersData || []);
    };

    fetchTiUsers();
  }, []);

  const reassignTicket = async (ticketId: string, newTiId: string) => {
    if (!newTiId) return;
    
    setReassigning(ticketId);

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          ti_id: newTiId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Chamado reatribuído com sucesso!');
      await refetch();
    } catch (error: any) {
      console.error('Erro ao reatribuir chamado:', error);
      toast.error(error.message || 'Erro ao reatribuir chamado');
    } finally {
      setReassigning(null);
    }
  };

  const handleDateFilter = () => {
    setPage(1); // Reset para primeira página ao filtrar
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const myTickets = tickets.filter(ticket => 
    user?.role === 'usuario' 
      ? ticket.user_id === user.id
      : (user?.role === 'ti' || user?.role === 'admin') 
        ? ticket.ti_id === user.id 
        : false
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Chamados</h1>
        <p className="text-gray-600">
          {user?.role === 'usuario' 
            ? 'Chamados abertos por você' 
            : 'Chamados atribuídos a você'}
        </p>
      </div>

      {/* Filtros de Data */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Filtrar
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myTickets.map((ticket) => (
          <div key={ticket.id} className="flex flex-col">
            <TicketCard
              ticket={ticket}
              onClick={user?.role === 'usuario' ? undefined : () => navigate(`/chamado/${ticket.id}`)}
            />
            {user?.role === 'ti' && (
              <select 
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => reassignTicket(ticket.id, e.target.value)}
                value={ticket.ti_id || ''}
                disabled={reassigning === ticket.id}
              >
                <option value="">Reatribuir para...</option>
                {tiUsers
                  .filter(ti => ti.id !== user.id)
                  .map(ti => (
                    <option key={ti.id} value={ti.id}>{ti.name}</option>
                  ))
                }
              </select>
            )}
          </div>
        ))}
        {myTickets.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">
            Nenhum chamado encontrado.
          </p>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 rounded-md ${
                  pageNum === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}