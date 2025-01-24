import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<(User & { password?: string }) | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'usuario',
    status: true,
  });
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role === 'usuario') {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('status', true)
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        toast.error('Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;

      // Create user profile with password
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user?.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          password: newUser.password,
          status: true,
        },
      ]);

      if (profileError) throw profileError;

      toast.success('Usuário criado com sucesso!');
      setNewUser({ name: '', email: '', password: '', role: 'usuario', status: true });
      const { data: updatedUsers } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (updatedUsers) {
        setUsers(updatedUsers);
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updates = {
        name: editingUser.name,
        role: editingUser.role,
        status: editingUser.status,
        ...(editingUser.password ? { password: editingUser.password } : {}),
      };

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', editingUser.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso!');
      setEditingUser(null);
      const { data: updatedUsers } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (updatedUsers) {
        setUsers(updatedUsers);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja desativar este usuário?')) {
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: false })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('Usuário desativado com sucesso!');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      toast.error(error.message || 'Erro ao desativar usuário');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#2563EB] mb-6">Gerenciar Usuários</h1>

      {/* Form para criar novo usuário */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#2563EB] mb-4">Criar Novo Usuário</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#64748B]">Nome</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#64748B]">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#64748B]">Senha</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#64748B]">Tipo de Usuário</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="usuario">Usuário</option>
                <option value="ti">TI</option>
                {currentUser?.role === 'admin' && (
                  <option value="admin">Administrador</option>
                )}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
            >
              Criar Usuário
            </button>
          </div>
        </form>
      </div>

      {/* Modal de edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Editar Usuário</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#64748B]">Nome</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B]">
                  Senha (deixe em branco para manter a atual)
                </label>
                <input
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B]">Tipo de Usuário</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                  className="mt-1 block w-full rounded-md border-secondary-lighter shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="usuario">Usuário</option>
                  <option value="ti">TI</option>
                  {currentUser?.role === 'admin' && (
                    <option value="admin">Administrador</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1E40AF]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#2563EB]">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#64748B]">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-[#2563EB] hover:text-[#1E40AF]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Desativar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}