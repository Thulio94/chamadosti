import axios, { AxiosInstance } from 'axios';

interface Instance {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid: string;
  profileName: string | null;
}

class EvolutionApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateConfig(config: { serverUrl: string; apiKey: string }) {
    this.api = axios.create({
      baseURL: config.serverUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey
      }
    });
  }

  async testConnection() {
    try {
      const response = await this.api.get('/');
      return response.data?.status === 200;
    } catch (error) {
      throw error;
    }
  }

  async listInstances() {
    try {
      const response = await this.api.get<Instance[]>('/instance/fetchInstances');

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map(instance => ({
        instance_name: instance.name,
        status: instance.connectionStatus,
        profile_name: instance.profileName,
        instance_id: instance.id
      }));
    } catch (error) {
      throw error;
    }
  }
}

export const evolutionApi = new EvolutionApiService();