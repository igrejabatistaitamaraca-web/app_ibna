import React, { useState } from 'react';
import { NavigationTab } from '../../types/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Bell,
  BookOpen,
  Menu,
  X,
  Music,
  GraduationCap,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Info,
  BookMarked,
  Settings,
  LogOut,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingMembersCount: number;
  pushErrorsCount: number;
  onRefresh: () => void;
  loading: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingMembersCount,
  pushErrorsCount,
  onRefresh,
  loading,
}) => {
  const { profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  const isContentTab = ['louvor', 'estudos', 'mensagens', 'momentos', 'calendario', 'sobre'].includes(
    currentTab
  );

  return (
    <>
      {/* Mobile Bottom Bar (hidden on desktop lg) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around bg-[#001848] border-t border-blue-900/80 px-2 text-slate-200 shadow-2xl lg:hidden">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            currentTab === 'dashboard'
              ? 'text-[#D4AF37] bg-blue-900/60'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span>Início</span>
        </button>

        {/* Tab 2: Membros */}
        <button
          onClick={() => handleTabClick('membros')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            currentTab === 'membros'
              ? 'text-[#D4AF37] bg-blue-900/60'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Users className="h-5 w-5 mb-0.5" />
          <span>Membros</span>
          {pendingMembersCount > 0 && (
            <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950">
              {pendingMembersCount}
            </span>
          )}
        </button>

        {/* Tab 3: Avisos */}
        <button
          onClick={() => handleTabClick('notificacoes')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            currentTab === 'notificacoes'
              ? 'text-[#D4AF37] bg-blue-900/60'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Bell className="h-5 w-5 mb-0.5" />
          <span>Avisos</span>
          {pushErrorsCount > 0 && (
            <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
              !
            </span>
          )}
        </button>

        {/* Tab 4: Conteúdos */}
        <button
          onClick={() => handleTabClick('louvor')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            isContentTab
              ? 'text-[#D4AF37] bg-blue-900/60'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="h-5 w-5 mb-0.5" />
          <span>Conteúdos</span>
        </button>

        {/* Tab 5: Mais (Menu Drawer) */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            isMenuOpen ? 'text-[#D4AF37] bg-blue-900/60' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay for "Mais" menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-xs lg:hidden">
          <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#001848] text-white p-5 border-t border-[#D4AF37]/40 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-900/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37] text-[#002366] font-black text-xs">
                  IBNA
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Menu do Painel IBNA</h3>
                  <p className="text-[10px] text-blue-200/70">
                    {profile?.nome || profile?.nome_completo || profile?.email || 'Administrador'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-blue-200 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content Sections Grid */}
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Módulos de Conteúdo & Ministério
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleTabClick('louvor')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'louvor'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <Music className="h-4 w-4 shrink-0" />
                  <span>Dicas de Louvor</span>
                </button>

                <button
                  onClick={() => handleTabClick('estudos')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'estudos'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span>Estudos Bíblicos</span>
                </button>

                <button
                  onClick={() => handleTabClick('mensagens')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'mensagens'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span>Mensagens / Pega</span>
                </button>

                <button
                  onClick={() => handleTabClick('momentos')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'momentos'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span>Momentos IBNA</span>
                </button>

                <button
                  onClick={() => handleTabClick('calendario')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'calendario'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Calendário</span>
                </button>

                <button
                  onClick={() => handleTabClick('sobre')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'sobre'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Sobre a Igreja</span>
                </button>

                <button
                  onClick={() => handleTabClick('versiculo')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'versiculo'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <BookMarked className="h-4 w-4 shrink-0" />
                  <span>Versículo do Dia</span>
                </button>

                <button
                  onClick={() => handleTabClick('configuracoes')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-semibold min-h-[44px] transition-all ${
                    currentTab === 'configuracoes'
                      ? 'bg-[#D4AF37] text-[#002366] border-[#D4AF37]'
                      : 'bg-blue-950/60 border-blue-900/60 text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Conexão Supabase</span>
                </button>
              </div>
            </div>

            {/* Refresh & Logout Controls */}
            <div className="pt-3 border-t border-blue-900/80 flex flex-col gap-2">
              <button
                onClick={() => {
                  onRefresh();
                  setIsMenuOpen(false);
                }}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-900/70 border border-blue-800 p-3 text-xs font-bold text-white min-h-[44px]"
              >
                <RefreshCw className={`h-4 w-4 text-[#D4AF37] ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar Dados do Banco</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-rose-950/60 border border-rose-900/60 p-3 text-xs font-bold text-rose-200 hover:bg-rose-900 min-h-[44px]"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
