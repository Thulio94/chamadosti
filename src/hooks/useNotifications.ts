import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export function useNotifications() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'tickets',
          filter: `ti_id=eq.${user.id}`,
        }, 
        (payload) => {
          toast.success(`Novo chamado atribuído: ${payload.new.title}`);
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          toast(`Status do chamado atualizado: ${payload.new.status}`, {
            icon: '🔄',
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
}
