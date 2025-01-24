import { supabase } from '../lib/supabase'

interface EvolutionApiConfig {
  id: string
  server_url: string
  api_key: string
  created_at: string
  updated_at: string
}

export async function saveEvolutionApiConfig(config: { serverUrl: string; apiKey: string }) {
  try {
    // Primeiro, vamos buscar se já existe uma configuração
    const { data: existingConfig } = await supabase
      .from('evolution_api_config')
      .select('*')
      .limit(1)
      .single();

    const updateData = {
      server_url: config.serverUrl,
      api_key: config.apiKey,
      updated_at: new Date().toISOString()
    };

    if (existingConfig) {
      // Se existe, atualiza
      const { data, error } = await supabase
        .from('evolution_api_config')
        .update(updateData)
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Se não existe, cria novo
      const { data, error } = await supabase
        .from('evolution_api_config')
        .insert(updateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    throw error;
  }
}

export async function getEvolutionApiConfig(): Promise<EvolutionApiConfig | null> {
  try {
    const { data, error } = await supabase
      .from('evolution_api_config')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Código para nenhum resultado encontrado
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return null;
  }
} 