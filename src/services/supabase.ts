import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

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

    if (existingConfig) {
      // Se existe, atualiza
      const { data, error } = await supabase
        .from('evolution_api_config')
        .update({
          server_url: config.serverUrl,
          api_key: config.apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Se não existe, cria novo
      const { data, error } = await supabase
        .from('evolution_api_config')
        .insert({
          server_url: config.serverUrl,
          api_key: config.apiKey
        })
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

export async function getEvolutionApiConfig() {
  try {
    const { data, error } = await supabase
      .from('evolution_api_config')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return null;
  }
} 