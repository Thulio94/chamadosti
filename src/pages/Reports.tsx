import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Reports() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          updated_at,
          solicitante:user_id(name, email),
          responsavel:ti_id(name, email)
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Nenhum dado encontrado para o período selecionado');
        return;
      }

      // Preparar dados para CSV
      const csvData = data.map(ticket => ({
        id: ticket.id,
        titulo: ticket.title,
        descricao: ticket.description?.replace(/[\n;]/g, ' '), // Remove quebras de linha e ponto e vírgula
        status: ticket.status,
        solicitante: ticket.solicitante?.name || '',
        email_solicitante: ticket.solicitante?.email || '',
        responsavel_ti: ticket.responsavel?.name || '',
        email_responsavel: ticket.responsavel?.email || '',
        data_criacao: new Date(ticket.created_at).toLocaleString('pt-BR'),
        data_atualizacao: ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('pt-BR') : ''
      }));

      // Criar cabeçalho do CSV
      const headers = [
        'ID',
        'Título',
        'Descrição',
        'Status',
        'Solicitante',
        'Email do Solicitante',
        'Responsável TI',
        'Email do Responsável',
        'Data de Criação',
        'Última Atualização'
      ];

      // Converter para string CSV
      const csvString = [
        headers.join(';'),
        ...csvData.map(row => Object.values(row).join(';'))
      ].join('\n');

      // Criar e baixar o arquivo
      const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_chamados_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2563EB]">Relatórios</h1>
        <p className="text-[#64748B]">Gere relatórios de chamados por período</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-[#2563EB] text-white font-medium rounded-md hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Exportar CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
} 