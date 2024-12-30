import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

// Função para verificar e restaurar a sessão do usuário
const initializeAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      return;
    }

    if (session?.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        return;
      }

      if (userData) {
        useAuthStore.getState().setUser({
          id: session.user.id,
          email: session.user.email!,
          name: userData.name,
          role: userData.role,
        });
      } else {
        console.warn('Nenhum dado de usuário encontrado.');
      }
    } else {
      console.warn('Nenhum usuário autenticado.');
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
};

// Inicializa a autenticação e renderiza o app
initializeAuth().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Elemento root não encontrado.');
    return;
  }
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});