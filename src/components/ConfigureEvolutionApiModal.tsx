import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getEvolutionApiConfig } from '../services/evolutionApiConfig';

interface ConfigureEvolutionApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: { serverUrl: string; apiKey: string }) => Promise<void>;
  isLoading: boolean;
}

export function ConfigureEvolutionApiModal({ isOpen, onClose, onSubmit, isLoading }: ConfigureEvolutionApiModalProps) {
  const [config, setConfig] = React.useState({
    serverUrl: '',
    apiKey: ''
  });

  useEffect(() => {
    const loadSavedConfig = async () => {
      if (isOpen) {
        const savedConfig = await getEvolutionApiConfig();
        if (savedConfig) {
          setConfig({
            serverUrl: savedConfig.server_url,
            apiKey: savedConfig.api_key
          });
        }
      }
    };

    loadSavedConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Configurar Evolution API</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL do Servidor</label>
              <input
                type="url"
                required
                placeholder="http://localhost:8080"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.serverUrl}
                onChange={(e) => setConfig({...config, serverUrl: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                required
                placeholder="Sua API Key"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 