import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    title: string;
    description: string;
    technician: string;
    createdAt: string;
    supervisor: string;
  };
}

export function TicketModal({ isOpen, onClose, ticket }: TicketModalProps) {
  if (!isOpen) return null;

  const formattedDate = format(new Date(ticket.createdAt), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  const ticketInfo = `
Título: ${ticket.title}
Descrição: ${ticket.description}
Técnico: ${ticket.technician}
Data/Hora: ${formattedDate}
Supervisor: ${ticket.supervisor}
  `.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketInfo);
      alert('Informações copiadas com sucesso!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      alert('Erro ao copiar as informações');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Chamado Criado com Sucesso</h2>

        <div className="space-y-3 mb-6">
          <div>
            <div>
              <span className="font-semibold">Técnico:</span>
              <p className="mt-1">{ticket.technician}</p>
            </div>
            <span className="font-semibold">Título:</span>
            <p className="mt-1">{ticket.title}</p>
          </div>

          <div>
            <span className="font-semibold">Descrição:</span>
            <p className="mt-1">{ticket.description}</p>
          </div>
          <div>
            <span className="font-semibold">Data/Hora:</span>
            <p className="mt-1">{formattedDate}</p>
          </div>

          <div>
            <span className="font-semibold">Supervisor:</span>
            <p className="mt-1">{ticket.supervisor}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Copiar Informações
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
