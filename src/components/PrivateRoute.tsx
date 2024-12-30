import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuthStore();
  
  // Se não houver usuário autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se houver usuário autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
}
