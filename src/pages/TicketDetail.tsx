import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Ticket, User, Comment } from '../types';
import { toast } from 'react-hot-toast';
import { Clock, User as UserIcon, MessageSquare } from 'lucide-react';

const statusOptions = {
  aberto: 'Aberto',
  em_processo: 'Em Processo',
  fechado: 'Fechado',
  reaberto: 'Reaberto',
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    try {
      // Buscar o ticket com informações do usuário e técnico
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          *,
          user:user_id(name, email),
          ti:ti_id(name)
        `)
        .eq('id', id)
        .single();

      if (ticketError) throw ticketError;
      setTicket(ticketData);

      // Buscar os comentários com informações dos usuários
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id(name, email)
        `)
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar os dados do chamado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (updating) return;
    setUpdating(true);

    try {
      if (!user?.id) {
        throw new Error('Usuário não identificado');
      }

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await supabase
        .from('comments')
        .insert([
          {
            ticket_id: id,
            user_id: user.id,
            content: `Status alterado para: ${statusOptions[newStatus as keyof typeof statusOptions]}`,
            created_at: new Date().toISOString(),
          },
        ]);

      toast.success('Status atualizado com sucesso!');
      // Buscar os dados novamente após a atualização
      fetchTicket();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error(error?.message || 'Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      if (!user?.id) {
        throw new Error('Usuário não identificado');
      }

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            ticket_id: id,
            user_id: user.id,
            content: comment.trim(),
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      setComment('');
      toast.success('Comentário adicionado com sucesso!');
      // Buscar os dados novamente após a adição de comentário
      fetchTicket();
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(error?.message || 'Erro ao adicionar comentário');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) return null;

  // Usuário pode mudar o status se for TI ou admin, ou se for o usuário que criou e o status estiver fechado
  const canChangeStatus = user?.role === 'ti' || user?.role === 'admin' || 
    (user?.id === ticket.user_id && ticket.status === 'fechado');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-[#2563EB]">{ticket.title}</h1>
          {canChangeStatus && (
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
              disabled={updating}
            >
              {Object.entries(statusOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="text-[#64748B] mb-4">{ticket.description}</p>

        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              <span>Aberto por: {ticket.user?.name}</span>
            </div>
            {ticket.ti?.name && (
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>Técnico: {ticket.ti.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#2563EB] mb-4">Comentários</h2>
        
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{comment.user?.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhum comentário ainda.
            </p>
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adicionar comentário
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}