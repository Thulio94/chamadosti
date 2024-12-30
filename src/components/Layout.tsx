import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Plus, List, Users, LogOut, AlignJustify, PanelLeftClose, PanelLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from './Footer';

export function Layout() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:relative min-h-screen bg-white shadow-lg transition-all duration-300 ease-in-out z-30
            ${isSidebarOpen ? 'w-64' : 'w-20'} 
          `}
        >
          <div className="p-4 flex justify-between items-center relative">
            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-6 z-40 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>

            <h1 className={`text-xl font-bold text-gray-800 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              {isSidebarOpen && `Seja bem-vindo, ${user.name}`}
            </h1>
          </div>

          <nav className="mt-4">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Dashboard"}
              </span>
            </Link>
            <Link
              to="/novo-chamado"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              title="Criar Chamado"
            >
              <Plus className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Criar Chamado"}
              </span>
            </Link>
            <Link
              to="/meus-chamados"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              title="Meus Chamados"
            >
              <List className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Meus Chamados"}
              </span>
            </Link>
            <Link
              to="/fila"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              title="Fila de Chamados"
            >
              <AlignJustify className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Fila de Chamados"}
              </span>
            </Link>
            {user?.role !== 'usuario' && (
              <Link
                to="/usuarios"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                title="Gerenciar Usuários"
              >
                <Users className="w-5 h-5 min-w-[20px]" />
                <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  {isSidebarOpen && "Gerenciar Usuários"}
                </span>
              </Link>
            )}
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
              title="Sair"
            >
              <LogOut className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Sair"}
              </span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 p-4 lg:ml-0 pb-16`}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}