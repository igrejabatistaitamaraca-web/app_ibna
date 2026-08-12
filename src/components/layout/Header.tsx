import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, Database, Settings, UserCheck } from 'lucide-react';

interface HeaderProps {
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenConfig }) => {
  const { profile, logout, isConfigured, demoMode } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-xs backdrop-blur-sm sm:px-6">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#002366] text-[#D4AF37] shadow-xs">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 sm:text-lg">
            Painel Administrativo IBNA
          </h1>
          <p className="hidden text-xs font-medium text-slate-500 sm:block">
            Igreja Batista Nova Aliança • Fortaleza / CE
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Connection Status Indicator */}
        <button
          onClick={onOpenConfig}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            demoMode
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : isConfigured
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
          }`}
          title="Clique para configurar conexão Supabase"
        >
          <Database className="h-3.5 w-3.5" />
          <span className="hidden md:inline">
            {demoMode ? 'Modo Demonstração' : isConfigured ? 'Supabase Conectado' : 'Chave Pendente'}
          </span>
          <Settings className="h-3.5 w-3.5 opacity-70" />
        </button>

        {/* User Info */}
        <div className="hidden sm:flex sm:items-center sm:gap-2 border-l border-slate-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300">
            {profile?.nome_completo ? profile.nome_completo.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="text-left text-xs">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <span>{profile?.nome_completo || 'Administrador IBNA'}</span>
              <UserCheck className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="text-slate-500 text-[11px] block">{profile?.email}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Sair da conta"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};
