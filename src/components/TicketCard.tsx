import React from 'react';
import { Clock, User } from 'lucide-react';
import { Ticket } from '../types';

const statusColors = {
  aberto: 'bg-yellow-100 text-yellow-800',
  em_processo: 'bg-blue-100 text-blue-800',
  fechado: 'bg-green-100 text-green-800',
  reaberto: 'bg-red-100 text-red-800',
};

const statusLabels = {
  aberto: 'Aberto',
  em_processo: 'Em Processo',
  fechado: 'Fechado',
  reaberto: 'Reaberto',
};

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{ticket.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
          {statusLabels[ticket.status]}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          <span>aberto por: {ticket.user?.name || 'Usuário'}</span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          <span>atribuido para: {ticket.ti?.name || 'Ti'}</span>
        </div>   
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}