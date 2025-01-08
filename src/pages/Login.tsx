import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import Footer from '../components/Footer';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Primeiro, autenticar com o Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        throw authError;
      }

      // Buscar dados do usuário
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (queryError) {
        console.error('Erro ao buscar usuário:', queryError);
        throw queryError;
      }

      if (!users || users.length === 0) {
        console.error('Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }

      const user = users[0];

      if (user.password !== password) {
        throw new Error('Senha incorreta');
      }

      // Remove a senha antes de salvar no estado
      const { password: _, ...userWithoutPassword } = user;
      
      setUser(userWithoutPassword);
      toast.success('Login realizado com sucesso!');
      navigate('/');
      
    } catch (error: any) {
      console.error('Erro completo ao fazer login:', error);
      toast.error(error?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F1FF] to-[#F5F9FF] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="text-[#2563EB] mb-4">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6,2L2,8L12,22L22,8L18,2H6M8.5,7L10,10H14L15.5,7H8.5Z"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#2563EB]">Dimond System</h1>
          <p className="text-sm text-[#64748B] mt-2">Faça login para acessar o sistema de TI</p>
          <p className="text-sm text-[#64748B] mt-2">versão 1.2.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#64748B]">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              className="mt-1 block w-full px-3 py-2 border border-[#E2E8F0] rounded-md shadow-sm placeholder-[#94A3B8] focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#64748B]">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="mt-1 block w-full px-3 py-2 border border-[#E2E8F0] rounded-md shadow-sm placeholder-[#94A3B8] focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] transition-colors"
          >
            Entrar
          </button>

          <div className="text-center">
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-[#64748B]">
          © 2025 Dimond System  <br/>
          <div className="mt-2 flex items-center justify-center gap-1">
            DESENVOLVIMENTO by Thulio 
            <a 
              href="https://wa.me/5581982343238" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#2563EB] hover:text-[#1E40AF]"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="hover:underline">(81) 98234-3238</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}