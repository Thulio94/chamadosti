import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';

export function NotificationListener() {
  const { user } = useAuthStore();

  // Usar o hook de notificações
  useNotifications();

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

  return null;
}