import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Plus, List, Users, LogOut, AlignJustify, PanelLeftClose, PanelLeft, MessageCircle, Menu, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from './Footer';

export function Layout() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} className="text-[#2563EB]" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.name ? `Olá, ${user.name}` : 'Menu'}
        </h1>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:relative min-h-screen bg-[#2563EB] shadow-lg transition-all duration-300 ease-in-out z-30
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
            ${isSidebarOpen ? 'w-64' : 'lg:w-20'} 
          `}
        >
          <div className="p-4 flex justify-between items-center relative">
            {/* Toggle Button - Only visible on desktop */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block absolute -right-3 top-6 z-40 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} className="text-[#2563EB]" /> : <PanelLeft size={20} className="text-[#2563EB]" />}
            </button>

            <h1 className={`text-xl font-bold text-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              {isSidebarOpen && user?.name && `Seja bem-vindo, ${user.name}`}
            </h1>
          </div>

          <nav className="mt-4">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Dashboard"}
              </span>
            </Link>
            <Link
              to="/novo-chamado"
              className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
              title="Criar Chamado"
            >
              <Plus className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Criar Chamado"}
              </span>
            </Link>
            <Link
              to="/meus-chamados"
              className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
              title="Meus Chamados"
            >
              <List className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Meus Chamados"}
              </span>
            </Link>
            <Link
              to="/fila"
              className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
              title="Fila de Chamados"
            >
              <AlignJustify className="w-5 h-5 min-w-[20px]" />
              <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {isSidebarOpen && "Fila de Chamados"}
              </span>
            </Link>
            {user?.role !== 'usuario' && (
              <>
                <Link
                  to="/conexoes-whatsapp"
                  className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
                  title="Conexões WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 min-w-[20px]" />
                  <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    {isSidebarOpen && "Conexões WhatsApp"}
                  </span>
                </Link>
                <Link
                  to="/usuarios"
                  className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
                  title="Gerenciar Usuários"
                >
                  <Users className="w-5 h-5 min-w-[20px]" />
                  <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    {isSidebarOpen && "Gerenciar Usuários"}
                  </span>
                </Link>
                <Link
                  to="/relatorios"
                  className="flex items-center px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
                  title="Relatórios"
                >
                  <FileText className="w-5 h-5 min-w-[20px]" />
                  <span className={`ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    {isSidebarOpen && "Relatórios"}
                  </span>
                </Link>
              </>
            )}
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-white font-semibold hover:bg-[#1E40AF]"
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
        <main className={`flex-1 p-4 lg:ml-0 pb-16 ${isMobile ? 'mt-16' : ''}`}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}