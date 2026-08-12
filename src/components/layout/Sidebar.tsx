import React from 'react';
import { NavigationTab } from '../../types/supabase';
import {
  LayoutDashboard,
  Users,
  Bell,
  Music,
  BookOpen,
  Radio,
  Image,
  Calendar,
  Church,
  BookMarked,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingMembersCount?: number;
  pushErrorsCount?: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingMembersCount = 0,
  pushErrorsCount = 0,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      id: 'membros',
      label: 'Cadastros de Membros',
      icon: <Users className="h-5 w-5" />,
      badge: pendingMembersCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'notificacoes',
      label: 'Avisos e Notificações',
      icon: <Bell className="h-5 w-5" />,
      badge: pushErrorsCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'louvor', label: 'Dicas de Louvor', icon: <Music className="h-5 w-5" /> },
    { id: 'estudos', label: 'Estudos Bíblicos', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'mensagens', label: 'Mensagens Bíblicas', icon: <Radio className="h-5 w-5" /> },
    { id: 'momentos', label: 'Momentos e Fotos', icon: <Image className="h-5 w-5" /> },
    { id: 'calendario', label: 'Calendário', icon: <Calendar className="h-5 w-5" /> },
    { id: 'sobre', label: 'Sobre a Igreja', icon: <Church className="h-5 w-5" /> },
    { id: 'versiculo', label: 'Versículo do Dia', icon: <BookMarked className="h-5 w-5" /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Top Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-amber-400 shadow-md focus:outline-hidden"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#002366] text-slate-100 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* IBNA Institutional Logo & Header */}
        <div className="flex h-20 items-center gap-3 border-b border-blue-900/60 px-6 bg-[#001848]/60">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37] text-[#002366] font-extrabold text-lg shadow-md tracking-tight">
            IBNA
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">IGREJA BATISTA</h2>
            <p className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">Nova Aliança</p>
          </div>
        </div>

        {/* Menu Items List */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-blue-200/60 uppercase">
            Navegação Geral
          </div>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#002366] font-bold shadow-sm'
                    : 'text-slate-200 hover:bg-blue-900/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#002366]' : 'text-blue-300/80 group-hover:text-[#D4AF37]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                      isActive ? 'bg-[#002366] text-white' : item.badgeColor || 'bg-[#D4AF37] text-[#002366]'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="h-4 w-4 text-[#002366]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-blue-900/60 p-4 bg-[#001848]/40">
          <div className="rounded-lg bg-blue-950/60 p-3 text-xs text-blue-200/80 border border-blue-800/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">Painel IBNA</span>
              <span className="text-[10px] bg-[#D4AF37] text-[#002366] font-bold px-1.5 py-0.5 rounded-sm">v1.0.0</span>
            </div>
            <p className="text-[11px] text-blue-200/70">Sistema Seguro de Gestão Pastoral e Conteúdos.</p>
          </div>
        </div>
      </aside>
    </>
  );
};
