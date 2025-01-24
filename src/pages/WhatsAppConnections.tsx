import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { evolutionApi } from '../services/evolutionApi';
import { ConfigureEvolutionApiModal } from '../components/ConfigureEvolutionApiModal';
import { saveEvolutionApiConfig, getEvolutionApiConfig } from '../services/evolutionApiConfig';

interface Instance {
  instance_name: string;
  status: string;
  profile_name: string | null;
}

export function WhatsAppConnections() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const loadInstances = async () => {
    try {
      const loadedInstances = await evolutionApi.listInstances();
      setInstances(loadedInstances);
    } catch (error) {
      // Silenciosamente falha ao carregar instâncias na inicialização
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadInstances();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigureApi = async (config: { serverUrl: string; apiKey: string }) => {
    setIsLoading(true);
    try {
      // Configura a API
      evolutionApi.updateConfig({
        serverUrl: config.serverUrl.replace(/\/$/, ''),
        apiKey: config.apiKey
      });
      
      // Testa a conexão
      const isConnected = await evolutionApi.testConnection();
      
      if (isConnected) {
        // Salva no Supabase
        await saveEvolutionApiConfig({
          serverUrl: config.serverUrl.replace(/\/$/, ''),
          apiKey: config.apiKey
        });

        // Carrega as instâncias
        await loadInstances();
        setIsConfigModalOpen(false);
        alert('Conectado com sucesso!');
      }
    } catch (error: any) {
      let mensagem = 'Erro ao conectar com o servidor. ';
      
      if (error.response) {
        if (error.response.status === 404) {
          mensagem = 'Servidor não encontrado. Verifique a URL e se o servidor está rodando.';
        } else if (error.response.status === 401) {
          mensagem = 'API Key inválida. Verifique suas credenciais.';
        } else {
          mensagem += `Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`;
        }
      } else if (error.request) {
        mensagem = 'Servidor não está respondendo. Verifique se está online.';
      } else {
        mensagem += error.message;
      }
      
      alert(mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getEvolutionApiConfig();
      if (config) {
        evolutionApi.updateConfig({
          serverUrl: config.server_url,
          apiKey: config.api_key
        });
        loadInstances();
      }
    };
    loadConfig();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conexões WhatsApp</h1>
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Atualizando...' : '🔄 Atualizar'}
          </button>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={20} />
            Configurar API
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Instância
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {instances.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma instância encontrada
                </td>
              </tr>
            ) : (
              instances.map((instance) => (
                <tr key={instance.instance_name}>
                  <td className="px-6 py-4 whitespace-nowrap">{instance.instance_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      instance.status === 'connected' ? 'bg-green-100 text-green-800' :
                      instance.status === 'disconnected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {instance.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfigureEvolutionApiModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSubmit={handleConfigureApi}
        isLoading={isLoading}
      />
    </div>
  );
} 