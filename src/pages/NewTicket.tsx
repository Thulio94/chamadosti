import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { TicketModal } from '../components/TicketModal';

export function NewTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tiUsers, setTiUsers] = useState<User[]>([]);
  const [selectedTi, setSelectedTi] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTiUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'ti');

      if (!error && data) {
        setTiUsers(data);
      }
    };

    fetchTiUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedTechnician = tiUsers.find(ti => ti.id === selectedTi);
      const createdAt = new Date().toISOString();

      const { data, error } = await supabase.from('tickets').insert([
        {
          title,
          description,
          user_id: user?.id,
          ti_id: selectedTi,
          status: 'aberto',
          created_at: createdAt,
        },
      ]).select().single();

      if (error) throw error;

      setCreatedTicket({
        title,
        description,
        technician: selectedTechnician?.name || 'Não especificado',
        createdAt,
        supervisor: user?.name || 'Não especificado',
      });

      setShowModal(true);
      toast.success('Chamado criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar chamado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/meus-chamados');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Chamado</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Técnico Responsável
          </label>
          <select
            value={selectedTi}
            onChange={(e) => setSelectedTi(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Selecione um técnico</option>
            {tiUsers.map((ti) => (
              <option key={ti.id} value={ti.id}>
                {ti.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Criando...' : 'Criar Chamado'}
          </button>
        </div>
      </form>

      {showModal && createdTicket && (
        <TicketModal
          isOpen={showModal}
          onClose={handleCloseModal}
          ticket={createdTicket}
        />
      )}
    </div>
  );
}