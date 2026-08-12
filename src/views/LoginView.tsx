import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Database, AlertCircle, Play } from 'lucide-react';

interface LoginViewProps {
  onOpenConfig: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenConfig }) => {
  const { login, authError, enableDemoAdmin, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-[#001848] via-[#002366] to-[#001030] px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Institutional IBNA Badge */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#002366] font-black text-2xl shadow-xl border border-amber-300/40">
            IBNA
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-white sm:text-3xl">
          Painel Administrativo
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-[#D4AF37]">
          Igreja Batista Nova Aliança • Portal de Gestão
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl bg-[#001848]/90 px-6 py-8 shadow-2xl border border-blue-900/60 backdrop-blur-md sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-200">E-mail Administrativo</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@ibna.org.br"
                  className="w-full rounded-xl border border-blue-800/80 bg-[#001030]/90 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-200">Senha de Acesso</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-blue-800/80 bg-[#001030]/90 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Errors display */}
            {(errorMessage || authError) && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 p-3 border border-rose-500/30 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage || authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 text-xs font-extrabold text-[#002366] shadow-lg hover:bg-[#b89628] transition-all focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Autenticando no Supabase Auth...</span>
              ) : (
                <>
                  <span>Entrar no Painel IBNA</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Mode & Config Buttons */}
          <div className="mt-6 pt-6 border-t border-blue-900/60 space-y-3">
            <button
              type="button"
              onClick={enableDemoAdmin}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2.5 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
            >
              <Play className="h-4 w-4 text-[#D4AF37]" />
              <span>Acessar Painel em Modo Demonstração</span>
            </button>

            <button
              type="button"
              onClick={onOpenConfig}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-900/60 bg-[#001030]/60 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-blue-300/70" />
              <span>{isConfigured ? 'Ver Configuração Supabase' : 'Inserir Anon Key do Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center text-[11px] text-blue-200/70">
          Acesso restrito a pastores e administradores autorizados do IBNA.
          <br />
          Toda sessão é validada via Supabase Auth + Row Level Security (RLS).
        </p>
      </div>
    </div>
  );
};
